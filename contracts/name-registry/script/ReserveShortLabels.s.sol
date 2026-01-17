// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console2} from "forge-std/Script.sol";
import {SubnameRegistrarV2} from "../src/SubnameRegistrarV2.sol";

/// @notice Reserve all 1-2 letter labels (a-z, 0-9)
/// @dev 36 single-char + 1296 two-char = 1332 total
///      Split into batches of ~200 to stay under gas limits
contract ReserveShortLabelsScript is Script {
    bytes constant CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

    function run() external {
        address registrarAddr = vm.envAddress("REGISTRAR");
        uint256 batchNum = vm.envOr("BATCH", uint256(0)); // 0 = all, 1-7 = specific batch
        bool includeDigits = vm.envOr("INCLUDE_DIGITS", true);

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        SubnameRegistrarV2 registrar = SubnameRegistrarV2(registrarAddr);

        console2.log("Reserving short labels on:", registrarAddr);
        console2.log("Include digits:", includeDigits);

        // Generate hashes off-chain for gas efficiency
        bytes32[] memory hashes;

        vm.startBroadcast(deployerPrivateKey);

        if (batchNum == 0 || batchNum == 1) {
            // Batch 1: Single chars a-z (26)
            hashes = _singleCharHashes(false);
            registrar.setReservedHashes(hashes, true);
            console2.log("Batch 1 (a-z):", hashes.length, "labels");
        }

        if (batchNum == 0 || batchNum == 2) {
            // Batch 2: Single chars 0-9 (10)
            if (includeDigits) {
                hashes = _singleDigitHashes();
                registrar.setReservedHashes(hashes, true);
                console2.log("Batch 2 (0-9):", hashes.length, "labels");
            }
        }

        if (batchNum == 0 || batchNum == 3) {
            // Batch 3: aa-az, ba-bz, ... (first half letters: a-m, 13*26=338)
            hashes = _twoCharHashes(0, 13, false);
            registrar.setReservedHashes(hashes, true);
            console2.log("Batch 3 (aa-mz):", hashes.length, "labels");
        }

        if (batchNum == 0 || batchNum == 4) {
            // Batch 4: na-nz, oa-oz, ... (second half letters: n-z, 13*26=338)
            hashes = _twoCharHashes(13, 26, false);
            registrar.setReservedHashes(hashes, true);
            console2.log("Batch 4 (na-zz):", hashes.length, "labels");
        }

        if (includeDigits) {
            if (batchNum == 0 || batchNum == 5) {
                // Batch 5: a0-a9, b0-b9, ... z0-z9 (26*10=260)
                hashes = _letterDigitHashes();
                registrar.setReservedHashes(hashes, true);
                console2.log("Batch 5 (a0-z9):", hashes.length, "labels");
            }

            if (batchNum == 0 || batchNum == 6) {
                // Batch 6: 0a-0z, 1a-1z, ... 9a-9z (10*26=260)
                hashes = _digitLetterHashes();
                registrar.setReservedHashes(hashes, true);
                console2.log("Batch 6 (0a-9z):", hashes.length, "labels");
            }

            if (batchNum == 0 || batchNum == 7) {
                // Batch 7: 00-99 (100)
                hashes = _twoDigitHashes();
                registrar.setReservedHashes(hashes, true);
                console2.log("Batch 7 (00-99):", hashes.length, "labels");
            }
        }

        vm.stopBroadcast();

        console2.log("Short labels reserved successfully");
    }

    function _singleCharHashes(bool) internal pure returns (bytes32[] memory) {
        bytes32[] memory result = new bytes32[](26);
        for (uint256 i = 0; i < 26; i++) {
            bytes memory label = new bytes(1);
            label[0] = bytes1(uint8(97 + i)); // a-z
            result[i] = keccak256(label);
        }
        return result;
    }

    function _singleDigitHashes() internal pure returns (bytes32[] memory) {
        bytes32[] memory result = new bytes32[](10);
        for (uint256 i = 0; i < 10; i++) {
            bytes memory label = new bytes(1);
            label[0] = bytes1(uint8(48 + i)); // 0-9
            result[i] = keccak256(label);
        }
        return result;
    }

    function _twoCharHashes(uint256 start, uint256 end, bool) internal pure returns (bytes32[] memory) {
        uint256 count = (end - start) * 26;
        bytes32[] memory result = new bytes32[](count);
        uint256 idx = 0;
        for (uint256 i = start; i < end; i++) {
            for (uint256 j = 0; j < 26; j++) {
                bytes memory label = new bytes(2);
                label[0] = bytes1(uint8(97 + i)); // a-z
                label[1] = bytes1(uint8(97 + j)); // a-z
                result[idx++] = keccak256(label);
            }
        }
        return result;
    }

    function _letterDigitHashes() internal pure returns (bytes32[] memory) {
        bytes32[] memory result = new bytes32[](260);
        uint256 idx = 0;
        for (uint256 i = 0; i < 26; i++) {
            for (uint256 j = 0; j < 10; j++) {
                bytes memory label = new bytes(2);
                label[0] = bytes1(uint8(97 + i)); // a-z
                label[1] = bytes1(uint8(48 + j)); // 0-9
                result[idx++] = keccak256(label);
            }
        }
        return result;
    }

    function _digitLetterHashes() internal pure returns (bytes32[] memory) {
        bytes32[] memory result = new bytes32[](260);
        uint256 idx = 0;
        for (uint256 i = 0; i < 10; i++) {
            for (uint256 j = 0; j < 26; j++) {
                bytes memory label = new bytes(2);
                label[0] = bytes1(uint8(48 + i)); // 0-9
                label[1] = bytes1(uint8(97 + j)); // a-z
                result[idx++] = keccak256(label);
            }
        }
        return result;
    }

    function _twoDigitHashes() internal pure returns (bytes32[] memory) {
        bytes32[] memory result = new bytes32[](100);
        uint256 idx = 0;
        for (uint256 i = 0; i < 10; i++) {
            for (uint256 j = 0; j < 10; j++) {
                bytes memory label = new bytes(2);
                label[0] = bytes1(uint8(48 + i)); // 0-9
                label[1] = bytes1(uint8(48 + j)); // 0-9
                result[idx++] = keccak256(label);
            }
        }
        return result;
    }
}
