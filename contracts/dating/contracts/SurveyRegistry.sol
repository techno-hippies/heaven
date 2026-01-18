// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

/// @title SurveyRegistry - On-chain registry for encrypted survey responses
/// @notice Maps wallet + schemaId to IPFS CID for portable, encrypted surveys
/// @dev Lit Protocol uses areMatched() from Dating contract for access control
contract SurveyRegistry is EIP712, Nonces {
    using ECDSA for bytes32;
    // ============ TYPES ============

    struct SurveyEntry {
        string responseCid;      // IPFS CID of survey-response.json
        uint8 encryptionMode;    // 0=none, 1=matchOnly, 2=tiered (public+matchOnly+private)
        uint64 updatedAt;
        bool deleted;            // Soft delete flag
    }

    // ============ STORAGE ============

    // wallet => schemaIdBytes32 => entry
    mapping(address => mapping(bytes32 => SurveyEntry)) public surveys;

    // Track all schemaIds a wallet has registered (for enumeration)
    mapping(address => bytes32[]) public walletSchemas;
    mapping(address => mapping(bytes32 => bool)) private hasSchema;

    // ============ EVENTS ============

    event SurveyRegistered(
        address indexed wallet,
        bytes32 indexed schemaIdBytes32,
        string responseCid,
        uint8 encryptionMode
    );

    event SurveyUpdated(
        address indexed wallet,
        bytes32 indexed schemaIdBytes32,
        string responseCid,
        uint8 encryptionMode
    );

    event SurveyDeleted(
        address indexed wallet,
        bytes32 indexed schemaIdBytes32
    );

    event Registered(
        address indexed user,
        address indexed relayer,
        bytes32 indexed surveyId,
        string cid
    );

    bytes32 private constant REGISTER_TYPEHASH =
        keccak256(
            "Register(address user,bytes32 surveyId,bytes32 cidHash,uint8 encryptionMode,uint256 nonce,uint256 deadline)"
        );

    // ============ WRITE FUNCTIONS ============

    constructor() EIP712("SurveyRegistry", "1") {}

    /// @notice Register or update a survey response
    /// @param schemaIdBytes32 keccak256(utf8("schemaId:version"))
    /// @param responseCid IPFS CID of the survey-response.json
    /// @param encryptionMode 0=none, 1=matchOnly only, 2=tiered (has public+matchOnly+private)
    function register(
        bytes32 schemaIdBytes32,
        string calldata responseCid,
        uint8 encryptionMode
    ) external {
        require(bytes(responseCid).length > 0, "Empty CID");
        require(encryptionMode <= 2, "Invalid encryption mode");

        _register(msg.sender, schemaIdBytes32, responseCid, encryptionMode, msg.sender);
    }

    /// @notice Register on behalf of a user using an EIP-712 signature
    /// @param user The user wallet that owns the survey entry
    /// @param surveyId The schema ID
    /// @param cid IPFS CID of the survey-response.json
    /// @param encryptionMode 0=none, 1=matchOnly only, 2=tiered (has public+matchOnly+private)
    /// @param deadline Unix timestamp (seconds) after which the signature is invalid
    /// @param sig EIP-712 signature from the user
    function registerFor(
        address user,
        bytes32 surveyId,
        string calldata cid,
        uint8 encryptionMode,
        uint256 deadline,
        bytes calldata sig
    ) external {
        require(bytes(cid).length > 0, "Empty CID");
        require(encryptionMode <= 2, "Invalid encryption mode");
        require(block.timestamp <= deadline, "Signature expired");

        uint256 nonce = _useNonce(user);
        bytes32 structHash = keccak256(
            abi.encode(
                REGISTER_TYPEHASH,
                user,
                surveyId,
                keccak256(bytes(cid)),
                encryptionMode,
                nonce,
                deadline
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, sig);
        require(signer == user, "Invalid signature");

        _register(user, surveyId, cid, encryptionMode, msg.sender);
    }

    /// @notice Delete a survey entry (blanks CID, keeps history in events)
    /// @param schemaIdBytes32 The schema to delete
    function deleteSurvey(bytes32 schemaIdBytes32) external {
        address wallet = msg.sender;
        SurveyEntry storage entry = surveys[wallet][schemaIdBytes32];
        require(bytes(entry.responseCid).length > 0, "Not found");

        entry.responseCid = "";
        entry.updatedAt = uint64(block.timestamp);
        entry.deleted = true;

        emit SurveyDeleted(wallet, schemaIdBytes32);
    }

    // ============ VIEW FUNCTIONS ============

    /// @notice Get survey entry for a wallet + schema (returns empty CID if deleted)
    function getSurvey(
        address wallet,
        bytes32 schemaIdBytes32
    ) external view returns (string memory responseCid, uint8 encryptionMode, uint64 updatedAt) {
        SurveyEntry memory entry = surveys[wallet][schemaIdBytes32];
        return (entry.responseCid, entry.encryptionMode, entry.updatedAt);
    }

    /// @notice Check if wallet has an active (non-deleted) survey for schema
    function hasSurvey(address wallet, bytes32 schemaIdBytes32) external view returns (bool) {
        SurveyEntry memory entry = surveys[wallet][schemaIdBytes32];
        return bytes(entry.responseCid).length > 0 && !entry.deleted;
    }

    /// @notice Get all schemaIds registered by a wallet (includes deleted, check hasSurvey)
    function getWalletSchemas(address wallet) external view returns (bytes32[] memory) {
        return walletSchemas[wallet];
    }

    /// @notice Get active (non-deleted) schemas for a wallet
    function getActiveSchemas(address wallet) external view returns (bytes32[] memory) {
        bytes32[] memory all = walletSchemas[wallet];
        uint256 count = 0;

        // Count active
        for (uint256 i = 0; i < all.length; i++) {
            if (!surveys[wallet][all[i]].deleted && bytes(surveys[wallet][all[i]].responseCid).length > 0) {
                count++;
            }
        }

        // Build result
        bytes32[] memory active = new bytes32[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (!surveys[wallet][all[i]].deleted && bytes(surveys[wallet][all[i]].responseCid).length > 0) {
                active[j++] = all[i];
            }
        }

        return active;
    }

    /// @notice Get count of active schemas for a wallet
    function getSchemaCount(address wallet) external view returns (uint256) {
        bytes32[] memory all = walletSchemas[wallet];
        uint256 count = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (!surveys[wallet][all[i]].deleted && bytes(surveys[wallet][all[i]].responseCid).length > 0) {
                count++;
            }
        }
        return count;
    }

    // ============ INTERNAL FUNCTIONS ============

    function _register(
        address wallet,
        bytes32 schemaIdBytes32,
        string calldata responseCid,
        uint8 encryptionMode,
        address relayer
    ) internal {
        bool isNew = bytes(surveys[wallet][schemaIdBytes32].responseCid).length == 0;

        surveys[wallet][schemaIdBytes32] = SurveyEntry({
            responseCid: responseCid,
            encryptionMode: encryptionMode,
            updatedAt: uint64(block.timestamp),
            deleted: false
        });

        if (!hasSchema[wallet][schemaIdBytes32]) {
            walletSchemas[wallet].push(schemaIdBytes32);
            hasSchema[wallet][schemaIdBytes32] = true;
        }

        if (isNew) {
            emit SurveyRegistered(wallet, schemaIdBytes32, responseCid, encryptionMode);
        } else {
            emit SurveyUpdated(wallet, schemaIdBytes32, responseCid, encryptionMode);
        }

        emit Registered(wallet, relayer, schemaIdBytes32, responseCid);
    }
}
