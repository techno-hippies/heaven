// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IRecords {
    function registerNode(bytes32 node, uint256 tokenId) external;
    function clearRecords(bytes32 node) external;
}

/// @title SubnameRegistrarV2
/// @notice ERC721 for ENS subdomain ownership on L1 (adds min length + reserved + owner bypass)
contract SubnameRegistrarV2 is ERC721, Ownable, ReentrancyGuard {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/
    error AlreadyRegistered();
    error InvalidLabel();
    error LabelTooShort();
    error InsufficientPayment();
    error Expired();
    error Reserved();
    error DurationTooLong();
    error RegistrationsClosed();
    error InvalidMultiplier();
    error NotAuthorized();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/
    event SubnameRegistered(uint256 indexed tokenId, string label, address indexed owner, uint256 expiry);
    event SubnameRenewed(uint256 indexed tokenId, uint256 newExpiry);
    event PriceUpdated(uint256 newPrice);
    event RecordsContractUpdated(address newRecords);
    event MinLabelLengthUpdated(uint8 newMinLength);
    event MaxDurationUpdated(uint256 newMaxDuration);
    event ReservedUpdated(bytes32 indexed labelHash, bool isReserved);
    event LengthPricingUpdated(bool enabled, uint16 mult1, uint16 mult2, uint16 mult3, uint16 mult4);
    event RegistrationsOpenUpdated(bool open);
    event OperatorUpdated(address indexed operator, bool allowed);

    /*//////////////////////////////////////////////////////////////
                                 STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice Display only (e.g., "star")
    string public parentName;

    /// @notice Display only (e.g., "hnsbridge.eth")
    string public tld;

    /// @notice namehash(parentName.tld) (e.g., namehash("star.hnsbridge.eth"))
    bytes32 public parentNode;

    /// @notice Price per year in wei
    uint256 public pricePerYear;

    /// @notice Minimum registration duration in seconds (1 year)
    uint256 public constant MIN_DURATION = 365 days;

    /// @notice Grace period after expiry before anyone can re-register
    uint256 public constant GRACE_PERIOD = 90 days;

    /// @notice Policy: minimum label length for PUBLIC registration (e.g., 4)
    uint8 public minLabelLength;

    /// @notice Policy: cap durations (prevents free-tier "forever" locks)
    uint256 public maxDuration;

    /// @notice Safety switch: registrations closed until explicitly opened
    bool public registrationsOpen;

    /// @notice Length-based pricing (for paid TLDs)
    bool public lengthPricingEnabled;
    uint16 public lengthMult1; // 1-char multiplier (e.g., 100 = 100x base)
    uint16 public lengthMult2; // 2-char multiplier (e.g., 50 = 50x base)
    uint16 public lengthMult3; // 3-char multiplier (e.g., 10 = 10x base)
    uint16 public lengthMult4; // 4-char multiplier (e.g., 3 = 3x base)

    /// @notice Records contract address
    address public records;

    /// @notice Operators (e.g., auction house) that can mint reserved names
    mapping(address => bool) public operators;

    /// @notice Reserved blocklist: keccak256(bytes(label)) => true
    mapping(bytes32 => bool) public reserved;

    /// @notice labelHash => tokenId (gas efficient)
    mapping(bytes32 => uint256) public labelHashToTokenId;

    /// @notice tokenId => label (for display)
    mapping(uint256 => string) public tokenIdToLabel;

    /// @notice tokenId => labelHash (for reverse lookup)
    mapping(uint256 => bytes32) public tokenIdToLabelHash;

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
        bytes32 _parentNode,
        uint256 _pricePerYear,
        uint8 _minLabelLength,
        uint256 _maxDuration,
        address _owner
    )
        ERC721(
            string.concat(_parentName, ".", _tld, " Subnames"),
            string.concat("SLD-", _parentName)
        )
        Ownable(_owner)
    {
        parentName = _parentName;
        tld = _tld;
        parentNode = _parentNode;

        pricePerYear = _pricePerYear;
        minLabelLength = _minLabelLength;
        maxDuration = _maxDuration;

        _nextTokenId = 1;
    }

    /*//////////////////////////////////////////////////////////////
                            REGISTRATION
    //////////////////////////////////////////////////////////////*/

    function register(string calldata label, uint256 duration)
        external
        payable
        returns (uint256 tokenId)
    {
        return registerFor(label, msg.sender, duration);
    }

    function registerFor(string calldata label, address to, uint256 duration)
        public
        payable
        nonReentrant
        returns (uint256 tokenId)
    {
        // Compute labelHash once for the entire call
        bytes32 labelHash = keccak256(bytes(label));

        _enforcePublicPolicy(label, labelHash, duration);

        uint256 existingId = labelHashToTokenId[labelHash];
        if (existingId != 0) {
            uint256 existingExpiry = expiries[existingId];
            if (block.timestamp < existingExpiry + GRACE_PERIOD) revert AlreadyRegistered();

            _burn(existingId);
            delete tokenIdToLabel[existingId];
            delete tokenIdToLabelHash[existingId];
            delete expiries[existingId];
            delete labelHashToTokenId[labelHash];

            if (records != address(0)) {
                bytes32 node = _nodeFromHash(labelHash);
                IRecords(records).clearRecords(node);
            }
        }

        uint256 cost = _calculatePrice(label, duration);
        if (msg.value < cost) revert InsufficientPayment();

        tokenId = _nextTokenId++;
        uint256 expiry = block.timestamp + duration;

        labelHashToTokenId[labelHash] = tokenId;
        tokenIdToLabel[tokenId] = label;
        tokenIdToLabelHash[tokenId] = labelHash;
        expiries[tokenId] = expiry;

        _safeMint(to, tokenId);

        if (records != address(0)) {
            bytes32 node = _nodeFromHash(labelHash);
            IRecords(records).registerNode(node, tokenId);
        }

        emit SubnameRegistered(tokenId, label, to, expiry);

        if (msg.value > cost) {
            (bool ok,) = msg.sender.call{value: msg.value - cost}("");
            require(ok, "Refund failed");
        }
    }

    /// @notice Owner bypass mint: can mint short or reserved names for giveaways/auctions/partners.
    /// @dev Bypasses minLabelLength, reserved check, maxDuration, and registrationsOpen
    function ownerRegister(string calldata label, address to, uint256 duration)
        external
        onlyOwner
        nonReentrant
        returns (uint256 tokenId)
    {
        // Only enforce character validity + minimum duration
        if (!_isValidLabelChars(label)) revert InvalidLabel();
        if (duration < MIN_DURATION) revert InvalidLabel();
        // Note: owner bypasses maxDuration for partnerships/giveaways

        bytes32 labelHash = keccak256(bytes(label));

        uint256 existingId = labelHashToTokenId[labelHash];
        if (existingId != 0) {
            uint256 existingExpiry = expiries[existingId];
            if (block.timestamp < existingExpiry + GRACE_PERIOD) revert AlreadyRegistered();

            _burn(existingId);
            delete tokenIdToLabel[existingId];
            delete tokenIdToLabelHash[existingId];
            delete expiries[existingId];
            delete labelHashToTokenId[labelHash];

            if (records != address(0)) {
                bytes32 node = _nodeFromHash(labelHash);
                IRecords(records).clearRecords(node);
            }
        }

        tokenId = _nextTokenId++;
        uint256 expiry = block.timestamp + duration;

        labelHashToTokenId[labelHash] = tokenId;
        tokenIdToLabel[tokenId] = label;
        tokenIdToLabelHash[tokenId] = labelHash;
        expiries[tokenId] = expiry;

        _safeMint(to, tokenId);

        if (records != address(0)) {
            bytes32 node = _nodeFromHash(labelHash);
            IRecords(records).registerNode(node, tokenId);
        }

        emit SubnameRegistered(tokenId, label, to, expiry);
    }

    /// @notice Operator mint path (e.g., auction house). Can mint reserved/short labels.
    /// @dev Operator pays the normal base registration fee. Premium is handled by auction contract.
    function operatorRegister(
        string calldata label,
        address to,
        uint256 duration
    ) external payable nonReentrant returns (uint256 tokenId) {
        if (!operators[msg.sender]) revert NotAuthorized();
        if (!_isValidLabelChars(label)) revert InvalidLabel();
        if (duration < MIN_DURATION) revert InvalidLabel();
        if (maxDuration != 0 && duration > maxDuration) revert DurationTooLong();

        bytes32 labelHash = keccak256(bytes(label));

        uint256 existingId = labelHashToTokenId[labelHash];
        if (existingId != 0) {
            uint256 existingExpiry = expiries[existingId];
            if (block.timestamp < existingExpiry + GRACE_PERIOD) revert AlreadyRegistered();

            _burn(existingId);
            delete tokenIdToLabel[existingId];
            delete tokenIdToLabelHash[existingId];
            delete expiries[existingId];
            delete labelHashToTokenId[labelHash];

            if (records != address(0)) {
                IRecords(records).clearRecords(_nodeFromHash(labelHash));
            }
        }

        uint256 cost = _calculatePrice(label, duration);
        if (msg.value < cost) revert InsufficientPayment();

        tokenId = _nextTokenId++;
        uint256 expiry = block.timestamp + duration;

        labelHashToTokenId[labelHash] = tokenId;
        tokenIdToLabel[tokenId] = label;
        tokenIdToLabelHash[tokenId] = labelHash;
        expiries[tokenId] = expiry;

        _safeMint(to, tokenId);

        if (records != address(0)) {
            IRecords(records).registerNode(_nodeFromHash(labelHash), tokenId);
        }

        emit SubnameRegistered(tokenId, label, to, expiry);

        if (msg.value > cost) {
            (bool ok,) = msg.sender.call{value: msg.value - cost}("");
            require(ok, "Refund failed");
        }
    }

    function renew(uint256 tokenId, uint256 duration) external payable nonReentrant {
        if (duration < MIN_DURATION) revert InvalidLabel();
        if (maxDuration != 0 && duration > maxDuration) revert DurationTooLong();

        uint256 currentExpiry = expiries[tokenId];
        if (currentExpiry == 0) revert InvalidLabel();
        if (block.timestamp > currentExpiry + GRACE_PERIOD) revert Expired();

        uint256 cost = _calculatePriceByTokenId(tokenId, duration);
        if (msg.value < cost) revert InsufficientPayment();

        uint256 startFrom = currentExpiry > block.timestamp ? currentExpiry : block.timestamp;
        uint256 newExpiry = startFrom + duration;
        expiries[tokenId] = newExpiry;

        emit SubnameRenewed(tokenId, newExpiry);

        if (msg.value > cost) {
            (bool ok,) = msg.sender.call{value: msg.value - cost}("");
            require(ok, "Refund failed");
        }
    }

    /*//////////////////////////////////////////////////////////////
                              VIEWS
    //////////////////////////////////////////////////////////////*/

    function fullName(uint256 tokenId) external view returns (string memory) {
        string memory label = tokenIdToLabel[tokenId];
        if (bytes(label).length == 0) return "";
        return string.concat(label, ".", parentName, ".", tld);
    }

    function available(string calldata label) external view returns (bool) {
        // Check validity first
        if (!_isValidLabelChars(label)) return false;
        if (bytes(label).length < minLabelLength) return false;

        bytes32 labelHash = keccak256(bytes(label));
        if (reserved[labelHash]) return false;

        uint256 tokenId = labelHashToTokenId[labelHash];
        if (tokenId == 0) return true;
        return block.timestamp >= expiries[tokenId] + GRACE_PERIOD;
    }

    /// @notice Get tokenId for a label (convenience wrapper)
    function labelToTokenId(string calldata label) external view returns (uint256) {
        return labelHashToTokenId[keccak256(bytes(label))];
    }

    function namehash(string calldata label) external view returns (bytes32) {
        return _nodeFromHash(keccak256(bytes(label)));
    }

    /// @notice Get ENS node for a tokenId (uses stored labelHash)
    function nodeOf(uint256 tokenId) external view returns (bytes32) {
        bytes32 lh = tokenIdToLabelHash[tokenId];
        if (lh == bytes32(0)) return bytes32(0);
        return _nodeFromHash(lh);
    }

    function isExpired(uint256 tokenId) external view returns (bool) {
        return block.timestamp > expiries[tokenId];
    }

    /// @notice Check if a label is reserved
    function isReserved(string calldata label) external view returns (bool) {
        return reserved[keccak256(bytes(label))];
    }

    /// @notice Get registration price for a label (for auction house / UI)
    function price(string calldata label, uint256 duration) external view returns (uint256) {
        if (!_isValidLabelChars(label)) revert InvalidLabel();
        if (duration < MIN_DURATION) revert InvalidLabel();
        if (maxDuration != 0 && duration > maxDuration) revert DurationTooLong();
        return _calculatePrice(label, duration);
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

    function setMinLabelLength(uint8 _minLabelLength) external onlyOwner {
        minLabelLength = _minLabelLength;
        emit MinLabelLengthUpdated(_minLabelLength);
    }

    function setMaxDuration(uint256 _maxDuration) external onlyOwner {
        maxDuration = _maxDuration;
        emit MaxDurationUpdated(_maxDuration);
    }

    /// @notice Enable/configure length-based pricing (for paid TLDs)
    /// @param enabled Whether to apply length multipliers
    /// @param mult1 Multiplier for 1-char labels (e.g., 100 = 100x base price)
    /// @param mult2 Multiplier for 2-char labels (e.g., 50 = 50x)
    /// @param mult3 Multiplier for 3-char labels (e.g., 10 = 10x)
    /// @param mult4 Multiplier for 4-char labels (e.g., 3 = 3x)
    function setLengthPricing(
        bool enabled,
        uint16 mult1,
        uint16 mult2,
        uint16 mult3,
        uint16 mult4
    ) external onlyOwner {
        if (enabled) {
            if (mult1 == 0 || mult2 == 0 || mult3 == 0 || mult4 == 0) {
                revert InvalidMultiplier();
            }
        }
        lengthPricingEnabled = enabled;
        lengthMult1 = mult1;
        lengthMult2 = mult2;
        lengthMult3 = mult3;
        lengthMult4 = mult4;
        emit LengthPricingUpdated(enabled, mult1, mult2, mult3, mult4);
    }

    /// @notice Open or close public registrations
    function setRegistrationsOpen(bool open) external onlyOwner {
        registrationsOpen = open;
        emit RegistrationsOpenUpdated(open);
    }

    /// @notice Set operator status (e.g., auction house)
    function setOperator(address operator, bool allowed) external onlyOwner {
        operators[operator] = allowed;
        emit OperatorUpdated(operator, allowed);
    }

    /// @notice Gas-efficient batch set (preferred): compute hashes off-chain
    function setReservedHashes(bytes32[] calldata hashes, bool status) external onlyOwner {
        for (uint256 i = 0; i < hashes.length; i++) {
            reserved[hashes[i]] = status;
            emit ReservedUpdated(hashes[i], status);
        }
    }

    /// @notice Convenience batch set (hashing on-chain, validates labels)
    function setReservedLabels(string[] calldata labels, bool status) external onlyOwner {
        for (uint256 i = 0; i < labels.length; i++) {
            if (!_isValidLabelChars(labels[i])) revert InvalidLabel();
            bytes32 h = keccak256(bytes(labels[i]));
            reserved[h] = status;
            emit ReservedUpdated(h, status);
        }
    }

    function withdraw() external onlyOwner {
        (bool ok,) = owner().call{value: address(this).balance}("");
        require(ok, "Withdraw failed");
    }

    /*//////////////////////////////////////////////////////////////
                              INTERNAL
    //////////////////////////////////////////////////////////////*/

    function _multForLength(uint256 len) internal view returns (uint256) {
        if (!lengthPricingEnabled) return 1;
        if (len == 1) return lengthMult1;
        if (len == 2) return lengthMult2;
        if (len == 3) return lengthMult3;
        if (len == 4) return lengthMult4;
        return 1;
    }

    function _calculatePrice(string calldata label, uint256 duration) internal view returns (uint256) {
        uint256 mult = _multForLength(bytes(label).length);
        return (pricePerYear * mult * duration) / 365 days;
    }

    function _calculatePriceByTokenId(uint256 tokenId, uint256 duration) internal view returns (uint256) {
        uint256 mult = _multForLength(bytes(tokenIdToLabel[tokenId]).length);
        return (pricePerYear * mult * duration) / 365 days;
    }

    function _enforcePublicPolicy(string calldata label, bytes32 labelHash, uint256 duration) internal view {
        if (!registrationsOpen) revert RegistrationsClosed();
        if (!_isValidLabelChars(label)) revert InvalidLabel();

        uint256 len = bytes(label).length;
        if (len < minLabelLength) revert LabelTooShort();

        if (duration < MIN_DURATION) revert InvalidLabel();
        if (maxDuration != 0 && duration > maxDuration) revert DurationTooLong();

        if (reserved[labelHash]) revert Reserved();
    }

    function _isValidLabelChars(string calldata label) internal pure returns (bool) {
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

    /// @dev Compute node from pre-computed labelHash (gas efficient)
    function _nodeFromHash(bytes32 labelHash) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(parentNode, labelHash));
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            if (block.timestamp > expiries[tokenId]) revert Expired();
        }
        return super._update(to, tokenId, auth);
    }
}
