// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import "../src/SubnameRegistrar.sol";
import "../src/Records.sol";

contract GasEstimate is Script {
    function run() external {
        // Deploy contracts
        SubnameRegistrar registrar = new SubnameRegistrar("heaven", "eth", 0.001 ether, address(this));
        Records records = new Records(address(registrar), address(this));
        registrar.setRecords(address(records));

        // Measure registration gas
        uint256 gasBefore = gasleft();
        registrar.register{value: 0.001 ether}("alice", 365 days);
        uint256 gasUsed = gasBefore - gasleft();

        console.log("Gas used for register():", gasUsed);

        // Measure setAddr gas
        bytes32 node = registrar.namehash("alice");
        gasBefore = gasleft();
        records.setAddr(node, address(0x1234));
        gasUsed = gasBefore - gasleft();

        console.log("Gas used for setAddr():", gasUsed);
    }
}
