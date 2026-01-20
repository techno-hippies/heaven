// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console2} from "forge-std/Script.sol";
import {MultiTldSubnameRegistrarV3} from "../src/MultiTldSubnameRegistrarV3.sol";
import {RecordsV2} from "../src/RecordsV2.sol";

contract DeployV3Script is Script {
    string constant TLD_HEAVEN = "heaven";

    // Root TLD under which all subnames live
    string constant ROOT_TLD = "hnsbridge.eth";

    // Reserved labels (brand protection)
    string[] internal defaultReserved = [
        "heaven", "hnsbridge", "handshake", "hns",
        "admin", "support", "official", "team", "staff",
        "root", "system", "security"
    ];

    function run() external {
        address owner = vm.envOr("OWNER", msg.sender);
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Compute parentNode for .heaven
        bytes32 nodeHeaven = _namehash(TLD_HEAVEN, ROOT_TLD);

        console2.log("========================================");
        console2.log("Deploying MultiTldSubnameRegistrarV3");
        console2.log("========================================");
        console2.log("Root TLD:", ROOT_TLD);
        console2.log("Owner:", owner);
        console2.log("");
        console2.log("TLD Configuration:");
        console2.log("  heaven.hnsbridge.eth (FREE)");
        console2.log("    parentNode:", vm.toString(nodeHeaven));
        console2.log("========================================");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy MultiTldSubnameRegistrarV3
        MultiTldSubnameRegistrarV3 registrar = new MultiTldSubnameRegistrarV3(
            ROOT_TLD,
            owner
        );
        console2.log("Registrar deployed at:", address(registrar));

        // Deploy RecordsV2 (ENS-compatible resolver with expiry-gated reads + versioning)
        RecordsV2 records = new RecordsV2(address(registrar), owner);
        console2.log("RecordsV2 deployed at:", address(records));

        // Link Records to Registrar
        registrar.setRecords(address(records));
        console2.log("Records linked to Registrar");

        // Configure TLD: heaven (FREE, min 4 chars, 1 year max)
        registrar.configureTld(
            nodeHeaven,
            TLD_HEAVEN,
            0,              // pricePerYear = 0 (free)
            4,              // minLabelLength = 4
            365 days,       // maxDuration = 1 year
            false,          // registrationsOpen = false (open later)
            false,          // lengthPricingEnabled = false
            0, 0, 0, 0,     // no length multipliers
            address(0)      // no TLD admin
        );
        console2.log("Configured TLD: heaven (FREE)");

        // Set reserved labels
        bytes32[] memory reservedHashes = new bytes32[](defaultReserved.length);
        for (uint256 i = 0; i < defaultReserved.length; i++) {
            reservedHashes[i] = keccak256(bytes(defaultReserved[i]));
        }
        registrar.setReservedHashes(nodeHeaven, reservedHashes, true);
        console2.log("Reserved", defaultReserved.length, "labels");

        vm.stopBroadcast();

        console2.log("");
        console2.log("=== Deployment Complete ===");
        console2.log("");
        console2.log("Deployed contracts:");
        console2.log("  Registrar:", address(registrar));
        console2.log("  RecordsV2:", address(records));
        console2.log("");
        console2.log("TLD Parent Node:");
        console2.log("  HEAVEN:", vm.toString(nodeHeaven));
        console2.log("");
        console2.log("Registrations are CLOSED by default.");
        console2.log("");
        console2.log("Next steps:");
        console2.log("1. Set ENS resolver for heaven.hnsbridge.eth to your Resolver contract");
        console2.log("2. Open registrations:");
        console2.log(string.concat(
            "   cast send ", vm.toString(address(registrar)),
            " 'setRegistrationsOpen(bytes32,bool)' ", vm.toString(nodeHeaven), " true"
        ));
    }

    /// @notice Compute namehash for parentName.rootTld
    function _namehash(string memory parentName, string memory rootTld) internal pure returns (bytes32) {
        bytes32 node = bytes32(0);

        // Parse rootTld labels (e.g., "hnsbridge.eth" -> ["hnsbridge", "eth"])
        bytes memory tldBytes = bytes(rootTld);
        uint256[] memory dots = new uint256[](10);
        uint256 dotCount = 0;

        for (uint256 i = 0; i < tldBytes.length; i++) {
            if (tldBytes[i] == 0x2e) {
                dots[dotCount++] = i;
            }
        }

        if (dotCount == 0) {
            // Single label (e.g., "eth")
            node = keccak256(abi.encodePacked(node, keccak256(tldBytes)));
        } else {
            // Multi-label (e.g., "hnsbridge.eth")
            uint256 end = tldBytes.length;
            for (uint256 i = dotCount; i > 0; i--) {
                uint256 start = dots[i - 1] + 1;
                bytes memory label = _slice(tldBytes, start, end);
                node = keccak256(abi.encodePacked(node, keccak256(label)));
                end = dots[i - 1];
            }
            bytes memory firstLabel = _slice(tldBytes, 0, end);
            node = keccak256(abi.encodePacked(node, keccak256(firstLabel)));
        }

        // Hash parentName
        node = keccak256(abi.encodePacked(node, keccak256(bytes(parentName))));

        return node;
    }

    function _slice(bytes memory data, uint256 start, uint256 end) internal pure returns (bytes memory) {
        bytes memory result = new bytes(end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = data[i];
        }
        return result;
    }
}
