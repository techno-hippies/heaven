// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console2} from "forge-std/Script.sol";
import {ScrobbleLogV2} from "../src/ScrobbleLogV2.sol";

contract DeployScrobbleLogV2Script is Script {
    function run() external {
        address relay = vm.envOr("RELAY_ADDRESS", address(0));

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        console2.log("Deploying ScrobbleLogV2 to Base Sepolia...");
        console2.log("Relay (if set):", relay);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy ScrobbleLogV2
        ScrobbleLogV2 scrobbleLog = new ScrobbleLogV2();
        console2.log("ScrobbleLogV2 deployed at:", address(scrobbleLog));

        // Optionally set initial relay
        if (relay != address(0)) {
            scrobbleLog.setRelay(relay, true);
            console2.log("Relay authorized:", relay);
        }

        vm.stopBroadcast();

        console2.log("");
        console2.log("=== Deployment Complete ===");
        console2.log("");
        console2.log("ScrobbleLogV2:", address(scrobbleLog));
        console2.log("");
        console2.log("Next steps:");
        console2.log("  1. Deploy scrobble-relay worker");
        console2.log("  2. Set relay address: cast send", address(scrobbleLog), '"setRelay(address,bool)" <RELAY_ADDRESS> true');
    }
}
