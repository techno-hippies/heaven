// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SurveyRegistry - On-chain registry for encrypted survey responses
/// @notice Maps wallet + schemaId to IPFS CID for portable, encrypted surveys
/// @dev Lit Protocol uses areMatched() from Dating contract for access control
contract SurveyRegistry {
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

    // ============ WRITE FUNCTIONS ============

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

        address wallet = msg.sender;
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
}
