// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {
    FHE,
    euint8,
    euint16,
    ebool,
    externalEuint8,
    externalEuint16,
    externalEbool
} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @title DatingV3 - Match-time encrypted enforcement (granular gender preferences; no sex)
/// @notice Candidate-set Merkle roots scale discovery; on-chain enforcement at match-time uses FHE.
contract DatingV3 is ZamaEthereumConfig {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // -------------------- Gender encodings --------------------
    // Gender identity enums (self-reported)
    uint8 public constant G_MAN = 1;
    uint8 public constant G_WOMAN = 2;
    uint8 public constant G_TRANS_MAN = 3;
    uint8 public constant G_TRANS_WOMAN = 4;
    uint8 public constant G_NON_BINARY = 5;

    // Unknown sentinel
    uint8 public constant UNKNOWN_U8 = 255;

    // -------------------- Desired mask bits (5 distinct categories) --------------------
    // Bit layout: [4:nb][3:trans_women][2:cis_women][1:trans_men][0:cis_men]
    uint16 public constant MASK_CIS_MEN     = 0x0001; // bit 0
    uint16 public constant MASK_TRANS_MEN   = 0x0002; // bit 1
    uint16 public constant MASK_CIS_WOMEN   = 0x0004; // bit 2
    uint16 public constant MASK_TRANS_WOMEN = 0x0008; // bit 3
    uint16 public constant MASK_NON_BINARY  = 0x0010; // bit 4

    uint16 public constant MASK_ALL_MEN   = 0x0003; // cis + trans men
    uint16 public constant MASK_ALL_WOMEN = 0x000C; // cis + trans women
    uint16 public constant MASK_ALL_CIS   = 0x0005; // cis men + cis women
    uint16 public constant MASK_EVERYONE  = 0x001F; // all 5 categories

    // -------------------- EIP-712 LikeAuthorization --------------------
    bytes32 public constant EIP712_DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );

    bytes32 public constant LIKE_AUTH_TYPEHASH = keccak256(
        "LikeAuthorization(bytes32 candidateSetRoot,uint8 maxLikes,uint64 expiry,uint64 nonce)"
    );

    bytes32 public immutable DOMAIN_SEPARATOR;

    // -------------------- Roles --------------------
    address public admin;
    address public directory;
    address public oracle;
    address public relayer;

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

    // -------------------- Encrypted per-user state --------------------
    mapping(address => euint8) private encAge;          // claimed; overwritten by verified exact age
    mapping(address => euint8) private encGenderId;     // 1..5 or 255 unknown
    mapping(address => euint16) private encDesiredMask; // 5-bit gender mask

    mapping(address => ebool) private shareAgeOnMatch;     // reveal age bucket-start on match
    mapping(address => ebool) private shareGenderOnMatch;  // reveal genderId on match

    mapping(address => bool) public profileInitialized;

    // Verified extras (age-only)
    mapping(address => bool) public isVerified;
    mapping(bytes32 => bool) public nullifierUsed;

    // -------------------- Likes / matches --------------------
    // NOTE: hasLiked = attempted like (may be ineligible); eligibility enforced at match finalization
    mapping(address => mapping(address => bool)) public hasLiked;
    mapping(address => mapping(address => bool)) public isMatch;

    struct PendingMatch {
        address user1;
        address user2;
        ebool mutualOkHandle;
    }

    mapping(bytes32 => PendingMatch) private pendingMatches;

    // -------------------- Shared-on-match (age + gender only) --------------------
    // pairKey = keccak256(abi.encodePacked(user1, user2)) where user1 < user2
    mapping(bytes32 => euint8) private sharedAgeUser1;
    mapping(bytes32 => euint8) private sharedAgeUser2;
    mapping(bytes32 => euint8) private sharedGenderUser1;
    mapping(bytes32 => euint8) private sharedGenderUser2;

    // -------------------- Like authorization --------------------
    struct LikeAuth {
        bytes32 candidateSetRoot;
        uint8 maxLikes;
        uint64 expiry;
        bool active;
    }

    mapping(address => mapping(uint64 => LikeAuth)) public likeAuths;
    mapping(address => mapping(uint64 => uint8)) public likesUsed;
    mapping(address => mapping(uint64 => bool)) public nonceUsed;

    // -------------------- Events --------------------
    event ProfileSet(address indexed user);
    event VerifiedAttributesSet(address indexed user, bytes32 nullifier);

    event LikesAuthorized(address indexed user, uint64 nonce, uint8 maxLikes, uint64 expiry);

    event LikeSent(address indexed from, address indexed to);
    event MatchPending(bytes32 indexed pairKey, address user1, address user2, bytes32 handle);
    event MatchCreated(address indexed user1, address indexed user2);
    event SharedValuesComputed(address indexed user1, address indexed user2);

    // -------------------- Constructor --------------------
    constructor(address _admin, address _directory, address _oracle, address _relayer) {
        admin = _admin;
        directory = _directory;
        oracle = _oracle;
        relayer = _relayer;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256("Heaven"),
                keccak256("3"),
                block.chainid,
                address(this)
            )
        );
    }

    // -------------------- Profile setup --------------------

    /// @notice Set minimal encrypted profile + preference state
    /// @dev If user is already verified, age is oracle-owned; claimedAge is ignored.
    function setBasics(
        externalEuint8 claimedAge,
        externalEuint8 genderId,
        externalEuint16 desiredMask,
        externalEbool shareAge,
        externalEbool shareGender,
        bytes calldata proof
    ) external {
        address user = msg.sender;

        if (!isVerified[user]) {
            encAge[user] = FHE.fromExternal(claimedAge, proof);
            FHE.allowThis(encAge[user]);
        }

        encGenderId[user] = FHE.fromExternal(genderId, proof);
        encDesiredMask[user] = FHE.fromExternal(desiredMask, proof);

        shareAgeOnMatch[user] = FHE.fromExternal(shareAge, proof);
        shareGenderOnMatch[user] = FHE.fromExternal(shareGender, proof);

        FHE.allowThis(encGenderId[user]);
        FHE.allowThis(encDesiredMask[user]);
        FHE.allowThis(shareAgeOnMatch[user]);
        FHE.allowThis(shareGenderOnMatch[user]);

        profileInitialized[user] = true;
        emit ProfileSet(user);
    }

    // -------------------- Verified attributes (self.xyz) --------------------
    // Age-only verification

    function setVerifiedAttributes(
        address user,
        externalEuint8 exactAge,
        bytes32 nullifier,
        bytes calldata proof,
        bytes calldata userSig
    ) external onlyOracle {
        // Bind user to nullifier + contract
        bytes32 bindingHash = keccak256(abi.encodePacked(user, nullifier, address(this)));
        bytes32 ethSignedHash = bindingHash.toEthSignedMessageHash();
        require(ethSignedHash.recover(userSig) == user, "Invalid user signature");

        require(!nullifierUsed[nullifier], "Nullifier already used");
        nullifierUsed[nullifier] = true;

        encAge[user] = FHE.fromExternal(exactAge, proof);
        FHE.allowThis(encAge[user]);

        isVerified[user] = true;
        emit VerifiedAttributesSet(user, nullifier);
    }

    // -------------------- Like authorization (EIP-712) --------------------

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

        bytes32 structHash = keccak256(abi.encode(LIKE_AUTH_TYPEHASH, candidateSetRoot, maxLikes, expiry, nonce));
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

    // -------------------- Like flow (1-step) --------------------

    function submitLike(
        address liker,
        address target,
        uint64 nonce,
        bytes32[] calldata merkleProof
    ) external onlyRelayer {
        require(profileInitialized[liker], "Liker not initialized");
        require(profileInitialized[target], "Target not initialized");
        require(liker != target, "Cannot like self");
        require(!hasLiked[liker][target], "Already liked");

        LikeAuth storage auth = likeAuths[liker][nonce];
        require(auth.active, "Authorization not active");
        require(block.timestamp < auth.expiry, "Authorization expired");
        require(likesUsed[liker][nonce] < auth.maxLikes, "Quota exceeded");

        bytes32 leaf = keccak256(abi.encodePacked(target));
        require(MerkleProof.verify(merkleProof, auth.candidateSetRoot, leaf), "Target not in candidate set");

        likesUsed[liker][nonce]++;
        if (likesUsed[liker][nonce] >= auth.maxLikes) {
            auth.active = false;
        }

        hasLiked[liker][target] = true;
        emit LikeSent(liker, target);

        if (hasLiked[target][liker]) {
            _createPendingMatch(liker, target);
        }
    }

    function _createPendingMatch(address a, address b) internal {
        (address user1, address user2) = a < b ? (a, b) : (b, a);
        bytes32 pairKey = keccak256(abi.encodePacked(user1, user2));

        if (isMatch[user1][user2]) return;
        if (pendingMatches[pairKey].user1 != address(0)) return;

        // Match-time enforcement, symmetric (only runs on mutual)
        ebool ok_ab = _passesDesiredGender(a, b);
        ebool ok_ba = _passesDesiredGender(b, a);
        ebool mutualOk = FHE.and(ok_ab, ok_ba);

        FHE.allowThis(mutualOk);
        FHE.allow(mutualOk, relayer);

        pendingMatches[pairKey] = PendingMatch({user1: user1, user2: user2, mutualOkHandle: mutualOk});
        emit MatchPending(pairKey, user1, user2, FHE.toBytes32(mutualOk));
    }

    function finalizeMatch(
        address user1,
        address user2,
        bool isMutualOk,
        bytes calldata decryptionProof
    ) external onlyRelayer {
        require(user1 < user2, "Wrong order");
        bytes32 pairKey = keccak256(abi.encodePacked(user1, user2));

        PendingMatch memory pending = pendingMatches[pairKey];
        require(pending.user1 != address(0), "No pending match");

        bytes32;
        handles[0] = FHE.toBytes32(pending.mutualOkHandle);
        FHE.checkSignatures(handles, abi.encode(isMutualOk), decryptionProof);

        delete pendingMatches[pairKey];

        if (!isMutualOk) return;

        isMatch[user1][user2] = true;
        isMatch[user2][user1] = true;

        _computeSharedBasics(user1, user2);
        emit MatchCreated(user1, user2);
    }

    // -------------------- Compatibility (gender eligibility) --------------------

    /// @dev bucket: 0=cis_men, 1=trans_men, 2=cis_women, 3=trans_women, 4=nb, 255=unknown
    function _genderBucket(euint8 genderId) internal returns (euint8) {
        ebool isCisMan = FHE.eq(genderId, FHE.asEuint8(G_MAN));
        ebool isTransMan = FHE.eq(genderId, FHE.asEuint8(G_TRANS_MAN));
        ebool isCisWoman = FHE.eq(genderId, FHE.asEuint8(G_WOMAN));
        ebool isTransWoman = FHE.eq(genderId, FHE.asEuint8(G_TRANS_WOMAN));
        ebool isNb = FHE.eq(genderId, FHE.asEuint8(G_NON_BINARY));

        euint8 out = FHE.asEuint8(UNKNOWN_U8);
        out = FHE.select(isNb, FHE.asEuint8(4), out);
        out = FHE.select(isTransWoman, FHE.asEuint8(3), out);
        out = FHE.select(isCisWoman, FHE.asEuint8(2), out);
        out = FHE.select(isTransMan, FHE.asEuint8(1), out);
        out = FHE.select(isCisMan, FHE.asEuint8(0), out);
        return out;
    }

    function _passesDesiredGender(address liker, address target) internal returns (ebool) {
        euint8 targetGender = encGenderId[target];
        euint16 mask = encDesiredMask[liker];

        euint8 bucket = _genderBucket(targetGender);
        ebool known = FHE.ne(bucket, FHE.asEuint8(UNKNOWN_U8));

        // avoid shifting by 255
        euint8 safeBucket = FHE.select(known, bucket, FHE.asEuint8(0));
        euint16 bit = FHE.shl(FHE.asEuint16(1), safeBucket);

        ebool inMask = FHE.ne(FHE.and(mask, bit), FHE.asEuint16(0));
        return FHE.and(known, inMask);
    }

    // -------------------- Shared-on-match (age + gender only) --------------------

    function _sanitizeAge(euint8 val) internal returns (euint8) {
        ebool tooYoung = FHE.lt(val, FHE.asEuint8(18));
        ebool tooOld = FHE.gt(val, FHE.asEuint8(254));
        ebool invalid = FHE.or(tooYoung, tooOld);
        return FHE.select(invalid, FHE.asEuint8(UNKNOWN_U8), val);
    }

    /// @dev Age reveal as 5-year bucket start: 18, 23, 28, ...
    function _ageBucketStart(euint8 safeAge) internal returns (euint8) {
        euint8 minAge = FHE.asEuint8(18);
        euint8 maxAge = FHE.asEuint8(98);
        euint8 clamped = FHE.min(safeAge, maxAge);

        euint8 bucket = FHE.div(FHE.sub(clamped, minAge), 5);
        euint8 b2 = FHE.add(bucket, bucket);
        euint8 b4 = FHE.add(b2, b2);
        euint8 b5 = FHE.add(b4, bucket);

        return FHE.add(minAge, b5);
    }

    function _computeSharedBasics(address user1, address user2) internal {
        bytes32 pairKey = keccak256(abi.encodePacked(user1, user2));

        // Age: share 5-year bucket start if enabled + known
        euint8 a1 = _sanitizeAge(encAge[user1]);
        euint8 a2 = _sanitizeAge(encAge[user2]);

        ebool k1 = FHE.ne(a1, FHE.asEuint8(UNKNOWN_U8));
        ebool k2 = FHE.ne(a2, FHE.asEuint8(UNKNOWN_U8));

        ebool canShareA1 = FHE.and(shareAgeOnMatch[user1], k1);
        ebool canShareA2 = FHE.and(shareAgeOnMatch[user2], k2);

        euint8 outA1 = _ageBucketStart(a1);
        euint8 outA2 = _ageBucketStart(a2);

        euint8 sharedA1 = FHE.select(canShareA1, outA1, FHE.asEuint8(UNKNOWN_U8));
        euint8 sharedA2 = FHE.select(canShareA2, outA2, FHE.asEuint8(UNKNOWN_U8));

        // Gender: share genderId if enabled
        euint8 g1 = encGenderId[user1];
        euint8 g2 = encGenderId[user2];

        euint8 sharedG1 = FHE.select(shareGenderOnMatch[user1], g1, FHE.asEuint8(UNKNOWN_U8));
        euint8 sharedG2 = FHE.select(shareGenderOnMatch[user2], g2, FHE.asEuint8(UNKNOWN_U8));

        FHE.allowThis(sharedA1);
        FHE.allowThis(sharedA2);
        FHE.allowThis(sharedG1);
        FHE.allowThis(sharedG2);

        sharedAgeUser1[pairKey] = sharedA1;
        sharedAgeUser2[pairKey] = sharedA2;
        sharedGenderUser1[pairKey] = sharedG1;
        sharedGenderUser2[pairKey] = sharedG2;

        // grant decrypt rights to opposite party only
        FHE.allow(sharedA1, user2);
        FHE.allow(sharedA2, user1);
        FHE.allow(sharedG1, user2);
        FHE.allow(sharedG2, user1);

        emit SharedValuesComputed(user1, user2);
    }

    /// @notice Get handles for sharer -> caller (age + gender)
    function getSharedBasicsHandles(address sharer)
        external
        view
        returns (bytes32 ageHandle, bytes32 genderHandle)
    {
        address receiver = msg.sender;
        require(isMatch[sharer][receiver], "Not matched");

        (address user1, address user2) = sharer < receiver ? (sharer, receiver) : (receiver, sharer);
        bytes32 pairKey = keccak256(abi.encodePacked(user1, user2));

        if (sharer == user1) {
            return (FHE.toBytes32(sharedAgeUser1[pairKey]), FHE.toBytes32(sharedGenderUser1[pairKey]));
        }
        return (FHE.toBytes32(sharedAgeUser2[pairKey]), FHE.toBytes32(sharedGenderUser2[pairKey]));
    }

    function getPendingMatchHandle(address a, address b) external view returns (bytes32) {
        (address user1, address user2) = a < b ? (a, b) : (b, a);
        bytes32 pairKey = keccak256(abi.encodePacked(user1, user2));
        PendingMatch memory pending = pendingMatches[pairKey];
        require(pending.user1 != address(0), "No pending match");
        return FHE.toBytes32(pending.mutualOkHandle);
    }

    // -------------------- Admin --------------------

    function setOracle(address _oracle) external onlyAdmin {
        oracle = _oracle;
    }

    function setRelayer(address _relayer) external onlyAdmin {
        relayer = _relayer;
    }

    function setDirectory(address _directory) external onlyAdmin {
        directory = _directory;
    }

    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin");
        admin = _newAdmin;
    }
}
