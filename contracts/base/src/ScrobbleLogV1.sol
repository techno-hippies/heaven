// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

/// @title ScrobbleLogV1 - On-chain music listening history
/// @notice Append-only log of track plays, supporting gasless submissions via EIP-712
/// @dev Similar pattern to SurveyRegistry - users own their data, relayers can submit on behalf
contract ScrobbleLogV1 is EIP712, Nonces {
    using ECDSA for bytes32;

    // ============ TYPES ============

    struct Scrobble {
        bytes32 trackHash;      // keccak256(artistName, trackName) or Spotify/MusicBrainz ID hash
        uint64 timestamp;       // When the track was played (user-provided, not block.timestamp)
        uint32 durationSecs;    // How long they listened
        uint8 source;           // 0=unknown, 1=spotify, 2=apple, 3=youtube, 4=local, 5=other
    }

    // ============ STORAGE ============

    // user => array of scrobbles
    mapping(address => Scrobble[]) public scrobbles;

    // user => total scrobble count (for pagination)
    mapping(address => uint256) public scrobbleCount;

    // ============ EVENTS ============

    event Scrobbled(
        address indexed user,
        bytes32 indexed trackHash,
        uint64 timestamp,
        uint32 durationSecs,
        uint8 source
    );

    event BatchScrobbled(
        address indexed user,
        address indexed relayer,
        uint256 count
    );

    // ============ EIP-712 ============

    bytes32 private constant SCROBBLE_TYPEHASH =
        keccak256(
            "Scrobble(address user,bytes32 trackHash,uint64 timestamp,uint32 durationSecs,uint8 source,uint256 nonce,uint256 deadline)"
        );

    bytes32 private constant BATCH_SCROBBLE_TYPEHASH =
        keccak256(
            "BatchScrobble(address user,bytes32 scrobblesHash,uint256 count,uint256 nonce,uint256 deadline)"
        );

    // ============ CONSTRUCTOR ============

    constructor() EIP712("ScrobbleLog", "1") {}

    // ============ WRITE FUNCTIONS ============

    /// @notice Log a single scrobble directly
    /// @param trackHash keccak256 of track identifier
    /// @param timestamp Unix timestamp when track was played
    /// @param durationSecs Seconds listened
    /// @param source Music source (0-5)
    function scrobble(
        bytes32 trackHash,
        uint64 timestamp,
        uint32 durationSecs,
        uint8 source
    ) external {
        _scrobble(msg.sender, trackHash, timestamp, durationSecs, source);
    }

    /// @notice Log multiple scrobbles at once (direct call)
    /// @param trackHashes Array of track hashes
    /// @param timestamps Array of timestamps
    /// @param durations Array of durations
    /// @param sources Array of sources
    function batchScrobble(
        bytes32[] calldata trackHashes,
        uint64[] calldata timestamps,
        uint32[] calldata durations,
        uint8[] calldata sources
    ) external {
        _batchScrobble(msg.sender, trackHashes, timestamps, durations, sources, msg.sender);
    }

    /// @notice Log a scrobble on behalf of a user using EIP-712 signature
    /// @param user The user who listened
    /// @param trackHash Track identifier hash
    /// @param timestamp When played
    /// @param durationSecs Duration
    /// @param source Music source
    /// @param deadline Signature expiry
    /// @param sig EIP-712 signature
    function scrobbleFor(
        address user,
        bytes32 trackHash,
        uint64 timestamp,
        uint32 durationSecs,
        uint8 source,
        uint256 deadline,
        bytes calldata sig
    ) external {
        require(block.timestamp <= deadline, "Signature expired");

        uint256 nonce = _useNonce(user);
        bytes32 structHash = keccak256(
            abi.encode(
                SCROBBLE_TYPEHASH,
                user,
                trackHash,
                timestamp,
                durationSecs,
                source,
                nonce,
                deadline
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, sig);
        require(signer == user, "Invalid signature");

        _scrobble(user, trackHash, timestamp, durationSecs, source);
    }

    /// @notice Log multiple scrobbles on behalf of a user using EIP-712 signature
    /// @param user The user who listened
    /// @param trackHashes Array of track hashes
    /// @param timestamps Array of timestamps
    /// @param durations Array of durations
    /// @param sources Array of sources
    /// @param deadline Signature expiry
    /// @param sig EIP-712 signature
    function batchScrobbleFor(
        address user,
        bytes32[] calldata trackHashes,
        uint64[] calldata timestamps,
        uint32[] calldata durations,
        uint8[] calldata sources,
        uint256 deadline,
        bytes calldata sig
    ) external {
        require(block.timestamp <= deadline, "Signature expired");
        require(trackHashes.length == timestamps.length, "Length mismatch");
        require(trackHashes.length == durations.length, "Length mismatch");
        require(trackHashes.length == sources.length, "Length mismatch");

        uint256 nonce = _useNonce(user);

        // Hash the arrays for signature verification
        bytes32 scrobblesHash = keccak256(
            abi.encode(trackHashes, timestamps, durations, sources)
        );

        bytes32 structHash = keccak256(
            abi.encode(
                BATCH_SCROBBLE_TYPEHASH,
                user,
                scrobblesHash,
                trackHashes.length,
                nonce,
                deadline
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, sig);
        require(signer == user, "Invalid signature");

        _batchScrobble(user, trackHashes, timestamps, durations, sources, msg.sender);
    }

    // ============ VIEW FUNCTIONS ============

    /// @notice Get a user's scrobble at index
    function getScrobble(address user, uint256 index) external view returns (Scrobble memory) {
        require(index < scrobbles[user].length, "Index out of bounds");
        return scrobbles[user][index];
    }

    /// @notice Get a range of scrobbles for a user (for pagination)
    /// @param user The user address
    /// @param offset Starting index
    /// @param limit Max number to return
    function getScrobbles(
        address user,
        uint256 offset,
        uint256 limit
    ) external view returns (Scrobble[] memory) {
        uint256 total = scrobbles[user].length;
        if (offset >= total) {
            return new Scrobble[](0);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        Scrobble[] memory result = new Scrobble[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = scrobbles[user][i];
        }

        return result;
    }

    /// @notice Get count of times a user played a specific track
    function getTrackPlayCount(address user, bytes32 trackHash) external view returns (uint256) {
        uint256 count = 0;
        Scrobble[] storage userScrobbles = scrobbles[user];
        for (uint256 i = 0; i < userScrobbles.length; i++) {
            if (userScrobbles[i].trackHash == trackHash) {
                count++;
            }
        }
        return count;
    }

    // ============ INTERNAL ============

    function _scrobble(
        address user,
        bytes32 trackHash,
        uint64 timestamp,
        uint32 durationSecs,
        uint8 source
    ) internal {
        require(source <= 5, "Invalid source");
        require(timestamp <= block.timestamp + 1 hours, "Future timestamp");

        scrobbles[user].push(Scrobble({
            trackHash: trackHash,
            timestamp: timestamp,
            durationSecs: durationSecs,
            source: source
        }));

        scrobbleCount[user]++;

        emit Scrobbled(user, trackHash, timestamp, durationSecs, source);
    }

    function _batchScrobble(
        address user,
        bytes32[] calldata trackHashes,
        uint64[] calldata timestamps,
        uint32[] calldata durations,
        uint8[] calldata sources,
        address relayer
    ) internal {
        require(trackHashes.length > 0, "Empty batch");
        require(trackHashes.length <= 100, "Batch too large");
        require(trackHashes.length == timestamps.length, "Length mismatch");
        require(trackHashes.length == durations.length, "Length mismatch");
        require(trackHashes.length == sources.length, "Length mismatch");

        for (uint256 i = 0; i < trackHashes.length; i++) {
            require(sources[i] <= 5, "Invalid source");
            require(timestamps[i] <= block.timestamp + 1 hours, "Future timestamp");

            scrobbles[user].push(Scrobble({
                trackHash: trackHashes[i],
                timestamp: timestamps[i],
                durationSecs: durations[i],
                source: sources[i]
            }));
        }

        scrobbleCount[user] += trackHashes.length;

        emit BatchScrobbled(user, relayer, trackHashes.length);
    }
}
