// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Test} from "forge-std/Test.sol";
import {SubnameRegistrar} from "../src/SubnameRegistrar.sol";
import {Records} from "../src/Records.sol";
import {Resolver} from "../src/Resolver.sol";

/// @title Edge Case Tests
/// @notice Tests for potential vulnerabilities and edge cases
contract EdgeCasesTest is Test {
    SubnameRegistrar public registrar;
    Records public records;
    Resolver public resolver;

    address owner = address(0x1);
    address alice = address(0x2);
    address bob = address(0x3);

    string constant PARENT_NAME = "neodate";
    string constant TLD = "eth";
    uint256 constant PRICE_PER_YEAR = 0.01 ether;
    uint256 constant ONE_YEAR = 365 days;

    function setUp() public {
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);

        registrar = new SubnameRegistrar(PARENT_NAME, TLD, PRICE_PER_YEAR, owner);
        records = new Records(address(registrar), owner);
        resolver = new Resolver(address(records), PARENT_NAME, owner);

        vm.prank(owner);
        registrar.setRecords(address(records));
    }

    /*//////////////////////////////////////////////////////////////
                      REENTRANCY PROTECTION
    //////////////////////////////////////////////////////////////*/

    function test_register_refundFailsOnReentrantReceiver() public {
        // Deploy a malicious receiver that tries to reenter
        // The refund will fail because the receive() tries to reenter
        ReentrantReceiver attacker = new ReentrantReceiver(registrar);
        vm.deal(address(attacker), 10 ether);

        // Registration should revert because refund to reentering contract fails
        vm.expectRevert("Refund failed");
        attacker.attack("attacker", ONE_YEAR, 1 ether);
    }

    function test_register_noRefundNeeded() public {
        // If exact payment, no refund call happens, so no reentrancy vector
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("exact", ONE_YEAR);
        assertEq(registrar.ownerOf(tokenId), alice);
    }

    function test_renew_multipleRenewalsPayMultipleTimes() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        // Renewing multiple times in same block should each cost PRICE_PER_YEAR
        uint256 balanceBefore = alice.balance;

        vm.startPrank(alice);
        registrar.renew{value: PRICE_PER_YEAR}(tokenId, ONE_YEAR);
        registrar.renew{value: PRICE_PER_YEAR}(tokenId, ONE_YEAR);
        registrar.renew{value: PRICE_PER_YEAR}(tokenId, ONE_YEAR);
        vm.stopPrank();

        // Should have spent 3x price
        assertEq(balanceBefore - alice.balance, 3 * PRICE_PER_YEAR);
    }

    /*//////////////////////////////////////////////////////////////
                          PRICE EDGE CASES
    //////////////////////////////////////////////////////////////*/

    function test_register_zeroPriceAllowsFreeRegistration() public {
        vm.prank(owner);
        registrar.setPrice(0);

        // Should be able to register for free
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: 0}("free", ONE_YEAR);

        assertEq(registrar.ownerOf(tokenId), alice);
    }

    function test_register_veryLargeDuration() public {
        uint256 tenYears = 10 * ONE_YEAR;
        uint256 cost = (PRICE_PER_YEAR * tenYears) / ONE_YEAR;

        vm.prank(alice);
        uint256 tokenId = registrar.register{value: cost}("longterm", tenYears);

        assertEq(registrar.expiries(tokenId), block.timestamp + tenYears);
    }

    function test_register_durationOverflow() public {
        // Try to register with a very large duration that could cause overflow
        uint256 maxDuration = type(uint256).max - block.timestamp;

        // This should revert due to overflow in cost calculation or expiry
        vm.prank(alice);
        vm.expectRevert(); // Overflow in multiplication
        registrar.register{value: 100 ether}("overflow", maxDuration);
    }

    /*//////////////////////////////////////////////////////////////
                      EXPIRY BOUNDARY CONDITIONS
    //////////////////////////////////////////////////////////////*/

    function test_transfer_atExpiryTimeStillAllowed() public {
        uint256 startTime = 1000;
        vm.warp(startTime);

        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        // Warp to exactly the expiry time
        vm.warp(startTime + ONE_YEAR);

        // At exactly expiry time, transfer is still allowed (> check, not >=)
        // This is intentional - expiry means "valid until" not "valid until before"
        vm.prank(alice);
        registrar.transferFrom(alice, bob, tokenId);

        assertEq(registrar.ownerOf(tokenId), bob);
    }

    function test_transfer_oneSecondAfterExpiryFails() public {
        uint256 startTime = 1000;
        vm.warp(startTime);

        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        // Warp to one second after expiry
        vm.warp(startTime + ONE_YEAR + 1);

        // One second after expiry, transfer should fail
        vm.prank(alice);
        vm.expectRevert(SubnameRegistrar.Expired.selector);
        registrar.transferFrom(alice, bob, tokenId);
    }

    function test_renew_exactlyAtGracePeriodEnd() public {
        uint256 startTime = 1000;
        vm.warp(startTime);

        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        // Warp to exactly the end of grace period
        vm.warp(startTime + ONE_YEAR + 90 days);

        // At exactly grace period end, should still allow renewal (> check)
        vm.prank(alice);
        registrar.renew{value: PRICE_PER_YEAR}(tokenId, ONE_YEAR);

        assertTrue(registrar.expiries(tokenId) > startTime + ONE_YEAR + 90 days);
    }

    function test_register_exactlyAfterGracePeriod() public {
        uint256 startTime = 1000;
        vm.warp(startTime);

        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        // Warp to exactly after grace period (>= check)
        vm.warp(startTime + ONE_YEAR + 90 days);

        // Should be able to re-register (>= check in available())
        vm.prank(bob);
        uint256 newTokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        assertEq(registrar.ownerOf(newTokenId), bob);
    }

    /*//////////////////////////////////////////////////////////////
                          LABEL EDGE CASES
    //////////////////////////////////////////////////////////////*/

    function test_register_maxLengthLabel() public {
        // 63 character label (DNS maximum)
        string memory maxLabel = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        assertEq(bytes(maxLabel).length, 63);

        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}(maxLabel, ONE_YEAR);

        assertEq(registrar.ownerOf(tokenId), alice);
    }

    function test_register_singleCharLabel() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("a", ONE_YEAR);

        assertEq(registrar.ownerOf(tokenId), alice);
    }

    function test_register_numericOnlyLabel() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("123456", ONE_YEAR);

        assertEq(registrar.ownerOf(tokenId), alice);
    }

    function test_register_doubleHyphen() public {
        // Double hyphen is allowed (not at start/end)
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice--bob", ONE_YEAR);

        assertEq(registrar.ownerOf(tokenId), alice);
    }

    /*//////////////////////////////////////////////////////////////
                        RECORDS EDGE CASES
    //////////////////////////////////////////////////////////////*/

    function test_records_ownerCanAlwaysSetRecords() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        // Contract owner can set records even though not token owner
        vm.prank(owner);
        records.setAddr(node, owner);

        assertEq(records.addr(node), owner);
    }

    function test_records_cannotSetRecordsForUnknownNode() public {
        bytes32 unknownNode = keccak256("unknown");

        vm.prank(alice);
        vm.expectRevert(Records.NotAuthorized.selector);
        records.setAddr(unknownNode, alice);
    }

    function test_records_approvalTransfersWithToken() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        // Approve bob for this token
        vm.prank(alice);
        registrar.approve(bob, tokenId);

        // Bob can now set records
        vm.prank(bob);
        records.setAddr(node, bob);

        // Transfer token to charlie
        address charlie = address(0x4);
        vm.prank(alice);
        registrar.transferFrom(alice, charlie, tokenId);

        // Bob's approval should be cleared, can no longer set records
        vm.prank(bob);
        vm.expectRevert(Records.NotAuthorized.selector);
        records.setAddr(node, address(0x999));
    }

    /*//////////////////////////////////////////////////////////////
                      RESOLVER EDGE CASES
    //////////////////////////////////////////////////////////////*/

    function test_resolver_supportsInterface() public {
        // addr(bytes32)
        assertTrue(resolver.supportsInterface(0x3b3b57de));
        // addr(bytes32,uint256)
        assertTrue(resolver.supportsInterface(0xf1cb7e06));
        // text(bytes32,string)
        assertTrue(resolver.supportsInterface(0x59d1d43c));
        // contenthash(bytes32)
        assertTrue(resolver.supportsInterface(0xbc1c58d1));
        // resolve(bytes,bytes) - ENSIP-10
        assertTrue(resolver.supportsInterface(0x9061b923));
        // supportsInterface
        assertTrue(resolver.supportsInterface(0x01ffc9a7));
    }

    function test_resolver_directAddrLookup() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        // Set address record
        vm.prank(alice);
        records.setAddr(node, alice);

        // Query via resolver
        assertEq(resolver.addr(node), alice);
    }

    function test_resolver_directTextLookup() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        // Set text record
        vm.prank(alice);
        records.setText(node, "url", "https://alice.com");

        // Query via resolver
        assertEq(resolver.text(node, "url"), "https://alice.com");
    }

    /*//////////////////////////////////////////////////////////////
                    CONTRACT INTEGRATION EDGE CASES
    //////////////////////////////////////////////////////////////*/

    function test_registrar_withoutRecordsContract() public {
        // Deploy new registrar without records
        SubnameRegistrar bareRegistrar = new SubnameRegistrar(PARENT_NAME, TLD, PRICE_PER_YEAR, owner);

        // Registration should still work
        vm.prank(alice);
        uint256 tokenId = bareRegistrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        assertEq(bareRegistrar.ownerOf(tokenId), alice);
    }

    function test_records_afterRegistrarChanged() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        // Owner changes the registrar in Records to a different address
        vm.prank(owner);
        records.setRegistrar(address(0xdead));

        // Alice can no longer set records (registrar calls will fail)
        vm.prank(alice);
        vm.expectRevert(); // ownerOf call to dead address will revert
        records.setAddr(node, alice);
    }
}

/// @notice Contract that attempts reentrancy on registration refund
contract ReentrantReceiver {
    SubnameRegistrar public registrar;
    bool public attacked;

    constructor(SubnameRegistrar _registrar) {
        registrar = _registrar;
    }

    function attack(string calldata label, uint256 duration, uint256 value) external {
        registrar.register{value: value}(label, duration);
    }

    receive() external payable {
        // Try to reenter on refund
        if (!attacked) {
            attacked = true;
            // Attempt to register again during refund - should fail due to reentrancy
            try registrar.register{value: msg.value}("reenter", 365 days) {
                revert("Reentrancy succeeded!");
            } catch {
                // Expected - either out of gas or proper guard
            }
        }
    }
}

/// @notice Contract that attempts reentrancy on renewal refund
contract ReentrantRenewer {
    SubnameRegistrar public registrar;
    uint256 public targetTokenId;
    uint256 public callCount;

    constructor(SubnameRegistrar _registrar, uint256 _tokenId) {
        registrar = _registrar;
        targetTokenId = _tokenId;
    }

    function attack(uint256 value) external {
        registrar.renew{value: value}(targetTokenId, 365 days);
    }

    receive() external payable {
        callCount++;
        if (callCount < 3) {
            // Try to reenter on refund
            try registrar.renew{value: msg.value}(targetTokenId, 365 days) {
                // If this succeeds, we're double-renewing
            } catch {
                // Expected
            }
        }
    }
}
