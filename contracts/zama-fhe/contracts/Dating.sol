// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, euint16, euint64, ebool, externalEuint8, externalEuint16, externalEbool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @title Dating - Privacy-Preserving Dating with Directional Shared Values
/// @notice FHE dating with "Shared on match" revealing actual values (bucketed for numerics)
/// @dev Features:
///      - Directional shared values reveal on match
///      - Age shared as 5-year bucket start (18, 23, 28, ...)
///      - Kink shared as group (0=vanilla, 1=open-minded, 2=enthusiast)
///      - Client computes "why matched" vs "also shared" from decrypted values + local prefs
contract Dating is ZamaEthereumConfig {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // ============ CONSTANTS ============

    // Attribute IDs
    uint8 public constant EXACT_AGE = 0;           // Numeric: 18-254, 255=UNKNOWN (verified)
    uint8 public constant BIOLOGICAL_SEX = 1;      // Categorical: 0=M, 1=F, 15=UNKNOWN (verified, private by default)
    uint8 public constant GENDER_IDENTITY = 2;     // Categorical: 1=man, 2=woman, 3=non-binary, etc., 15=UNKNOWN
    uint8 public constant KIDS = 3;                // Categorical: 1-4, 15=UNKNOWN
    uint8 public constant KIDS_TIMELINE = 4;       // Categorical: 1-6, 15=UNKNOWN
    uint8 public constant RELATIONSHIP_STRUCTURE = 5; // Categorical: 1=Monogamous, 2=Open, 3=Poly, 4=Relationship anarchy, 15=UNKNOWN
    uint8 public constant SMOKING = 6;             // Categorical: 1-3, 15=UNKNOWN
    uint8 public constant RELATIONSHIP_STATUS = 7; // Categorical: 1=Single,2=Relationship,3=Married,4=Separated,5=Divorced, 15=UNKNOWN
    uint8 public constant DRINKING = 8;            // Categorical: 1-3, 15=UNKNOWN
    uint8 public constant RELIGION = 9;            // Categorical: 1-6, 15=UNKNOWN
    uint8 public constant KINK_LEVEL = 10;         // Numeric: 1-7, 255=UNKNOWN
    uint8 public constant GROUP_PLAY_MODE = 11;    // Categorical: 1-3, 15=UNKNOWN
    uint8 public constant NUM_ATTRS = 12;

    // UNKNOWN sentinels
    uint8 public constant UNKNOWN_CATEGORICAL = 15;
    uint8 public constant UNKNOWN_NUMERIC = 255;

    // Wildcard = accept all known values (NONE policy)
    uint16 public constant WILDCARD_MASK = 0x7FFF;

    // Bit 15 in prefMask means "accept UNKNOWN"
    uint16 public constant UNKNOWN_BIT = 1 << 15;

    // EIP-712 domain
    bytes32 public constant EIP712_DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );
    bytes32 public constant LIKE_AUTH_TYPEHASH = keccak256(
        "LikeAuthorization(bytes32 candidateSetRoot,uint8 maxLikes,uint64 expiry,uint64 nonce)"
    );

    bytes32 public immutable DOMAIN_SEPARATOR;

    // ============ STORAGE ============

    address public admin;
    address public directory;
    address public oracle;
    address public relayer;

    // Per-user encrypted values (what I am)
    mapping(address => euint8[NUM_ATTRS]) private encryptedValues;

    // Per-user encrypted preferences (what I want)
    mapping(address => euint16[NUM_ATTRS]) private encryptedPrefMasks;
    mapping(address => euint8[NUM_ATTRS]) private encryptedPrefMin;
    mapping(address => euint8[NUM_ATTRS]) private encryptedPrefMax;

    // Share on match: true = willing to reveal value to match (bucketed for numerics)
    mapping(address => ebool[NUM_ATTRS]) private encryptedShareOnMatch;

    // Profile initialization tracking
    mapping(address => bool) public profileInitialized;

    // Encrypted likes
    mapping(address => mapping(address => ebool)) private encryptedLikes;
    mapping(address => mapping(address => bool)) private hasLiked;

    // Pending match checks
    struct PendingMatch {
        address user1;
        address user2;
        ebool mutualLikeHandle;
    }
    mapping(bytes32 => PendingMatch) private pendingMatches;

    // Public match status
    mapping(address => mapping(address => bool)) public isMatch;

    // Directional shared values (pair-only decryptable)
    // Canonical pairKey = keccak256(abi.encodePacked(user1, user2)) where user1 < user2
    // sharedValuesUser1[attr] = value shared by user1 (lower address) to user2
    // sharedValuesUser2[attr] = value shared by user2 (higher address) to user1
    mapping(bytes32 => euint8[NUM_ATTRS]) private sharedValuesUser1;
    mapping(bytes32 => euint8[NUM_ATTRS]) private sharedValuesUser2;

    // Like authorization
    struct LikeAuth {
        bytes32 candidateSetRoot;
        uint8 maxLikes;
        uint64 expiry;
        bool active;
    }
    mapping(address => mapping(uint64 => LikeAuth)) public likeAuths;
    mapping(address => mapping(uint64 => uint8)) public likesUsed;
    mapping(address => mapping(uint64 => bool)) public nonceUsed;

    // Direct like quota
    uint8 public directLikeQuota = 10;
    mapping(address => uint64) public directLikeDay;
    mapping(address => uint8) public directLikesUsed;

    // self.xyz sybil resistance
    mapping(bytes32 => bool) public nullifierUsed;
    mapping(address => bool) public isVerified;

    // Photo grants
    mapping(bytes32 => bool) public photoGrants;
    mapping(address => bool) public autoPhotoGrant;

    // ============ EVENTS ============

    event ProfileSet(address indexed user);
    event VerifiedAttributesSet(address indexed user, bytes32 nullifier);
    event LikesAuthorized(address indexed user, uint64 nonce, uint8 maxLikes, uint64 expiry);
    event LikeSent(address indexed from, address indexed to);
    event MatchPending(bytes32 indexed pairKey, address user1, address user2, bytes32 handle);
    event MatchCreated(address indexed user1, address indexed user2);
    event SharedValuesComputed(address indexed user1, address indexed user2);
    event PhotoGranted(address indexed subject, address indexed viewer);
    event PhotoRevoked(address indexed subject, address indexed viewer);

    // ============ CONSTRUCTOR ============

    constructor(address _admin, address _directory, address _oracle, address _relayer) {
        admin = _admin;
        directory = _directory;
        oracle = _oracle;
        relayer = _relayer;

        DOMAIN_SEPARATOR = keccak256(abi.encode(
            EIP712_DOMAIN_TYPEHASH,
            keccak256("NeoDate"),
            keccak256("3"),
            block.chainid,
            address(this)
        ));
    }

    // ============ MODIFIERS ============

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle");
        _;
    }

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Only relayer");
        _;
    }

    // ============ PROFILE SETUP ============

    /// @notice Set all attributes and preferences atomically
    /// @param values My values (UNKNOWN sentinel if not answered)
    /// @param prefMasks Prefs mask (WILDCARD = don't filter; bit 15 = accept UNKNOWN)
    /// @param prefMins Numeric pref minimums (0 = no min)
    /// @param prefMaxs Numeric pref maximums (254 = no max, 255 reserved for UNKNOWN)
    /// @param shareFlags true = share value on match (bucketed for numerics), false = never reveal
    /// @param proof FHE input proof
    function setProfile(
        externalEuint8[NUM_ATTRS] calldata values,
        externalEuint16[NUM_ATTRS] calldata prefMasks,
        externalEuint8[NUM_ATTRS] calldata prefMins,
        externalEuint8[NUM_ATTRS] calldata prefMaxs,
        externalEbool[NUM_ATTRS] calldata shareFlags,
        bytes calldata proof
    ) external {
        address user = msg.sender;
        bool userVerified = isVerified[user];

        for (uint8 i = 0; i < NUM_ATTRS; i++) {
            bool isVerifiedAttr = (i == EXACT_AGE || i == BIOLOGICAL_SEX);

            if (!isVerifiedAttr || !userVerified) {
                encryptedValues[user][i] = FHE.fromExternal(values[i], proof);
                FHE.allowThis(encryptedValues[user][i]);
            }

            encryptedPrefMasks[user][i] = FHE.fromExternal(prefMasks[i], proof);
            encryptedPrefMin[user][i] = FHE.fromExternal(prefMins[i], proof);
            encryptedPrefMax[user][i] = FHE.fromExternal(prefMaxs[i], proof);
            encryptedShareOnMatch[user][i] = FHE.fromExternal(shareFlags[i], proof);

            FHE.allowThis(encryptedPrefMasks[user][i]);
            FHE.allowThis(encryptedPrefMin[user][i]);
            FHE.allowThis(encryptedPrefMax[user][i]);
            FHE.allowThis(encryptedShareOnMatch[user][i]);
        }

        profileInitialized[user] = true;
        emit ProfileSet(user);
    }

    // ============ VERIFIED ATTRIBUTES (self.xyz) ============

    /// @notice Set verified attributes from self.xyz attestation
    function setVerifiedAttributes(
        address user,
        externalEuint8 exactAge,
        externalEuint8 biologicalSex,
        bytes32 nullifier,
        bytes calldata proof,
        bytes calldata userSig
    ) external onlyOracle {
        bytes32 bindingHash = keccak256(abi.encodePacked(user, nullifier, address(this)));
        bytes32 ethSignedHash = bindingHash.toEthSignedMessageHash();
        require(ethSignedHash.recover(userSig) == user, "Invalid user signature");

        require(!nullifierUsed[nullifier], "Nullifier already used");
        nullifierUsed[nullifier] = true;

        encryptedValues[user][EXACT_AGE] = FHE.fromExternal(exactAge, proof);
        encryptedValues[user][BIOLOGICAL_SEX] = FHE.fromExternal(biologicalSex, proof);

        FHE.allowThis(encryptedValues[user][EXACT_AGE]);
        FHE.allowThis(encryptedValues[user][BIOLOGICAL_SEX]);

        isVerified[user] = true;
        emit VerifiedAttributesSet(user, nullifier);
    }

    // ============ LIKE AUTHORIZATION ============

    function authorizeLikes(
        address user,
        bytes32 candidateSetRoot,
        uint8 maxLikes,
        uint64 expiry,
        uint64 nonce,
        bytes calldata signature
    ) external onlyRelayer {
        require(!nonceUsed[user][nonce], "Nonce already used");
        nonceUsed[user][nonce] = true;

        bytes32 structHash = keccak256(abi.encode(
            LIKE_AUTH_TYPEHASH,
            candidateSetRoot,
            maxLikes,
            expiry,
            nonce
        ));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
        require(digest.recover(signature) == user, "Invalid signature");

        likeAuths[user][nonce] = LikeAuth({
            candidateSetRoot: candidateSetRoot,
            maxLikes: maxLikes,
            expiry: expiry,
            active: true
        });

        emit LikesAuthorized(user, nonce, maxLikes, expiry);
    }

    // ============ MATCHING ============

    function submitLike(
        address liker,
        address target,
        uint64 nonce,
        bytes32[] calldata merkleProof
    ) external onlyRelayer {
        require(profileInitialized[liker], "Liker not initialized");
        require(profileInitialized[target], "Target not initialized");
        require(liker != target, "Cannot like self");

        LikeAuth storage auth = likeAuths[liker][nonce];
        require(auth.active, "Authorization not active");
        require(block.timestamp < auth.expiry, "Authorization expired");
        require(likesUsed[liker][nonce] < auth.maxLikes, "Quota exceeded");

        bytes32 leaf = keccak256(abi.encodePacked(target));
        require(
            MerkleProof.verify(merkleProof, auth.candidateSetRoot, leaf),
            "Target not in candidate set"
        );

        likesUsed[liker][nonce]++;

        if (likesUsed[liker][nonce] >= auth.maxLikes) {
            auth.active = false;
        }

        _executeLike(liker, target);
    }

    function sendLike(address target) external {
        require(profileInitialized[msg.sender], "Sender not initialized");
        require(profileInitialized[target], "Target not initialized");
        require(msg.sender != target, "Cannot like self");

        uint64 today = uint64(block.timestamp / 1 days);
        if (directLikeDay[msg.sender] != today) {
            directLikeDay[msg.sender] = today;
            directLikesUsed[msg.sender] = 0;
        }
        require(directLikesUsed[msg.sender] < directLikeQuota, "Daily direct like quota exceeded");
        directLikesUsed[msg.sender]++;

        _executeLike(msg.sender, target);
    }

    function _executeLike(address liker, address target) internal {
        require(!hasLiked[liker][target], "Already liked");

        ebool compatible = _checkCompatibility(liker, target);

        encryptedLikes[liker][target] = compatible;
        hasLiked[liker][target] = true;
        FHE.allowThis(compatible);

        emit LikeSent(liker, target);

        _checkMutualMatch(liker, target);
    }

    function _checkCompatibility(address liker, address target) internal returns (ebool) {
        ebool compatible = FHE.asEbool(true);

        for (uint8 attr = 0; attr < NUM_ATTRS; attr++) {
            ebool criterion = _checkCriterion(attr, liker, target);
            compatible = FHE.and(compatible, criterion);
        }

        return compatible;
    }

    function _checkCriterion(uint8 attr, address liker, address target) internal returns (ebool) {
        euint8 targetVal = encryptedValues[target][attr];
        euint16 prefMask = encryptedPrefMasks[liker][attr];

        if (_isNumericAttr(attr)) {
            euint8 prefMin = encryptedPrefMin[liker][attr];
            euint8 prefMax = encryptedPrefMax[liker][attr];

            euint8 safeTargetVal = _sanitizeNumeric(attr, targetVal);

            ebool isUnknown = FHE.eq(safeTargetVal, FHE.asEuint8(UNKNOWN_NUMERIC));

            ebool inRangeRaw = FHE.and(
                FHE.ge(safeTargetVal, prefMin),
                FHE.le(safeTargetVal, prefMax)
            );
            ebool inRange = FHE.and(inRangeRaw, FHE.not(isUnknown));

            ebool acceptUnknown = FHE.ne(
                FHE.and(prefMask, FHE.asEuint16(UNKNOWN_BIT)),
                FHE.asEuint16(0)
            );

            ebool minIsZero = FHE.eq(prefMin, FHE.asEuint8(0));
            ebool maxIsMax = FHE.ge(prefMax, FHE.asEuint8(254));
            ebool isWildcard = FHE.and(minIsZero, maxIsMax);

            ebool knownPasses = FHE.or(isWildcard, inRange);
            return FHE.select(isUnknown, acceptUnknown, knownPasses);
        } else {
            // Use attribute-specific sanitizer for RELATIONSHIP_STRUCTURE
            euint8 safeVal = (attr == RELATIONSHIP_STRUCTURE)
                ? _sanitizeRelationshipStructure(targetVal)
                : _sanitizeCategorical(targetVal);
            euint16 valueBit = FHE.shl(FHE.asEuint16(1), safeVal);
            return FHE.ne(FHE.and(prefMask, valueBit), FHE.asEuint16(0));
        }
    }

    function _isNumericAttr(uint8 attr) internal pure returns (bool) {
        return attr == EXACT_AGE || attr == KINK_LEVEL;
    }

    function _sanitizeCategorical(euint8 val) internal returns (euint8) {
        ebool outOfRange = FHE.gt(val, FHE.asEuint8(15));
        return FHE.select(outOfRange, FHE.asEuint8(UNKNOWN_CATEGORICAL), val);
    }

    /// @notice Sanitize RELATIONSHIP_STRUCTURE to valid domain (1-4, 15)
    /// @dev Old values 5-14 (including old swinging values 6-8) map to UNKNOWN
    function _sanitizeRelationshipStructure(euint8 val) internal returns (euint8) {
        // Valid: 1, 2, 3, 4 (structure values), 15 (UNKNOWN)
        // Invalid: 0 (no value 0 for categoricals), 5-14 (deprecated/invalid)
        ebool tooLow = FHE.lt(val, FHE.asEuint8(1));   // catches 0
        ebool tooHigh = FHE.gt(val, FHE.asEuint8(4));  // catches 5-14
        ebool isUnknown = FHE.eq(val, FHE.asEuint8(UNKNOWN_CATEGORICAL));  // 15 is valid
        ebool invalid = FHE.and(FHE.or(tooLow, tooHigh), FHE.not(isUnknown));
        return FHE.select(invalid, FHE.asEuint8(UNKNOWN_CATEGORICAL), val);
    }

    function _sanitizeAge(euint8 val) internal returns (euint8) {
        ebool tooYoung = FHE.lt(val, FHE.asEuint8(18));
        ebool tooOld = FHE.gt(val, FHE.asEuint8(254));
        ebool invalid = FHE.or(tooYoung, tooOld);
        return FHE.select(invalid, FHE.asEuint8(UNKNOWN_NUMERIC), val);
    }

    function _sanitizeKink(euint8 val) internal returns (euint8) {
        ebool tooLow = FHE.lt(val, FHE.asEuint8(1));
        ebool tooHigh = FHE.gt(val, FHE.asEuint8(7));
        ebool invalid = FHE.or(tooLow, tooHigh);
        return FHE.select(invalid, FHE.asEuint8(UNKNOWN_NUMERIC), val);
    }

    function _sanitizeNumeric(uint8 attr, euint8 val) internal returns (euint8) {
        if (attr == EXACT_AGE) {
            return _sanitizeAge(val);
        } else if (attr == KINK_LEVEL) {
            return _sanitizeKink(val);
        }
        return val;
    }

    function _checkMutualMatch(address a, address b) internal {
        if (!hasLiked[a][b] || !hasLiked[b][a]) return;

        (address user1, address user2) = a < b ? (a, b) : (b, a);
        bytes32 pairKey = keccak256(abi.encodePacked(user1, user2));

        if (isMatch[user1][user2]) return;
        if (pendingMatches[pairKey].user1 != address(0)) return;

        ebool like1 = encryptedLikes[a][b];
        ebool like2 = encryptedLikes[b][a];
        ebool mutualLike = FHE.and(like1, like2);

        FHE.allowThis(mutualLike);
        FHE.allow(mutualLike, relayer);

        pendingMatches[pairKey] = PendingMatch(user1, user2, mutualLike);

        emit MatchPending(pairKey, user1, user2, FHE.toBytes32(mutualLike));
    }

    function finalizeMatch(
        address user1,
        address user2,
        bool isMutualMatch,
        bytes calldata decryptionProof
    ) external onlyRelayer {
        require(user1 < user2, "Wrong order");
        bytes32 pairKey = keccak256(abi.encodePacked(user1, user2));

        PendingMatch memory pending = pendingMatches[pairKey];
        require(pending.user1 != address(0), "No pending match");

        bytes32[] memory handles = new bytes32[](1);
        handles[0] = FHE.toBytes32(pending.mutualLikeHandle);
        FHE.checkSignatures(handles, abi.encode(isMutualMatch), decryptionProof);

        if (isMutualMatch) {
            isMatch[user1][user2] = true;
            isMatch[user2][user1] = true;

            _computeSharedValues(user1, user2);
            _handleAutoPhotoGrants(user1, user2);

            emit MatchCreated(user1, user2);
        }

        delete pendingMatches[pairKey];
    }

    // ============ SHARED VALUES (replaces old overlap logic) ============

    /// @notice Compute directional shared values for a matched pair
    /// @dev Called once on match finalization. Stores bucketed/grouped values for numerics.
    ///      Assumes user1 < user2 (enforced by finalizeMatch).
    function _computeSharedValues(address user1, address user2) internal {
        bytes32 pairKey = keccak256(abi.encodePacked(user1, user2));

        for (uint8 attr = 0; attr < NUM_ATTRS; attr++) {
            euint8 raw1 = encryptedValues[user1][attr];
            euint8 raw2 = encryptedValues[user2][attr];

            ebool share1 = encryptedShareOnMatch[user1][attr];
            ebool share2 = encryptedShareOnMatch[user2][attr];

            euint8 shared1;
            euint8 shared2;

            if (_isNumericAttr(attr)) {
                euint8 safe1 = _sanitizeNumeric(attr, raw1);
                euint8 safe2 = _sanitizeNumeric(attr, raw2);

                // Gate sharing on "known" so UNKNOWN doesn't bucket into a real value
                ebool known1 = FHE.ne(safe1, FHE.asEuint8(UNKNOWN_NUMERIC));
                ebool known2 = FHE.ne(safe2, FHE.asEuint8(UNKNOWN_NUMERIC));
                ebool canShare1 = FHE.and(share1, known1);
                ebool canShare2 = FHE.and(share2, known2);

                // Bucket/group for reveal
                euint8 out1 = _sharedNumericForReveal(attr, safe1);
                euint8 out2 = _sharedNumericForReveal(attr, safe2);

                shared1 = FHE.select(canShare1, out1, FHE.asEuint8(UNKNOWN_NUMERIC));
                shared2 = FHE.select(canShare2, out2, FHE.asEuint8(UNKNOWN_NUMERIC));
            } else {
                // Use attribute-specific sanitizer for RELATIONSHIP_STRUCTURE
                euint8 safe1 = (attr == RELATIONSHIP_STRUCTURE)
                    ? _sanitizeRelationshipStructure(raw1)
                    : _sanitizeCategorical(raw1);
                euint8 safe2 = (attr == RELATIONSHIP_STRUCTURE)
                    ? _sanitizeRelationshipStructure(raw2)
                    : _sanitizeCategorical(raw2);

                // For categorical, UNKNOWN (15) is safe to "share" (client will drop it)
                shared1 = FHE.select(share1, safe1, FHE.asEuint8(UNKNOWN_CATEGORICAL));
                shared2 = FHE.select(share2, safe2, FHE.asEuint8(UNKNOWN_CATEGORICAL));
            }

            // allowThis first, then store, then allow receiver
            FHE.allowThis(shared1);
            FHE.allowThis(shared2);

            // user1 < user2 guaranteed, so sharedValuesUser1 = user1's value, sharedValuesUser2 = user2's value
            sharedValuesUser1[pairKey][attr] = shared1;
            sharedValuesUser2[pairKey][attr] = shared2;

            // Grant decrypt rights to opposite party only
            FHE.allow(shared1, user2);
            FHE.allow(shared2, user1);
        }

        emit SharedValuesComputed(user1, user2);
    }

    /// @notice Transform numeric value to coarser bucket/group for sharing
    /// @dev Age: 5-year bucket start (18, 23, 28, ..., 98). Kink: group (0, 1, 2).
    function _sharedNumericForReveal(uint8 attr, euint8 safeVal) internal returns (euint8) {
        if (attr == EXACT_AGE) {
            // Clamp to 98 so last bucket is 98-102 (avoids weird 253+ buckets)
            euint8 minAge = FHE.asEuint8(18);
            euint8 maxAge = FHE.asEuint8(98);
            euint8 clampedAge = FHE.min(safeVal, maxAge);

            // bucketStart = 18 + 5 * ((clampedAge - 18) / 5)
            euint8 bucket = FHE.div(FHE.sub(clampedAge, minAge), 5); // plaintext divisor

            // 5*bucket using adds (avoids uncertainty about mul-with-plaintext)
            euint8 b2 = FHE.add(bucket, bucket);
            euint8 b4 = FHE.add(b2, b2);
            euint8 b5 = FHE.add(b4, bucket);

            return FHE.add(minAge, b5); // 18, 23, 28, ..., 98
        }

        if (attr == KINK_LEVEL) {
            // 1-2 -> 0 (vanilla), 3-4 -> 1 (open-minded), 5-7 -> 2 (enthusiast)
            ebool gt2 = FHE.gt(safeVal, FHE.asEuint8(2));
            ebool gt4 = FHE.gt(safeVal, FHE.asEuint8(4));
            return FHE.select(
                gt4, FHE.asEuint8(2),
                FHE.select(gt2, FHE.asEuint8(1), FHE.asEuint8(0))
            );
        }

        return safeVal;
    }

    /// @notice Get handle for "what sharer shared to receiver" for client decryption
    /// @dev Only receiver can call (they're the only one with decrypt rights)
    /// @param sharer The user who shared the value
    /// @param attr Attribute ID
    function getSharedValueHandle(
        address sharer,
        uint8 attr
    ) external view returns (bytes32) {
        require(attr < NUM_ATTRS, "Bad attr");
        address receiver = msg.sender;
        require(isMatch[sharer][receiver], "Not matched");

        (address user1, address user2) = sharer < receiver ? (sharer, receiver) : (receiver, sharer);
        bytes32 pairKey = keccak256(abi.encodePacked(user1, user2));

        if (sharer == user1) {
            return FHE.toBytes32(sharedValuesUser1[pairKey][attr]);
        }
        return FHE.toBytes32(sharedValuesUser2[pairKey][attr]);
    }

    /// @notice Batch get all shared value handles from sharer to caller
    /// @dev Returns 12 handles; client decrypts and drops UNKNOWNs
    /// @param sharer The user who shared the values
    function getSharedValueHandles(
        address sharer
    ) external view returns (bytes32[NUM_ATTRS] memory handles) {
        address receiver = msg.sender;
        require(isMatch[sharer][receiver], "Not matched");

        (address user1, address user2) = sharer < receiver ? (sharer, receiver) : (receiver, sharer);
        bytes32 pairKey = keccak256(abi.encodePacked(user1, user2));

        for (uint8 attr = 0; attr < NUM_ATTRS; attr++) {
            if (sharer == user1) {
                handles[attr] = FHE.toBytes32(sharedValuesUser1[pairKey][attr]);
            } else {
                handles[attr] = FHE.toBytes32(sharedValuesUser2[pairKey][attr]);
            }
        }
    }

    // ============ PHOTO GRANTS ============

    function setAutoPhotoGrant(bool enabled) external {
        autoPhotoGrant[msg.sender] = enabled;
    }

    function grantPhoto(address viewer) external {
        require(isMatch[msg.sender][viewer], "Not matched");
        bytes32 key = keccak256(abi.encodePacked(msg.sender, viewer));
        photoGrants[key] = true;
        emit PhotoGranted(msg.sender, viewer);
    }

    function revokePhoto(address viewer) external {
        bytes32 key = keccak256(abi.encodePacked(msg.sender, viewer));
        photoGrants[key] = false;
        emit PhotoRevoked(msg.sender, viewer);
    }

    function canViewPhoto(address subject, address viewer) external view returns (bool) {
        bytes32 key = keccak256(abi.encodePacked(subject, viewer));
        return photoGrants[key];
    }

    function _handleAutoPhotoGrants(address user1, address user2) internal {
        if (autoPhotoGrant[user1] && autoPhotoGrant[user2]) {
            bytes32 key1 = keccak256(abi.encodePacked(user1, user2));
            bytes32 key2 = keccak256(abi.encodePacked(user2, user1));
            photoGrants[key1] = true;
            photoGrants[key2] = true;
            emit PhotoGranted(user1, user2);
            emit PhotoGranted(user2, user1);
        }
    }

    // ============ VIEW FUNCTIONS ============

    function getPendingMatchHandle(address a, address b) external view returns (bytes32) {
        (address user1, address user2) = a < b ? (a, b) : (b, a);
        bytes32 pairKey = keccak256(abi.encodePacked(user1, user2));
        PendingMatch memory pending = pendingMatches[pairKey];
        require(pending.user1 != address(0), "No pending match");
        return FHE.toBytes32(pending.mutualLikeHandle);
    }

    function areMatched(address a, address b) external view returns (bool) {
        return isMatch[a][b];
    }

    function hasUserLiked(address from, address to) external view returns (bool) {
        return hasLiked[from][to];
    }

    // ============ ADMIN ============

    function setOracle(address _oracle) external onlyAdmin {
        oracle = _oracle;
    }

    function setRelayer(address _relayer) external onlyAdmin {
        relayer = _relayer;
    }

    function setDirectory(address _directory) external onlyAdmin {
        directory = _directory;
    }

    function setDirectLikeQuota(uint8 _quota) external onlyAdmin {
        directLikeQuota = _quota;
    }

    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin");
        admin = _newAdmin;
    }
}
