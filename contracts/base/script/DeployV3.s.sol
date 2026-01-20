// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console2} from "forge-std/Script.sol";
import {MultiTldSubnameRegistrarV3} from "../src/MultiTldSubnameRegistrarV3.sol";
import {RecordsV2} from "../src/RecordsV2.sol";

contract DeployV3Script is Script {
    // TLD labels (emoji without VS16)
    string constant TLD_HEAVEN = "heaven";
    string constant TLD_STAR = unicode"⭐";
    string constant TLD_SPIRAL = unicode"🌀";

    // Root TLD under which all subnames live
    string constant ROOT_TLD = "hnsbridge.eth";

    // Pricing: 0.01 ETH base (used with length multipliers)
    // With lengthPricingEnabled=true:
    //   - 5+ chars: FREE (multiplier = 0)
    //   - 4 chars: 0.02 ETH/yr (mult4 = 2)
    //   - 3 chars: 0.05 ETH/yr (mult3 = 5)
    //   - 2 chars: 0.1 ETH/yr (mult2 = 10)
    //   - 1 char: BLOCKED by minLabelLength
    uint256 constant BASE_PRICE_PER_YEAR = 0.01 ether;
    uint16 constant MULT_2_CHAR = 10;  // 0.1 ETH/yr
    uint16 constant MULT_3_CHAR = 5;   // 0.05 ETH/yr
    uint16 constant MULT_4_CHAR = 2;   // 0.02 ETH/yr
    // 5+ chars = FREE (contract returns mult=0)

    // Reserved labels (brand protection)
    string[] internal defaultReserved = [
        "heaven", "hnsbridge", "handshake", "hns",
        "admin", "support", "official", "team", "staff",
        "root", "system", "security"
    ];

    function run() external {
        address owner = vm.envOr("OWNER", msg.sender);
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Compute parentNodes for each TLD
        bytes32 nodeHeaven = _namehash(TLD_HEAVEN, ROOT_TLD);
        bytes32 nodeStar = _namehash(TLD_STAR, ROOT_TLD);
        bytes32 nodeSpiral = _namehash(TLD_SPIRAL, ROOT_TLD);

        console2.log("========================================");
        console2.log("Deploying MultiTldSubnameRegistrarV3");
        console2.log("========================================");
        console2.log("Root TLD:", ROOT_TLD);
        console2.log("Owner:", owner);
        console2.log("");
        console2.log("TLD Configurations (all same pricing):");
        console2.log("  - 5+ chars: FREE");
        console2.log("  - 4 chars: 0.02 ETH/yr");
        console2.log("  - 3 chars: 0.05 ETH/yr");
        console2.log("  - 2 chars: 0.1 ETH/yr");
        console2.log("  - 1 char: BLOCKED");
        console2.log("");
        console2.log("  heaven.hnsbridge.eth");
        console2.log("    parentNode:", vm.toString(nodeHeaven));
        console2.log(unicode"  ⭐.hnsbridge.eth");
        console2.log("    parentNode:", vm.toString(nodeStar));
        console2.log(unicode"  🌀.hnsbridge.eth");
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

        // Pre-compute reserved hashes (used for all TLDs)
        bytes32[] memory reservedHashes = new bytes32[](defaultReserved.length);
        for (uint256 i = 0; i < defaultReserved.length; i++) {
            reservedHashes[i] = keccak256(bytes(defaultReserved[i]));
        }

        // Configure TLD: .heaven
        _configureTld(registrar, nodeHeaven, TLD_HEAVEN, reservedHashes);
        console2.log("Configured TLD: .heaven");

        // Configure TLD: .star
        _configureTld(registrar, nodeStar, TLD_STAR, reservedHashes);
        console2.log(unicode"Configured TLD: .⭐");

        // Configure TLD: .spiral
        _configureTld(registrar, nodeSpiral, TLD_SPIRAL, reservedHashes);
        console2.log(unicode"Configured TLD: .🌀");

        vm.stopBroadcast();

        console2.log("");
        console2.log("=== Deployment Complete ===");
        console2.log("");
        console2.log("Deployed contracts:");
        console2.log("  Registrar:", address(registrar));
        console2.log("  RecordsV2:", address(records));
        console2.log("");
        console2.log("TLD Parent Nodes:");
        console2.log("  HEAVEN:", vm.toString(nodeHeaven));
        console2.log("  STAR:", vm.toString(nodeStar));
        console2.log("  SPIRAL:", vm.toString(nodeSpiral));
        console2.log("");
        console2.log("Registrations are CLOSED by default.");
        console2.log("");
        console2.log("To open registrations for a TLD:");
        console2.log(string.concat(
            "  cast send ", vm.toString(address(registrar)),
            " 'setRegistrationsOpen(bytes32,bool)' <parentNode> true"
        ));
    }

    function _configureTld(
        MultiTldSubnameRegistrarV3 registrar,
        bytes32 parentNode,
        string memory parentName,
        bytes32[] memory reservedHashes
    ) internal {
        registrar.configureTld(
            parentNode,
            parentName,
            BASE_PRICE_PER_YEAR,  // 0.01 ETH base
            2,                    // minLabelLength = 2 (blocks 1-char)
            365 days,             // maxDuration = 1 year
            false,                // registrationsOpen = false (open later)
            true,                 // lengthPricingEnabled = true
            0,                    // lengthMult1 = 0 (blocked by minLength anyway)
            MULT_2_CHAR,          // lengthMult2 = 10 (0.1 ETH)
            MULT_3_CHAR,          // lengthMult3 = 5 (0.05 ETH)
            MULT_4_CHAR,          // lengthMult4 = 2 (0.02 ETH)
            address(0)            // no TLD admin
        );
        registrar.setReservedHashes(parentNode, reservedHashes, true);
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
