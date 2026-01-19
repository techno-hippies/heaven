// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Test} from "forge-std/Test.sol";
import {SubnameRegistrar} from "../src/SubnameRegistrar.sol";
import {Records} from "../src/Records.sol";

contract RecordsTest is Test {
    SubnameRegistrar public registrar;
    Records public records;

    address owner = address(0x1);
    address alice = address(0x2);
    address bob = address(0x3);
    address operator = address(0x4);

    string constant PARENT_NAME = "heaven";
    string constant TLD = "eth";
    uint256 constant PRICE_PER_YEAR = 0.01 ether;
    uint256 constant ONE_YEAR = 365 days;

    event AddrChanged(bytes32 indexed node, uint256 coinType, bytes addr);
    event TextChanged(bytes32 indexed node, string key, string value);
    event ContenthashChanged(bytes32 indexed node, bytes contenthash);
    event RegistrarUpdated(address newRegistrar);

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
        assertEq(address(records.registrar()), address(registrar));
        assertEq(records.owner(), owner);
        assertEq(records.COIN_TYPE_ETH(), 60);
    }

    /*//////////////////////////////////////////////////////////////
                          AUTHORIZATION
    //////////////////////////////////////////////////////////////*/

    function test_isAuthorized_owner() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        assertTrue(records.isAuthorized(node, alice));
    }

    function test_isAuthorized_contractOwner() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        assertTrue(records.isAuthorized(node, owner));
    }

    function test_isAuthorized_approved() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        vm.prank(alice);
        registrar.approve(operator, tokenId);

        assertTrue(records.isAuthorized(node, operator));
    }

    function test_isAuthorized_approvedForAll() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        vm.prank(alice);
        registrar.setApprovalForAll(operator, true);

        assertTrue(records.isAuthorized(node, operator));
    }

    function test_isAuthorized_false_notAuthorized() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        assertFalse(records.isAuthorized(node, bob));
    }

    function test_isAuthorized_false_expired() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        vm.warp(block.timestamp + ONE_YEAR + 1);

        assertFalse(records.isAuthorized(node, alice));
    }

    function test_isAuthorized_false_noNodeMapping() public {
        bytes32 fakeNode = keccak256("fake");
        assertFalse(records.isAuthorized(fakeNode, alice));
    }

    /*//////////////////////////////////////////////////////////////
                          SET ADDRESS
    //////////////////////////////////////////////////////////////*/

    function test_setAddr_eth() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit AddrChanged(node, 60, abi.encodePacked(bob));

        records.setAddr(node, bob);

        assertEq(records.addr(node), bob);
    }

    function test_setAddr_multiCoin() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        uint256 btcCoinType = 0;
        bytes memory btcAddr = hex"1234567890abcdef";

        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit AddrChanged(node, btcCoinType, btcAddr);

        records.setAddr(node, btcCoinType, btcAddr);

        assertEq(records.addr(node, btcCoinType), btcAddr);
    }

    function test_setAddr_revertsNotAuthorized() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        vm.prank(bob);
        vm.expectRevert(Records.NotAuthorized.selector);
        records.setAddr(node, bob);
    }

    function test_setAddr_successAsOperator() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        vm.prank(alice);
        registrar.approve(operator, tokenId);

        vm.prank(operator);
        records.setAddr(node, bob);

        assertEq(records.addr(node), bob);
    }

    /*//////////////////////////////////////////////////////////////
                          SET TEXT
    //////////////////////////////////////////////////////////////*/

    function test_setText() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit TextChanged(node, "avatar", "https://example.com/avatar.png");

        records.setText(node, "avatar", "https://example.com/avatar.png");

        assertEq(records.text(node, "avatar"), "https://example.com/avatar.png");
    }

    function test_setText_multipleKeys() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        vm.startPrank(alice);
        records.setText(node, "avatar", "avatar_url");
        records.setText(node, "email", "alice@example.com");
        records.setText(node, "url", "https://alice.cooltld");
        vm.stopPrank();

        assertEq(records.text(node, "avatar"), "avatar_url");
        assertEq(records.text(node, "email"), "alice@example.com");
        assertEq(records.text(node, "url"), "https://alice.cooltld");
    }

    function test_setText_revertsNotAuthorized() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        vm.prank(bob);
        vm.expectRevert(Records.NotAuthorized.selector);
        records.setText(node, "avatar", "url");
    }

    /*//////////////////////////////////////////////////////////////
                        SET CONTENTHASH
    //////////////////////////////////////////////////////////////*/

    function test_setContenthash() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        bytes memory ipfsHash = hex"e3010170122022ae28a70e5f0f7a00c5"; // IPFS CIDv1 prefix

        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit ContenthashChanged(node, ipfsHash);

        records.setContenthash(node, ipfsHash);

        assertEq(records.contenthash(node), ipfsHash);
    }

    function test_setContenthash_revertsNotAuthorized() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        vm.prank(bob);
        vm.expectRevert(Records.NotAuthorized.selector);
        records.setContenthash(node, hex"1234");
    }

    /*//////////////////////////////////////////////////////////////
                        BATCH SET RECORDS
    //////////////////////////////////////////////////////////////*/

    function test_setRecords_batch() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        string[] memory keys = new string[](2);
        keys[0] = "avatar";
        keys[1] = "email";

        string[] memory values = new string[](2);
        values[0] = "avatar_url";
        values[1] = "alice@example.com";

        bytes memory contenthash = hex"e3010170";

        vm.prank(alice);
        records.setRecords(node, bob, keys, values, contenthash);

        assertEq(records.addr(node), bob);
        assertEq(records.text(node, "avatar"), "avatar_url");
        assertEq(records.text(node, "email"), "alice@example.com");
        assertEq(records.contenthash(node), contenthash);
    }

    function test_setRecords_skipsZeroAddr() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        // First set an address
        vm.prank(alice);
        records.setAddr(node, bob);
        assertEq(records.addr(node), bob);

        // Then call setRecords with zero address - should not change
        string[] memory keys = new string[](0);
        string[] memory values = new string[](0);

        vm.prank(alice);
        records.setRecords(node, address(0), keys, values, "");

        assertEq(records.addr(node), bob); // Should remain unchanged
    }

    function test_setRecords_revertsLengthMismatch() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        string[] memory keys = new string[](2);
        keys[0] = "avatar";
        keys[1] = "email";

        string[] memory values = new string[](1);
        values[0] = "avatar_url";

        vm.prank(alice);
        vm.expectRevert("Length mismatch");
        records.setRecords(node, address(0), keys, values, "");
    }

    /*//////////////////////////////////////////////////////////////
                      SET RECORDS BY LABEL
    //////////////////////////////////////////////////////////////*/

    function test_setRecordsByLabel() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        string[] memory keys = new string[](1);
        keys[0] = "avatar";

        string[] memory values = new string[](1);
        values[0] = "avatar_url";

        vm.prank(alice);
        records.setRecordsByLabel("alice", bob, keys, values, hex"1234");

        bytes32 node = registrar.namehash("alice");
        assertEq(records.addr(node), bob);
        assertEq(records.text(node, "avatar"), "avatar_url");
        assertEq(records.contenthash(node), hex"1234");
    }

    function test_setRecordsByLabel_revertsNotRegistered() public {
        string[] memory keys = new string[](0);
        string[] memory values = new string[](0);

        vm.prank(alice);
        vm.expectRevert("Not registered");
        records.setRecordsByLabel("nonexistent", address(0), keys, values, "");
    }

    function test_setRecordsByLabel_revertsNotAuthorized() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        string[] memory keys = new string[](0);
        string[] memory values = new string[](0);

        vm.prank(bob);
        vm.expectRevert("Not authorized");
        records.setRecordsByLabel("alice", address(0), keys, values, "");
    }

    function test_setRecordsByLabel_revertsExpired() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        vm.warp(block.timestamp + ONE_YEAR + 1);

        string[] memory keys = new string[](0);
        string[] memory values = new string[](0);

        vm.prank(alice);
        vm.expectRevert("Expired");
        records.setRecordsByLabel("alice", address(0), keys, values, "");
    }

    /*//////////////////////////////////////////////////////////////
                        REGISTER NODE
    //////////////////////////////////////////////////////////////*/

    function test_registerNode_onlyRegistrar() public {
        bytes32 fakeNode = keccak256("fake");

        vm.prank(alice);
        vm.expectRevert("Only registrar");
        records.registerNode(fakeNode, 999);
    }

    function test_registerNode_calledOnRegister() public {
        vm.prank(alice);
        uint256 tokenId = registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        bytes32 node = registrar.namehash("alice");
        assertEq(records.nodeToTokenId(node), tokenId);
    }

    /*//////////////////////////////////////////////////////////////
                              ADMIN
    //////////////////////////////////////////////////////////////*/

    function test_setRegistrar() public {
        address newRegistrar = address(0x123);

        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit RegistrarUpdated(newRegistrar);

        records.setRegistrar(newRegistrar);

        assertEq(address(records.registrar()), newRegistrar);
    }

    function test_setRegistrar_revertsNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        records.setRegistrar(address(0x123));
    }

    /*//////////////////////////////////////////////////////////////
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function test_addr_returnsZeroWhenNotSet() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        assertEq(records.addr(node), address(0));
    }

    function test_text_returnsEmptyWhenNotSet() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        assertEq(records.text(node, "avatar"), "");
    }

    function test_contenthash_returnsEmptyWhenNotSet() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        assertEq(records.contenthash(node), "");
    }

    /*//////////////////////////////////////////////////////////////
                          EDGE CASES
    //////////////////////////////////////////////////////////////*/

    function test_multipleNames_isolatedRecords() public {
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        vm.prank(bob);
        registrar.register{value: PRICE_PER_YEAR}("bob", ONE_YEAR);

        bytes32 aliceNode = registrar.namehash("alice");
        bytes32 bobNode = registrar.namehash("bob");

        vm.prank(alice);
        records.setAddr(aliceNode, alice);

        vm.prank(bob);
        records.setAddr(bobNode, bob);

        assertEq(records.addr(aliceNode), alice);
        assertEq(records.addr(bobNode), bob);
    }

    function test_reRegistration_allowsNewOwnerToSetRecords() public {
        // Register and set records
        vm.prank(alice);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);
        bytes32 node = registrar.namehash("alice");

        vm.startPrank(alice);
        records.setAddr(node, alice);
        records.setText(node, "avatar", "old_avatar");
        vm.stopPrank();

        // Verify records were set
        assertEq(records.addr(node), alice);
        assertEq(records.text(node, "avatar"), "old_avatar");

        // Let it expire past grace period
        vm.warp(block.timestamp + ONE_YEAR + 90 days + 1);

        // Re-register as bob
        vm.prank(bob);
        registrar.register{value: PRICE_PER_YEAR}("alice", ONE_YEAR);

        // Bob should now be able to set records (nodeToTokenId mapping was updated)
        vm.prank(bob);
        records.setAddr(node, bob);

        assertEq(records.addr(node), bob);
        // Old text records still exist until overwritten
        assertEq(records.text(node, "avatar"), "old_avatar");
    }
}
