// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console2} from "forge-std/Script.sol";
import {MultiTldSubnameRegistrarV3} from "../src/MultiTldSubnameRegistrarV3.sol";
import {RecordsV2} from "../src/RecordsV2.sol";

contract DeployV3Script is Script {
    // Canonical emoji forms (without VS16)
    string constant TLD_NEODATE = "neodate";
    string constant TLD_STAR = unicode"⭐";
    string constant TLD_SPIRAL = unicode"🌀";

    // Root TLD under which all subnames live
    string constant ROOT_TLD = "hnsbridge.eth";

    // Pricing: 0.003 ETH/year base for paid TLDs (~$10 at $3300/ETH)
    uint256 constant PAID_PRICE_PER_YEAR = 0.003 ether;

    // Length multipliers for paid TLDs
    uint16 constant MULT_1_CHAR = 100; // 100x = $1000/yr
    uint16 constant MULT_2_CHAR = 50;  // 50x = $500/yr
    uint16 constant MULT_3_CHAR = 10;  // 10x = $100/yr
    uint16 constant MULT_4_CHAR = 3;   // 3x = $30/yr

    // Reserved labels (brand protection)
    string[] internal defaultReserved = [
        "neodate", "hnsbridge", "handshake", "hns",
        "admin", "support", "official", "team", "staff",
        "root", "system", "security"
    ];

    function run() external {
        address owner = vm.envOr("OWNER", msg.sender);
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Compute parentNodes for each TLD
        bytes32 nodeNeodate = _namehash(TLD_NEODATE, ROOT_TLD);
        bytes32 nodeStar = _namehash(TLD_STAR, ROOT_TLD);
        bytes32 nodeSpiral = _namehash(TLD_SPIRAL, ROOT_TLD);

        console2.log("========================================");
        console2.log("Deploying MultiTldSubnameRegistrarV3");
        console2.log("========================================");
        console2.log("Root TLD:", ROOT_TLD);
        console2.log("Owner:", owner);
        console2.log("");
        console2.log("TLD Configurations:");
        console2.log("  neodate.hnsbridge.eth (OFFCHAIN, CCIP)");
        console2.log("    parentNode:", vm.toString(nodeNeodate));
        console2.log(unicode"  ⭐.hnsbridge.eth (PAID, length pricing)");
        console2.log("    parentNode:", vm.toString(nodeStar));
        console2.log(unicode"  🌀.hnsbridge.eth (PAID, length pricing)");
        console2.log("    parentNode:", vm.toString(nodeSpiral));
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

        // Configure TLD: star (PAID with length pricing)
        registrar.configureTld(
            nodeStar,
            TLD_STAR,
            PAID_PRICE_PER_YEAR,
            1,              // minLabelLength = 1 (allow short names at premium)
            3 * 365 days,   // maxDuration = 3 years
            true,           // registrationsOpen = true
            true,           // lengthPricingEnabled = true
            MULT_1_CHAR, MULT_2_CHAR, MULT_3_CHAR, MULT_4_CHAR,
            address(0)      // no TLD admin
        );
        console2.log(unicode"Configured TLD: ⭐ (PAID, length pricing)");

        // Configure TLD: spiral (PAID with length pricing)
        registrar.configureTld(
            nodeSpiral,
            TLD_SPIRAL,
            PAID_PRICE_PER_YEAR,
            1,              // minLabelLength = 1
            3 * 365 days,   // maxDuration = 3 years
            true,           // registrationsOpen = true
            true,           // lengthPricingEnabled = true
            MULT_1_CHAR, MULT_2_CHAR, MULT_3_CHAR, MULT_4_CHAR,
            address(0)      // no TLD admin
        );
        console2.log(unicode"Configured TLD: 🌀 (PAID, length pricing)");

        // Set reserved labels for paid TLDs only
        bytes32[] memory reservedHashes = new bytes32[](defaultReserved.length);
        for (uint256 i = 0; i < defaultReserved.length; i++) {
            reservedHashes[i] = keccak256(bytes(defaultReserved[i]));
        }
        registrar.setReservedHashes(nodeStar, reservedHashes, true);
        registrar.setReservedHashes(nodeSpiral, reservedHashes, true);
        console2.log("Reserved", defaultReserved.length, "labels on paid TLDs");

        vm.stopBroadcast();

        console2.log("");
        console2.log("=== Deployment Complete ===");
        console2.log("");
        console2.log("Deployed contracts:");
        console2.log("  Registrar:", address(registrar));
        console2.log("  RecordsV2:", address(records));
        console2.log("");
        console2.log("TLD Parent Nodes:");
        console2.log("  NEODATE (offchain resolver):", vm.toString(nodeNeodate));
        console2.log("  STAR (paid):", vm.toString(nodeStar));
        console2.log("  SPIRAL (paid):", vm.toString(nodeSpiral));
        console2.log("");
        console2.log("Registrations are OPEN for paid TLDs.");
        console2.log("");
        console2.log("Add to app/.env (paid TLDs only):");
        console2.log(string.concat("VITE_NAME_REGISTRY_ADDRESS=", vm.toString(address(registrar))));
        console2.log(string.concat("VITE_NAME_REGISTRY_RECORDS=", vm.toString(address(records))));
        console2.log(string.concat("VITE_TLD_NODE_STAR=", vm.toString(nodeStar)));
        console2.log(string.concat("VITE_TLD_NODE_SPIRAL=", vm.toString(nodeSpiral)));
        console2.log("");
        console2.log("Offchain (.neodate) setup reminder:");
        console2.log("  Set ENS resolver for neodate.hnsbridge.eth to your OffchainResolver");
        console2.log("  (OffchainResolver should support ENSIP-10 + CCIP-Read)");
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
