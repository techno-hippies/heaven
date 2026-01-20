# Heaven Dating Subgraph

Indexes `DirectoryV2` and `DatingV3` contracts on Ethereum Sepolia (Zama fhEVM).

---

## Contracts

| Contract | Address | Network |
|----------|---------|---------|
| **DirectoryV2** | `0x41866647a334BBA898EBe2011C3b2971C1F3D5b5` | Sepolia |
| **DatingV3** | `0x1282fF4F33eFA67ea4f85E462F5D73e2cfF25b07` | Sepolia |

---

## Development

```bash
# Install dependencies
bun install

# Generate types from schema and ABI
bun run codegen

# Build the subgraph
bun run build

# Local testing with gnd
export PATH="/usr/lib/postgresql/16/bin:$PATH"
gnd --ethereum-rpc sepolia:$SEPOLIA_RPC

# Access GraphQL at http://localhost:8000/subgraphs/name/subgraph-0
```

---

## Entities

### Profile
- `id`: PKP address (Bytes)
- `animeCid`, `encPhotoCid`: IPFS CIDs from Directory
- `ageBucket`, `genderIdentity`, `verifiedLevel`: Directory fields
- `profileInitialized`: DatingV3.setBasics() called
- `isVerified`: Self.xyz verification complete
- `totalLikesSent`, `totalLikesReceived`, `totalMatches`: Stats

### Like
- `id`: txHash-logIndex
- `from`, `to`: Profile references
- `timestamp`, `blockNumber`, `transactionHash`

### Match
- `id`: user1-user2 (sorted addresses)
- `user1`, `user2`: Profile references
- `timestamp`, `blockNumber`, `transactionHash`

### PendingMatch
- `id`: pairKey (keccak256(user1, user2))
- `mutualOkHandle`: FHE encrypted eligibility result
- `finalized`: Whether finalizeMatch has been called

### LikeAuthorization
- `id`: user-nonce
- `candidateSetRoot`, `maxLikes`, `expiry`, `nonce`
- `likesUsed`, `active`

### GlobalStats
- `id`: "global" (singleton)
- `totalProfiles`, `totalLikes`, `totalMatches`, `totalPendingMatches`

---

## Events Indexed

### DirectoryV2
- `ProfileUpdated(indexed address, uint32 timestamp)`
- `ProfileAttested(indexed address, uint8 ageBucket, uint8 verifiedLevel)`

### DatingV3
- `ProfileSet(indexed address)`
- `VerifiedAttributesSet(indexed address, bytes32 nullifier)`
- `LikesAuthorized(indexed address, uint64 nonce, uint8 maxLikes, uint64 expiry)`
- `LikeSent(indexed address from, indexed address to)`
- `MatchPending(indexed bytes32 pairKey, address user1, address user2, bytes32 handle)`
- `MatchCreated(indexed address user1, indexed address user2)`
- `SharedValuesComputed(indexed address user1, indexed address user2)`

---

## Example Queries

### Get likes received by a user
```graphql
query LikesReceived($user: Bytes!) {
  likes(where: { to: $user }, orderBy: timestamp, orderDirection: desc) {
    id
    from { id }
    timestamp
  }
}
```

### Get matches for a user
```graphql
query UserMatches($user: Bytes!) {
  asUser1: matches(where: { user1: $user }) {
    id
    user2 { id }
    timestamp
  }
  asUser2: matches(where: { user2: $user }) {
    id
    user1 { id }
    timestamp
  }
}
```

### Get pending matches (for relayer)
```graphql
query PendingMatches {
  pendingMatches(where: { finalized: false }) {
    id
    user1 { id }
    user2 { id }
    mutualOkHandle
    timestamp
  }
}
```

### Get global stats
```graphql
query Stats {
  globalStats(id: "global") {
    totalProfiles
    totalLikes
    totalMatches
    totalPendingMatches
    lastActivityAt
  }
}
```

---

## Deployment

### The Graph Studio
```bash
# Authenticate
bun run auth --studio <DEPLOY_KEY>

# Deploy
bun run deploy
```

### Local (gnd)
Auto-deploys when gnd starts in the subgraph directory.

---

## Related Files

| Component | Location |
|-----------|----------|
| DirectoryV2 Contract | `/contracts/fhevm/contracts/Directory.sol` |
| DatingV3 Contract | `/contracts/fhevm/contracts/Dating.sol` |
| Deployment Info | `/contracts/fhevm/deployments/11155111.json` |
| API Worker | `/workers/api/` |
