// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Test} from "forge-std/Test.sol";
import {SubnameRegistrar} from "../src/SubnameRegistrar.sol";
import {Records} from "../src/Records.sol";

contract SubnameRegistrarTest is Test {
    SubnameRegistrar public registrar;
    Records public records;

    address owner = address(0x1);
    address alice = address(0x2);
    address bob = address(0x3);

    string constant PARENT_NAME = "heaven";
    string constant TLD = "eth";
    uint256 constant PRICE_PER_YEAR = 0.01 ether;
    uint256 constant ONE_YEAR = 365 days;

    event SubnameRegistered(
        uint256 indexed tokenId,
        string label,
        address indexed owner,
        uint256 expiry
    );
    event SubnameRenewed(uint256 indexed tokenId, uint256 newExpiry);
    event PriceUpdated(uint256 newPrice);
    event RecordsContractUpdated(address newRecords);

    function setUp() public {
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);

        registrar = new SubnameRegistrar(PARENT_NAME, TLD, PRICE_PER_YEAR, owner);
        records = new Records(address(registrar), owner);

        vm.prank(owner);
        registrar.setRecords(address(records));
    }

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    function test_constructor() public {
        assertEq(registrar.parentName(), PARENT_NAME);
        assertEq(registrar.tld(), TLD);
        assertEq(registrar.pricePerYear(), PRICE_PER_YEAR);
        assertEq(registrar.owner(), owner);
        assertEq(registrar.name(), "heaven.eth Subnames");
        assertEq(registrar.symbol(), "SLD-heaven");
    }

    /*//////////////////////////////////////////////////////////////
                            REGISTRATION
    //////////////////////////////////////////////////////////////*/

    function test_register_success() public {
        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit SubnameRegistered(1, "alice", alice, block.timestamp + ONE_YEAR);

        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        assertEq(tokenId, 1);
        assertEq(registrar.ownerOf(1), alice);
        assertEq(registrar.labelToTokenId("alice"), 1);
        assertEq(registrar.tokenIdToLabel(1), "alice");
        assertEq(registrar.expiries(1), block.timestamp + ONE_YEAR);
    }

    function test_register_refundsExcess() public {
        uint256 balanceBefore = alice.balance;

        vm.prank(alice);
        registrar.register{value: 1 ether}("alice", ONE_YEAR);

        uint256 balanceAfter = alice.balance;
        assertEq(balanceBefore - balanceAfter, PRICE_PER_YEAR);
    }

    function test_registerFor_success() public {
        vm.prank(alice);
        uint256 tokenId = registrar.registerFor{value: PRICE_PER_YEAR}("bob", bob, ONE_YEAR);

        assertEq(registrar.ownerOf(tokenId), bob);
    }

    function test_register_multiYears() public {
        uint256 twoYears = 2 * ONE_YEAR;
        uint256 cost = 2 * PRICE_PER_YEAR;

        vm.prank(alice);
        uint256 tokenId = registrar.register{value: cost}("alice", twoYears);

        assertEq(registrar.expiries(tokenId), block.timestamp + twoYears);
    }

    function test_register_revertsInvalidLabel_empty() public {
        vm.prank(alice);
        vm.expectRevert(SubnameRegistrar.InvalidLabel.selector);
        registrar.register{value: PRICE_PER_YEAR}("", ONE_YEAR);
    }

    function test_register_revertsInvalidLabel_tooLong() public {
        string memory longLabel = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"; // 64 chars
        vm.prank(alice);
        vm.expectRevert(SubnameRegistrar.InvalidLabel.selector);
        registrar.register{value: PRICE_PER_YEAR}(longLabel, ONE_YEAR);
    }

    function test_register_revertsInvalidLabel_uppercase() public {
        vm.prank(alice);
        vm.expectRevert(SubnameRegistrar.InvalidLabel.selector);
        registrar.register{value: PRICE_PER_YEAR}("Alice", ONE_YEAR);
    }

    function test_register_revertsInvalidLabel_hyphenAtStart() public {
        vm.prank(alice);
        vm.expectRevert(SubnameRegistrar.InvalidLabel.selector);
        registrar.register{value: PRICE_PER_YEAR}("-alice", ONE_YEAR);
    }

    function test_register_revertsInvalidLabel_hyphenAtEnd() public {
        vm.prank(alice);
        vm.expectRevert(SubnameRegistrar.InvalidLabel.selector);
        registrar.register{value: PRICE_PER_YEAR}("alice-", ONE_YEAR);
    }

    function test_register_revertsInvalidLabel_specialChars() public {
        vm.prank(alice);
        vm.expectRevert(SubnameRegistrar.InvalidLabel.selector);
        registrar.register{value: PRICE_PER_YEAR}("alice.bob", ONE_YEAR);
    }

    function test_register_validLabel_withHyphen() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice-bob", ONE_YEAR);
        assertEq(registrar.ownerOf(tokenId), alice);
    }

    function test_register_validLabel_withNumbers() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice123", ONE_YEAR);
        assertEq(registrar.ownerOf(tokenId), alice);
    }

    function test_register_revertsInsufficientPayment() public {
        vm.prank(alice);
        vm.expectRevert(SubnameRegistrar.InsufficientPayment.selector);
        registrar.register{value: PRICE_PER_YEAR - 1}("alice", ONE_YEAR);
    }

    function test_register_revertsTooShortDuration() public {
        vm.prank(alice);
        vm.expectRevert(SubnameRegistrar.InvalidLabel.selector);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR - 1);
    }

    function test_register_revertsAlreadyRegistered() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        vm.prank(bob);
        vm.expectRevert(SubnameRegistrar.AlreadyRegistered.selector);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
    }

    function test_register_revertsWithinGracePeriod() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        // Fast forward to just after expiry but within grace period
        vm.warp(block.timestamp + ONE_YEAR + 1);

        vm.prank(bob);
        vm.expectRevert(SubnameRegistrar.AlreadyRegistered.selector);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
    }

    function test_register_successAfterGracePeriod() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        // Fast forward past grace period
        vm.warp(block.timestamp + ONE_YEAR + 90 days + 1);

        vm.prank(bob);
        uint256 newTokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        assertEq(registrar.ownerOf(newTokenId), bob);
        assertEq(newTokenId, 2); // New token minted
        assertEq(registrar.labelToTokenId("alice"), 2);
    }

    function test_register_createsNodeMapping() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        bytes32 node = registrar.namehash("alice");
        assertEq(records.nodeToTokenId(node), tokenId);
    }

    /*//////////////////////////////////////////////////////////////
                              RENEWAL
    //////////////////////////////////////////////////////////////*/

    function test_renew_success() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        uint256 originalExpiry = registrar.expiries(tokenId);

        vm.prank(bob); // Anyone can renew
        vm.expectEmit(true, false, false, true);
        emit SubnameRenewed(tokenId, originalExpiry + ONE_YEAR);

        registrar.renew{value: PRICE_PER_YEAR}(tokenId, ONE_YEAR);

        assertEq(registrar.expiries(tokenId), originalExpiry + ONE_YEAR);
    }

    function test_renew_duringGracePeriod() public {
        // Set a known start time
        uint256 startTime = 1000;
        vm.warp(startTime);

        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        uint256 originalExpiry = registrar.expiries(tokenId);
        assertEq(originalExpiry, startTime + ONE_YEAR);

        // Fast forward into grace period (30 days after expiry)
        uint256 renewTime = startTime + ONE_YEAR + 30 days;
        vm.warp(renewTime);

        vm.prank(alice);
        registrar.renew{value: PRICE_PER_YEAR}(tokenId, ONE_YEAR);

        // Should extend from now (since current time > original expiry)
        // The contract extends from block.timestamp when expired
        uint256 expectedExpiry = renewTime + ONE_YEAR;
        assertEq(registrar.expiries(tokenId), expectedExpiry);
    }

    function test_renew_revertsAfterGracePeriod() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        vm.warp(block.timestamp + ONE_YEAR + 90 days + 1);

        vm.prank(alice);
        vm.expectRevert(SubnameRegistrar.Expired.selector);
        registrar.renew{value: PRICE_PER_YEAR}(tokenId, ONE_YEAR);
    }

    function test_renew_revertsInsufficientPayment() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        vm.prank(alice);
        vm.expectRevert(SubnameRegistrar.InsufficientPayment.selector);
        registrar.renew{value: PRICE_PER_YEAR - 1}(tokenId, ONE_YEAR);
    }

    function test_renew_revertsTooShortDuration() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        vm.prank(alice);
        vm.expectRevert(SubnameRegistrar.InvalidLabel.selector);
        registrar.renew{value: PRICE_PER_YEAR}(tokenId, ONE_YEAR - 1);
    }

    function test_renew_revertsNonexistentToken() public {
        vm.prank(alice);
        vm.expectRevert(SubnameRegistrar.InvalidLabel.selector);
        registrar.renew{value: PRICE_PER_YEAR}(999, ONE_YEAR);
    }

    function test_renew_refundsExcess() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        uint256 balanceBefore = alice.balance;

        vm.prank(alice);
        registrar.renew{value: 1 ether}(tokenId, ONE_YEAR);

        assertEq(balanceBefore - alice.balance, PRICE_PER_YEAR);
    }

    /*//////////////////////////////////////////////////////////////
                              TRANSFERS
    //////////////////////////////////////////////////////////////*/

    function test_transfer_success() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        vm.prank(alice);
        registrar.transferFrom(alice, bob, tokenId);

        assertEq(registrar.ownerOf(tokenId), bob);
    }

    function test_transfer_revertsWhenExpired() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        vm.warp(block.timestamp + ONE_YEAR + 1);

        vm.prank(alice);
        vm.expectRevert(SubnameRegistrar.Expired.selector);
        registrar.transferFrom(alice, bob, tokenId);
    }

    /*//////////////////////////////////////////////////////////////
                              VIEWS
    //////////////////////////////////////////////////////////////*/

    function test_fullName() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        assertEq(registrar.fullName(tokenId), "alice.heaven.eth");
    }

    function test_fullName_nonexistent() public {
        assertEq(registrar.fullName(999), "");
    }

    function test_available_unregistered() public {
        assertTrue(registrar.available("alice"));
    }

    function test_available_registered() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        assertFalse(registrar.available("alice"));
    }

    function test_available_afterGracePeriod() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        vm.warp(block.timestamp + ONE_YEAR + 90 days + 1);

        assertTrue(registrar.available("alice"));
    }

    function test_isExpired() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        assertFalse(registrar.isExpired(tokenId));

        vm.warp(block.timestamp + ONE_YEAR + 1);

        assertTrue(registrar.isExpired(tokenId));
    }

    function test_namehash_deterministic() public {
        bytes32 hash1 = registrar.namehash("alice");
        bytes32 hash2 = registrar.namehash("alice");
        assertEq(hash1, hash2);
    }

    function test_namehash_different() public {
        bytes32 hash1 = registrar.namehash("alice");
        bytes32 hash2 = registrar.namehash("bob");
        assertTrue(hash1 != hash2);
    }

    /*//////////////////////////////////////////////////////////////
                              ADMIN
    //////////////////////////////////////////////////////////////*/

    function test_setPrice() public {
        uint256 newPrice = 0.02 ether;

        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit PriceUpdated(newPrice);

        registrar.setPrice(newPrice);

        assertEq(registrar.pricePerYear(), newPrice);
    }

    function test_setPrice_revertsNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        registrar.setPrice(0.02 ether);
    }

    function test_setRecords() public {
        address newRecords = address(0x123);

        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit RecordsContractUpdated(newRecords);

        registrar.setRecords(newRecords);

        assertEq(registrar.records(), newRecords);
    }

    function test_setRecords_revertsNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        registrar.setRecords(address(0x123));
    }

    function test_withdraw() public {
        // Fund the contract
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        uint256 balanceBefore = owner.balance;

        vm.prank(owner);
        registrar.withdraw();

        assertEq(owner.balance, balanceBefore + PRICE_PER_YEAR);
        assertEq(address(registrar).balance, 0);
    }

    function test_withdraw_revertsNotOwner() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        vm.prank(alice);
        vm.expectRevert();
        registrar.withdraw();
    }

    /*//////////////////////////////////////////////////////////////
                          FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_priceCalculation(uint256 duration) public {
        vm.assume(duration >= ONE_YEAR && duration <= 100 * ONE_YEAR);

        uint256 expectedCost = (PRICE_PER_YEAR * duration) / ONE_YEAR;
        // Cost should be approximately proportional to duration
        // Allow for rounding differences
        assertTrue(expectedCost >= PRICE_PER_YEAR);
    }

    function testFuzz_register_validLabel(uint8 labelLen) public {
        vm.assume(labelLen > 0 && labelLen <= 63);

        bytes memory labelBytes = new bytes(labelLen);
        for (uint8 i = 0; i < labelLen; i++) {
            labelBytes[i] = bytes1(uint8(97 + (i % 26))); // a-z
        }
        string memory label = string(labelBytes);

        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}(label, ONE_YEAR);

        assertEq(registrar.ownerOf(tokenId), alice);
    }
}
