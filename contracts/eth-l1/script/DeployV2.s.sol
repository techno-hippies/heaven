// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console2} from "forge-std/Script.sol";
import {SubnameRegistrarV2} from "../src/SubnameRegistrarV2.sol";
import {Records} from "../src/Records.sol";
import {Resolver} from "../src/Resolver.sol";

contract DeployV2Script is Script {
    // Minimal default reserved (brand protection only)
    // Run SetReserved.s.sol after deployment for full list (~350 labels)
    string[] internal defaultReserved = [
        "neodate", "hnsbridge", "handshake", "hns",
        "admin", "support", "official", "team", "staff",
        "root", "system", "security"
    ];

    function run() external {
        // Configuration from env
        string memory parentName = vm.envOr("PARENT_NAME", string("neodate"));
        string memory tld = vm.envOr("TLD", string("hnsbridge.eth"));
        uint256 pricePerYear = vm.envOr("PRICE_PER_YEAR", uint256(0)); // 0 = free
        uint8 minLabelLength = uint8(vm.envOr("MIN_LABEL_LENGTH", uint256(4)));
        uint256 maxDuration = vm.envOr("MAX_DURATION", uint256(3 * 365 days));
        address owner = vm.envOr("OWNER", msg.sender);

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Compute parentNode = namehash(parentName.tld)
        // e.g., namehash("star.hnsbridge.eth")
        bytes32 parentNode = _computeParentNode(parentName, tld);

        console2.log("========================================");
        console2.log("Deploying SubnameRegistrarV2");
        console2.log("========================================");
        console2.log("Parent Name:", parentName);
        console2.log("TLD:", tld);
        console2.log("Full parent:", string.concat(parentName, ".", tld));
        console2.log("Parent Node:", vm.toString(parentNode));
        console2.log("Price Per Year:", pricePerYear);
        console2.log("Min Label Length:", minLabelLength);
        console2.log("Max Duration (days):", maxDuration / 1 days);
        console2.log("Owner:", owner);
        console2.log("========================================");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy SubnameRegistrarV2
        SubnameRegistrarV2 registrar = new SubnameRegistrarV2(
            parentName,
            tld,
            parentNode,
            pricePerYear,
            minLabelLength,
            maxDuration,
            owner
        );
        console2.log("SubnameRegistrarV2 deployed at:", address(registrar));

        // Deploy Records (still uses V1 interface)
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

        // Set default reserved words
        if (defaultReserved.length > 0) {
            registrar.setReservedLabels(defaultReserved, true);
            console2.log("Reserved", defaultReserved.length, "labels");
        }

        vm.stopBroadcast();

        console2.log("");
        console2.log("=== Deployment Complete ===");
        console2.log("");
        console2.log("Deployed contracts:");
        console2.log("  SubnameRegistrarV2:", address(registrar));
        console2.log("  Records:", address(records));
        console2.log("  Resolver:", address(resolver));
        console2.log("");
        console2.log("IMPORTANT: Registrations are CLOSED by default.");
        console2.log("");
        console2.log("Next steps:");
        console2.log("");
        console2.log("1. Set full reserved list (~350 labels):");
        console2.log(string.concat(
            "   REGISTRAR=", vm.toString(address(registrar)),
            " forge script script/SetReserved.s.sol --rpc-url $RPC --broadcast"
        ));
        console2.log("");
        console2.log("2. (Optional) Reserve all 1-2 char labels:");
        console2.log(string.concat(
            "   REGISTRAR=", vm.toString(address(registrar)),
            " forge script script/ReserveShortLabels.s.sol --rpc-url $RPC --broadcast"
        ));
        console2.log("");
        console2.log("3. Set Resolver on ENS Registry:");
        console2.log(string.concat(
            "   ENS.setResolver(namehash('",
            parentName, ".", tld,
            "'), ",
            vm.toString(address(resolver)),
            ")"
        ));
        console2.log("");
        console2.log("4. Open registrations:");
        console2.log(string.concat(
            "   cast send ", vm.toString(address(registrar)),
            " 'setRegistrationsOpen(bool)' true --private-key $PK"
        ));
    }

    /// @notice Compute namehash for parentName.tld (handles multi-label TLDs)
    /// @dev e.g., "star" + "hnsbridge.eth" => namehash("star.hnsbridge.eth")
    function _computeParentNode(string memory parentName, string memory tld)
        internal
        pure
        returns (bytes32)
    {
        // Start with empty node
        bytes32 node = bytes32(0);

        // Split TLD into labels and hash from right to left
        // e.g., "hnsbridge.eth" => ["hnsbridge", "eth"]
        // We need to hash "eth" first, then "hnsbridge", then parentName

        // For simplicity, handle common cases:
        // - "eth" => just "eth"
        // - "hnsbridge.eth" => "eth", then "hnsbridge"
        // - Could extend for deeper nesting if needed

        bytes memory tldBytes = bytes(tld);

        // Find dots in TLD
        uint256[] memory dotPositions = new uint256[](10); // max 10 labels
        uint256 dotCount = 0;

        for (uint256 i = 0; i < tldBytes.length; i++) {
            if (tldBytes[i] == 0x2e) { // '.'
                dotPositions[dotCount] = i;
                dotCount++;
            }
        }

        if (dotCount == 0) {
            // Single label TLD (e.g., "eth")
            node = keccak256(abi.encodePacked(node, keccak256(tldBytes)));
        } else {
            // Multi-label TLD (e.g., "hnsbridge.eth")
            // Hash from right to left
            uint256 end = tldBytes.length;
            for (uint256 i = dotCount; i > 0; i--) {
                uint256 start = dotPositions[i - 1] + 1;
                bytes memory label = _slice(tldBytes, start, end);
                node = keccak256(abi.encodePacked(node, keccak256(label)));
                end = dotPositions[i - 1];
            }
            // Hash the leftmost label
            bytes memory firstLabel = _slice(tldBytes, 0, end);
            node = keccak256(abi.encodePacked(node, keccak256(firstLabel)));
        }

        // Finally hash the parentName
        node = keccak256(abi.encodePacked(node, keccak256(bytes(parentName))));

        return node;
    }

    function _slice(bytes memory data, uint256 start, uint256 end)
        internal
        pure
        returns (bytes memory)
    {
        bytes memory result = new bytes(end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = data[i];
        }
        return result;
    }
}
