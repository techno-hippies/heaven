// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/// @title ScrobbleLogV2
/// @notice Event-only scrobble batching contract. Stores nothing on-chain except events.
/// @dev Relay submits batches on behalf of users. CID points to NDJSON on IPFS.
///      User must sign the batch params; relay cannot forge batches.
///      Replay protection (nonce monotonicity) must be enforced offchain by the relay/indexer.
///
///      CID encoding: The `cid` field is the UTF-8 encoded string of the IPFS CID (e.g., "Qm...").
///      This is NOT raw multiformat bytes, just the human-readable CID string as bytes.
contract ScrobbleLogV2 is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    /// @notice Emitted when a batch of scrobbles is committed
    /// @param user The user's PKP address
    /// @param cid IPFS CID as UTF-8 encoded string bytes (e.g., "Qm..." or "bafy...")
    /// @param cidHash keccak256(cid) for efficient lookups
    /// @param startTs Timestamp of first scrobble in batch (unix seconds)
    /// @param endTs Timestamp of last scrobble in batch (unix seconds)
    /// @param count Number of scrobbles in batch
    /// @param nonce Replay protection nonce (should be monotonically increasing per user)
    event BatchCommitted(
        address indexed user,
        bytes cid,
        bytes32 cidHash,
        uint40 startTs,
        uint40 endTs,
        uint32 count,
        uint64 nonce
    );

    /// @notice Emitted when a batch is rejected in multi-batch submission
    /// @param user The user whose batch was rejected
    /// @param reason Rejection reason code (1=invalid params, 2=bad signature)
    /// @param cidHash keccak256(cid) for debugging
    /// @param nonce Offchain nonce for debugging
    event BatchRejected(address indexed user, uint8 reason, bytes32 cidHash, uint64 nonce);

    /// @notice Emitted when a relay is added or removed
    event RelayUpdated(address indexed relay, bool authorized);

    /// @notice Authorized relays that can submit batches
    mapping(address => bool) public relays;

    error UnauthorizedRelay();
    error InvalidBatch();
    error InvalidSignature();

    constructor() Ownable(msg.sender) {}

    /// @notice Add or remove an authorized relay
    function setRelay(address relay, bool authorized) external onlyOwner {
        relays[relay] = authorized;
        emit RelayUpdated(relay, authorized);
    }

    /// @notice Computes the digest the user must sign with `personal_sign` / eth_sign style.
    /// @dev This returns the EIP-191 digest (i.e., "\x19Ethereum Signed Message:\n32" prefix applied).
    function getDigest(
        address user,
        bytes32 cidHash,
        uint40 startTs,
        uint40 endTs,
        uint32 count,
        uint64 nonce
    ) public view returns (bytes32) {
        bytes32 inner = keccak256(
            abi.encode(
                block.chainid,
                address(this),
                user,
                cidHash,
                startTs,
                endTs,
                count,
                nonce
            )
        );
        return inner.toEthSignedMessageHash();
    }

    /// @notice Commit a batch of scrobbles (called by authorized relay)
    function commitBatch(
        address user,
        bytes calldata cid,
        uint40 startTs,
        uint40 endTs,
        uint32 count,
        uint64 nonce,
        bytes calldata userSig
    ) external {
        if (!relays[msg.sender]) revert UnauthorizedRelay();
        if (cid.length == 0 || count == 0 || startTs > endTs) revert InvalidBatch();

        bytes32 cidHash = keccak256(cid);
        bytes32 digest = getDigest(user, cidHash, startTs, endTs, count, nonce);
        address signer = ECDSA.recover(digest, userSig);
        if (signer != user) revert InvalidSignature();

        emit BatchCommitted(user, cid, cidHash, startTs, endTs, count, nonce);
    }

    /// @notice Commit multiple batches in one tx (gas optimization for relay)
    /// @dev Skips invalid batches instead of reverting; emits BatchRejected for failures.
    function commitBatches(
        address[] calldata users,
        bytes[] calldata cids,
        uint40[] calldata startTss,
        uint40[] calldata endTss,
        uint32[] calldata counts,
        uint64[] calldata nonces,
        bytes[] calldata userSigs
    ) external {
        if (!relays[msg.sender]) revert UnauthorizedRelay();

        uint256 len = users.length;
        if (
            len != cids.length ||
            len != startTss.length ||
            len != endTss.length ||
            len != counts.length ||
            len != nonces.length ||
            len != userSigs.length
        ) revert InvalidBatch();

        for (uint256 i = 0; i < len; ) {
            address user = users[i];
            bytes calldata cid = cids[i];
            uint40 startTs = startTss[i];
            uint40 endTs = endTss[i];
            uint32 count = counts[i];
            uint64 nonce = nonces[i];
            bytes calldata sig = userSigs[i];

            bytes32 cidHash = keccak256(cid);

            // Validate params
            if (cid.length == 0 || count == 0 || startTs > endTs) {
                emit BatchRejected(user, 1, cidHash, nonce);
                unchecked { ++i; }
                continue;
            }

            // Verify signature
            bytes32 digest = getDigest(user, cidHash, startTs, endTs, count, nonce);
            address signer = ECDSA.recover(digest, sig);
            if (signer != user) {
                emit BatchRejected(user, 2, cidHash, nonce);
                unchecked { ++i; }
                continue;
            }

            emit BatchCommitted(user, cid, cidHash, startTs, endTs, count, nonce);
            unchecked { ++i; }
        }
    }
}