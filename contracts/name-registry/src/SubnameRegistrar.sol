// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IRecords {
    function registerNode(bytes32 node, uint256 tokenId) external;
    function clearRecords(bytes32 node) external;
}

/// @title SubnameRegistrar
/// @notice ERC721 for ENS subdomain ownership on L1
/// @dev Users purchase subdomains (e.g., alice.neodate.eth)
contract SubnameRegistrar is ERC721, Ownable {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error AlreadyRegistered();
    error NotAuthorized();
    error InvalidLabel();
    error InsufficientPayment();
    error Expired();
    error NotExpired();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event SubnameRegistered(
        uint256 indexed tokenId,
        string label,
        address indexed owner,
        uint256 expiry
    );
    event SubnameRenewed(uint256 indexed tokenId, uint256 newExpiry);
    event PriceUpdated(uint256 newPrice);
    event RecordsContractUpdated(address newRecords);

    /*//////////////////////////////////////////////////////////////
                                 STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice The parent ENS name without .eth (e.g., "neodate")
    string public parentName;

    /// @notice The TLD (e.g., "eth")
    string public tld;

    /// @notice Price per year in wei
    uint256 public pricePerYear;

    /// @notice Minimum registration duration in seconds (1 year)
    uint256 public constant MIN_DURATION = 365 days;

    /// @notice Grace period after expiry before anyone can re-register
    uint256 public constant GRACE_PERIOD = 90 days;

    /// @notice Records contract address
    address public records;

    /// @notice label => tokenId
    mapping(string => uint256) public labelToTokenId;

    /// @notice tokenId => label
    mapping(uint256 => string) public tokenIdToLabel;

    /// @notice tokenId => expiry timestamp
    mapping(uint256 => uint256) public expiries;

    /// @notice Next token ID
    uint256 private _nextTokenId;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        string memory _parentName,
        string memory _tld,
        uint256 _pricePerYear,
        address _owner
    ) ERC721(
        string.concat(_parentName, ".", _tld, " Subnames"),
        string.concat("SLD-", _parentName)
    ) Ownable(_owner) {
        parentName = _parentName;
        tld = _tld;
        pricePerYear = _pricePerYear;
        _nextTokenId = 1;
    }

    /*//////////////////////////////////////////////////////////////
                            REGISTRATION
    //////////////////////////////////////////////////////////////*/

    /// @notice Register a new subname
    /// @param label The subdomain label (e.g., "alice" for alice.cooltld)
    /// @param duration Registration duration in seconds (min 1 year)
    /// @return tokenId The minted token ID
    function register(
        string calldata label,
        uint256 duration
    ) external payable returns (uint256 tokenId) {
        return registerFor(label, msg.sender, duration);
    }

    /// @notice Register a subname for another address
    /// @param label The subdomain label
    /// @param to The recipient address
    /// @param duration Registration duration in seconds
    /// @return tokenId The minted token ID
    function registerFor(
        string calldata label,
        address to,
        uint256 duration
    ) public payable returns (uint256 tokenId) {
        if (!_isValidLabel(label)) revert InvalidLabel();
        if (duration < MIN_DURATION) revert InvalidLabel();

        uint256 existingId = labelToTokenId[label];
        if (existingId != 0) {
            uint256 existingExpiry = expiries[existingId];
            // Can only re-register after grace period
            if (block.timestamp < existingExpiry + GRACE_PERIOD) {
                revert AlreadyRegistered();
            }
            // Burn the expired token
            _burn(existingId);
            delete tokenIdToLabel[existingId];
            // Clear old records so new owner doesn't inherit them
            if (records != address(0)) {
                bytes32 oldNode = _namehash(label);
                IRecords(records).clearRecords(oldNode);
            }
        }

        uint256 cost = _calculatePrice(duration);
        if (msg.value < cost) revert InsufficientPayment();

        tokenId = _nextTokenId++;
        uint256 expiry = block.timestamp + duration;

        labelToTokenId[label] = tokenId;
        tokenIdToLabel[tokenId] = label;
        expiries[tokenId] = expiry;

        _mint(to, tokenId);

        // Register node->tokenId mapping in Records contract for authorization
        if (records != address(0)) {
            bytes32 node = _namehash(label);
            IRecords(records).registerNode(node, tokenId);
        }

        emit SubnameRegistered(tokenId, label, to, expiry);

        // Refund excess payment
        if (msg.value > cost) {
            (bool success, ) = msg.sender.call{value: msg.value - cost}("");
            require(success, "Refund failed");
        }
    }

    /// @notice Renew an existing subname
    /// @param tokenId The token ID to renew
    /// @param duration Additional duration in seconds
    function renew(uint256 tokenId, uint256 duration) external payable {
        if (duration < MIN_DURATION) revert InvalidLabel();

        uint256 currentExpiry = expiries[tokenId];
        if (currentExpiry == 0) revert InvalidLabel();
        if (block.timestamp > currentExpiry + GRACE_PERIOD) revert Expired();

        uint256 cost = _calculatePrice(duration);
        if (msg.value < cost) revert InsufficientPayment();

        // Extend from current expiry or now, whichever is later
        uint256 startFrom = currentExpiry > block.timestamp ? currentExpiry : block.timestamp;
        uint256 newExpiry = startFrom + duration;
        expiries[tokenId] = newExpiry;

        emit SubnameRenewed(tokenId, newExpiry);

        if (msg.value > cost) {
            (bool success, ) = msg.sender.call{value: msg.value - cost}("");
            require(success, "Refund failed");
        }
    }

    /*//////////////////////////////////////////////////////////////
                              VIEWS
    //////////////////////////////////////////////////////////////*/

    /// @notice Get the full name for a token (e.g., "alice.neodate.eth")
    function fullName(uint256 tokenId) external view returns (string memory) {
        string memory label = tokenIdToLabel[tokenId];
        if (bytes(label).length == 0) return "";
        return string.concat(label, ".", parentName, ".", tld);
    }

    /// @notice Check if a label is available
    function available(string calldata label) external view returns (bool) {
        uint256 tokenId = labelToTokenId[label];
        if (tokenId == 0) return true;
        return block.timestamp >= expiries[tokenId] + GRACE_PERIOD;
    }

    /// @notice Get namehash for a label (ENS-compatible)
    function namehash(string calldata label) external view returns (bytes32) {
        return _namehash(label);
    }

    /// @notice Check if a name is expired (but may still be in grace period)
    function isExpired(uint256 tokenId) external view returns (bool) {
        return block.timestamp > expiries[tokenId];
    }

    /*//////////////////////////////////////////////////////////////
                              ADMIN
    //////////////////////////////////////////////////////////////*/

    function setPrice(uint256 _pricePerYear) external onlyOwner {
        pricePerYear = _pricePerYear;
        emit PriceUpdated(_pricePerYear);
    }

    function setRecords(address _records) external onlyOwner {
        records = _records;
        emit RecordsContractUpdated(_records);
    }

    function withdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    /*//////////////////////////////////////////////////////////////
                              INTERNAL
    //////////////////////////////////////////////////////////////*/

    function _calculatePrice(uint256 duration) internal view returns (uint256) {
        return (pricePerYear * duration) / 365 days;
    }

    function _isValidLabel(string calldata label) internal pure returns (bool) {
        bytes memory b = bytes(label);
        if (b.length == 0 || b.length > 63) return false;

        for (uint256 i = 0; i < b.length; i++) {
            bytes1 c = b[i];
            // Allow a-z, 0-9, hyphen (but not at start/end)
            bool isLower = c >= 0x61 && c <= 0x7a;
            bool isDigit = c >= 0x30 && c <= 0x39;
            bool isHyphen = c == 0x2d;

            if (!isLower && !isDigit && !isHyphen) return false;
            if (isHyphen && (i == 0 || i == b.length - 1)) return false;
        }
        return true;
    }

    function _namehash(string calldata label) internal view returns (bytes32) {
        // Compute namehash for label.parentName.tld (e.g., alice.neodate.eth)
        // ENS namehash: start with 0x00, iteratively hash each label from right to left

        // Start with empty node
        bytes32 node = bytes32(0);

        // Hash TLD first (e.g., "eth")
        node = keccak256(abi.encodePacked(node, keccak256(bytes(tld))));

        // Hash parent name (e.g., "neodate")
        node = keccak256(abi.encodePacked(node, keccak256(bytes(parentName))));

        // Hash the subname label (e.g., "alice")
        node = keccak256(abi.encodePacked(node, keccak256(bytes(label))));

        return node;
    }

    /// @dev Override to check expiry on transfers
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        // Allow burns and mints, but check expiry on transfers
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            if (block.timestamp > expiries[tokenId]) revert Expired();
        }
        return super._update(to, tokenId, auth);
    }
}
