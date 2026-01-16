// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface ISubnameRegistrar {
    function ownerOf(uint256 tokenId) external view returns (address);
    function labelToTokenId(string calldata label) external view returns (uint256);
    function expiries(uint256 tokenId) external view returns (uint256);
    function namehash(string calldata label) external view returns (bytes32);
    function getApproved(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

/// @title Records
/// @notice ENS-compatible record storage for subnames on L1
/// @dev Stores addr, text, contenthash records keyed by namehash
contract Records is Ownable {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error NotAuthorized();
    error Expired();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event AddrChanged(bytes32 indexed node, uint256 coinType, bytes addr);
    event TextChanged(bytes32 indexed node, string key, string value);
    event ContenthashChanged(bytes32 indexed node, bytes contenthash);
    event RegistrarUpdated(address newRegistrar);

    /*//////////////////////////////////////////////////////////////
                                 STORAGE
    //////////////////////////////////////////////////////////////*/

    ISubnameRegistrar public registrar;

    /// @notice node => coinType => address
    mapping(bytes32 => mapping(uint256 => bytes)) public addrs;

    /// @notice node => key => value
    mapping(bytes32 => mapping(string => string)) public texts;

    /// @notice node => contenthash
    mapping(bytes32 => bytes) public contenthashes;

    /// @notice node => tokenId (for authorization lookups)
    mapping(bytes32 => uint256) public nodeToTokenId;

    /// @notice ETH coinType (per SLIP-44)
    uint256 public constant COIN_TYPE_ETH = 60;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _registrar, address _owner) Ownable(_owner) {
        registrar = ISubnameRegistrar(_registrar);
    }

    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier authorized(bytes32 node) {
        if (!isAuthorized(node, msg.sender)) revert NotAuthorized();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                          RECORD SETTERS
    //////////////////////////////////////////////////////////////*/

    /// @notice Set ETH address for a node
    function setAddr(bytes32 node, address addr_) external authorized(node) {
        addrs[node][COIN_TYPE_ETH] = abi.encodePacked(addr_);
        emit AddrChanged(node, COIN_TYPE_ETH, abi.encodePacked(addr_));
    }

    /// @notice Set address for a specific coin type
    function setAddr(bytes32 node, uint256 coinType, bytes calldata addr_) external authorized(node) {
        addrs[node][coinType] = addr_;
        emit AddrChanged(node, coinType, addr_);
    }

    /// @notice Set a text record
    function setText(bytes32 node, string calldata key, string calldata value) external authorized(node) {
        texts[node][key] = value;
        emit TextChanged(node, key, value);
    }

    /// @notice Set contenthash (IPFS, Swarm, etc.)
    function setContenthash(bytes32 node, bytes calldata hash) external authorized(node) {
        contenthashes[node] = hash;
        emit ContenthashChanged(node, hash);
    }

    /// @notice Batch set multiple records at once
    function setRecords(
        bytes32 node,
        address ethAddr,
        string[] calldata textKeys,
        string[] calldata textValues,
        bytes calldata contenthash_
    ) external authorized(node) {
        if (ethAddr != address(0)) {
            addrs[node][COIN_TYPE_ETH] = abi.encodePacked(ethAddr);
            emit AddrChanged(node, COIN_TYPE_ETH, abi.encodePacked(ethAddr));
        }

        require(textKeys.length == textValues.length, "Length mismatch");
        for (uint256 i = 0; i < textKeys.length; i++) {
            texts[node][textKeys[i]] = textValues[i];
            emit TextChanged(node, textKeys[i], textValues[i]);
        }

        if (contenthash_.length > 0) {
            contenthashes[node] = contenthash_;
            emit ContenthashChanged(node, contenthash_);
        }
    }

    /*//////////////////////////////////////////////////////////////
                          RECORD GETTERS (ENS-compatible)
    //////////////////////////////////////////////////////////////*/

    /// @notice Get ETH address (ENS-compatible signature)
    function addr(bytes32 node) external view returns (address) {
        bytes memory a = addrs[node][COIN_TYPE_ETH];
        if (a.length == 0) return address(0);
        return address(uint160(bytes20(a)));
    }

    /// @notice Get address for a specific coin type
    function addr(bytes32 node, uint256 coinType) external view returns (bytes memory) {
        return addrs[node][coinType];
    }

    /// @notice Get text record
    function text(bytes32 node, string calldata key) external view returns (string memory) {
        return texts[node][key];
    }

    /// @notice Get contenthash
    function contenthash(bytes32 node) external view returns (bytes memory) {
        return contenthashes[node];
    }

    /*//////////////////////////////////////////////////////////////
                          AUTHORIZATION
    //////////////////////////////////////////////////////////////*/

    /// @notice Check if an address is authorized to modify a node's records
    function isAuthorized(bytes32 node, address addr_) public view returns (bool) {
        // Contract owner can always modify
        if (addr_ == owner()) return true;

        // Look up the token ID for this node
        uint256 tokenId = nodeToTokenId[node];
        if (tokenId == 0) return false;

        // Check if not expired
        if (block.timestamp > registrar.expiries(tokenId)) return false;

        return _isAuthorizedForToken(tokenId, addr_);
    }

    /// @dev Check if address is owner or approved operator for a token
    function _isAuthorizedForToken(uint256 tokenId, address addr_) internal view returns (bool) {
        address tokenOwner = registrar.ownerOf(tokenId);

        // Direct owner
        if (addr_ == tokenOwner) return true;

        // Approved for this specific token
        if (registrar.getApproved(tokenId) == addr_) return true;

        // Approved for all tokens of this owner
        if (registrar.isApprovedForAll(tokenOwner, addr_)) return true;

        return false;
    }

    /// @notice Register a node->tokenId mapping (called by registrar on mint)
    function registerNode(bytes32 node, uint256 tokenId) external {
        require(msg.sender == address(registrar), "Only registrar");
        nodeToTokenId[node] = tokenId;
    }

    /// @notice Clear all records for a node (called by registrar on re-registration)
    /// @dev This ensures new owners don't inherit previous owner's records
    function clearRecords(bytes32 node) external {
        require(msg.sender == address(registrar), "Only registrar");
        // Clear ETH address
        delete addrs[node][COIN_TYPE_ETH];
        // Clear contenthash
        delete contenthashes[node];
        // Note: text records cannot be fully cleared without knowing all keys
        // New owner should overwrite any records they want to use
    }

    /// @notice Set records using label (more gas efficient)
    function setRecordsByLabel(
        string calldata label,
        address ethAddr,
        string[] calldata textKeys,
        string[] calldata textValues,
        bytes calldata contenthash_
    ) external {
        uint256 tokenId = registrar.labelToTokenId(label);
        require(tokenId != 0, "Not registered");
        require(_isAuthorizedForToken(tokenId, msg.sender), "Not authorized");
        require(block.timestamp <= registrar.expiries(tokenId), "Expired");

        bytes32 node = registrar.namehash(label);

        if (ethAddr != address(0)) {
            addrs[node][COIN_TYPE_ETH] = abi.encodePacked(ethAddr);
            emit AddrChanged(node, COIN_TYPE_ETH, abi.encodePacked(ethAddr));
        }

        require(textKeys.length == textValues.length, "Length mismatch");
        for (uint256 i = 0; i < textKeys.length; i++) {
            texts[node][textKeys[i]] = textValues[i];
            emit TextChanged(node, textKeys[i], textValues[i]);
        }

        if (contenthash_.length > 0) {
            contenthashes[node] = contenthash_;
            emit ContenthashChanged(node, contenthash_);
        }
    }

    /*//////////////////////////////////////////////////////////////
                              ADMIN
    //////////////////////////////////////////////////////////////*/

    function setRegistrar(address _registrar) external onlyOwner {
        registrar = ISubnameRegistrar(_registrar);
        emit RegistrarUpdated(_registrar);
    }
}
