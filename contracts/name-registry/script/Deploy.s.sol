// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console2} from "forge-std/Script.sol";
import {SubnameRegistrar} from "../src/SubnameRegistrar.sol";
import {Records} from "../src/Records.sol";
import {Resolver} from "../src/Resolver.sol";

contract DeployScript is Script {
    function run() external {
        // Configuration
        string memory parentName = vm.envOr("PARENT_NAME", string("neodate"));
        string memory tld = vm.envOr("TLD", string("eth"));
        uint256 pricePerYear = vm.envOr("PRICE_PER_YEAR", uint256(0.001 ether));
        address owner = vm.envOr("OWNER", msg.sender);

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        console2.log("Deploying SLD Registry (L1)...");
        console2.log("Parent Name:", parentName);
        console2.log("TLD:", tld);
        console2.log("Price Per Year:", pricePerYear);
        console2.log("Owner:", owner);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy SubnameRegistrar
        SubnameRegistrar registrar = new SubnameRegistrar(
            parentName,
            tld,
            pricePerYear,
            owner
        );
        console2.log("SubnameRegistrar deployed at:", address(registrar));

        // Deploy Records
        Records records = new Records(address(registrar), owner);
        console2.log("Records deployed at:", address(records));

        // Link Records to Registrar
        registrar.setRecords(address(records));
        console2.log("Records linked to Registrar");

        // Deploy Resolver
        Resolver resolver = new Resolver(
            address(records),
            parentName,
            owner
        );
        console2.log("Resolver deployed at:", address(resolver));

        vm.stopBroadcast();

        console2.log("");
        console2.log("=== Deployment Complete ===");
        console2.log("");
        console2.log("Deployed contracts:");
        console2.log("  SubnameRegistrar:", address(registrar));
        console2.log("  Records:", address(records));
        console2.log("  Resolver:", address(resolver));
        console2.log("");
        console2.log("Next step: Set Resolver as the resolver for your ENS name:");
        console2.log(string.concat("  ENS Registry.setResolver(namehash('", parentName, ".", tld, "'), ", vm.toString(address(resolver)), ")"));
    }
}
