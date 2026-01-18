// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IRecords {
    function addr(bytes32 node) external view returns (address);
    function addr(bytes32 node, uint256 coinType) external view returns (bytes memory);
    function text(bytes32 node, string calldata key) external view returns (string memory);
    function contenthash(bytes32 node) external view returns (bytes memory);
}

/// @title Resolver
/// @notice L1-native ENS resolver for subnames
/// @dev Set as resolver for your parent ENS name (e.g., neodate.eth)
///      Resolves subnames by reading directly from Records contract
contract Resolver is Ownable {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error NotFound();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event RecordsUpdated(address indexed records);

    /*//////////////////////////////////////////////////////////////
                                 STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice Records contract address
    IRecords public records;

    /// @notice Parent name (e.g., "neodate")
    string public parentName;

    /// @notice ETH coinType (per SLIP-44)
    uint256 public constant COIN_TYPE_ETH = 60;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address _records,
        string memory _parentName,
        address _owner
    ) Ownable(_owner) {
        records = IRecords(_records);
        parentName = _parentName;
    }

    /*//////////////////////////////////////////////////////////////
                          ENS RESOLVER INTERFACE
    //////////////////////////////////////////////////////////////*/

    /// @notice Resolve ETH address for a name
    /// @param node The namehash of the full name (e.g., namehash("jordan.neodate.eth"))
    function addr(bytes32 node) external view returns (address) {
        return records.addr(node);
    }

    /// @notice Resolve address for a specific coin type
    /// @param node The namehash of the full name
    /// @param coinType SLIP-44 coin type
    function addr(bytes32 node, uint256 coinType) external view returns (bytes memory) {
        return records.addr(node, coinType);
    }

    /// @notice Resolve text record
    /// @param node The namehash of the full name
    /// @param key The text record key
    function text(bytes32 node, string calldata key) external view returns (string memory) {
        return records.text(node, key);
    }

    /// @notice Resolve contenthash
    /// @param node The namehash of the full name
    function contenthash(bytes32 node) external view returns (bytes memory) {
        return records.contenthash(node);
    }

    /*//////////////////////////////////////////////////////////////
                    ENSIP-10 WILDCARD RESOLUTION
    //////////////////////////////////////////////////////////////*/

    /// @notice Resolve arbitrary calls via ENSIP-10 wildcard
    /// @dev Called by ENS universal resolver for wildcard subdomains
    /// @param name DNS-encoded name (e.g., "\x06jordan\x07neodate\x03eth\x00")
    /// @param data ABI-encoded resolver call (e.g., addr(bytes32), text(bytes32,string))
    function resolve(
        bytes calldata name,
        bytes calldata data
    ) external view returns (bytes memory) {
        // Compute namehash from DNS-encoded name
        bytes32 node = _namehashFromDns(name);

        // Extract function selector
        bytes4 selector = bytes4(data[:4]);

        // Route to appropriate function
        if (selector == bytes4(keccak256("addr(bytes32)"))) {
            address result = records.addr(node);
            return abi.encode(result);
        }

        if (selector == bytes4(keccak256("addr(bytes32,uint256)"))) {
            (, uint256 coinType) = abi.decode(data[4:], (bytes32, uint256));
            bytes memory result = records.addr(node, coinType);
            return abi.encode(result);
        }

        if (selector == bytes4(keccak256("text(bytes32,string)"))) {
            (, string memory key) = abi.decode(data[4:], (bytes32, string));
            string memory result = records.text(node, key);
            return abi.encode(result);
        }

        if (selector == bytes4(keccak256("contenthash(bytes32)"))) {
            bytes memory result = records.contenthash(node);
            return abi.encode(result);
        }

        revert NotFound();
    }

    /*//////////////////////////////////////////////////////////////
                          INTERFACE SUPPORT
    //////////////////////////////////////////////////////////////*/

    /// @notice Check if this resolver supports an interface
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return
            interfaceId == 0x3b3b57de || // addr(bytes32)
            interfaceId == 0xf1cb7e06 || // addr(bytes32,uint256)
            interfaceId == 0x59d1d43c || // text(bytes32,string)
            interfaceId == 0xbc1c58d1 || // contenthash(bytes32)
            interfaceId == 0x9061b923 || // resolve(bytes,bytes) - ENSIP-10
            interfaceId == 0x01ffc9a7;   // supportsInterface
    }

    /*//////////////////////////////////////////////////////////////
                              ADMIN
    //////////////////////////////////////////////////////////////*/

    function setRecords(address _records) external onlyOwner {
        records = IRecords(_records);
        emit RecordsUpdated(_records);
    }

    /*//////////////////////////////////////////////////////////////
                              INTERNAL
    //////////////////////////////////////////////////////////////*/

    /// @notice Compute namehash from DNS-encoded name
    /// @dev DNS format: length-prefixed labels, null terminated
    ///      Example: "\x06jordan\x07neodate\x03eth\x00"
    function _namehashFromDns(bytes calldata name) internal pure returns (bytes32) {
        bytes32 node = bytes32(0);
        uint256 idx = 0;

        while (idx < name.length) {
            uint8 labelLength = uint8(name[idx]);
            if (labelLength == 0) break;

            // Extract label
            bytes calldata label = name[idx + 1 : idx + 1 + labelLength];

            // Compute namehash iteratively: keccak256(node, keccak256(label))
            node = keccak256(abi.encodePacked(node, keccak256(label)));

            idx += 1 + labelLength;
        }

        return node;
    }
}
