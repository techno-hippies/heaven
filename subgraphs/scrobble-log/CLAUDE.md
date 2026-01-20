# ScrobbleLog Subgraph

Indexes `BatchCommitted` events from ScrobbleLogV2 on Base Sepolia and fetches batch content from IPFS.

---

## Contract

| Property | Value |
|----------|-------|
| **Address** | `0x1AA06c3d5F4f26C8E1954C39C341C543b32963ea` |
| **Network** | Base Sepolia |
| **Start Block** | 36517900 |
| **Event** | `BatchCommitted(address indexed user, bytes cid, bytes32 cidHash, uint40 startTs, uint40 endTs, uint32 count, uint64 nonce)` |

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
gnd --ethereum-rpc base-sepolia:$BASE_SEPOLIA_RPC

# Access GraphQL at http://localhost:8000/subgraphs/name/subgraph-0
```

---

## Entities

### User
- `id`: User address (Bytes)
- `totalBatches`: Number of batches committed
- `totalTracks`: Total tracks across all batches
- `firstBatchAt`: Timestamp of first batch
- `lastBatchAt`: Timestamp of last batch
- `batches`: Derived list of ScrobbleBatch

### ScrobbleBatch
- `id`: txHash-logIndex
- `user`: Reference to User
- `cid`: IPFS CID string (decoded from bytes)
- `cidHash`: keccak256(cid)
- `startTs/endTs`: Batch time range
- `count`: Number of tracks in batch
- `nonce`: Replay protection nonce
- `ipfsLoaded`: Whether IPFS content was fetched
- `tracks`: Derived list of Track
- `blockNumber/blockTimestamp/transactionHash`: Block metadata

### Track
- `id`: batchId-index
- `batch`: Reference to ScrobbleBatch
- `artist/title/album`: Track metadata
- `duration`: Track duration in seconds
- `playedAt`: Unix timestamp when played

### GlobalStats
- `id`: "global" (singleton)
- `totalBatches/totalTracks/totalUsers`: Aggregate stats
- `lastBatchAt`: Most recent batch timestamp

---

## Example Queries

### Get all users with their batches
```graphql
{
  users(first: 10, orderBy: totalTracks, orderDirection: desc) {
    id
    totalBatches
    totalTracks
    batches(first: 5, orderBy: blockTimestamp, orderDirection: desc) {
      cid
      count
      startTs
      endTs
      blockTimestamp
    }
  }
}
```

### Get global stats
```graphql
{
  globalStats(id: "global") {
    totalBatches
    totalTracks
    totalUsers
    lastBatchAt
  }
}
```

### Get recent batches with track count
```graphql
{
  scrobbleBatches(first: 20, orderBy: blockTimestamp, orderDirection: desc) {
    id
    user { id }
    cid
    count
    startTs
    endTs
    blockTimestamp
  }
}
```

---

## File Structure

```
subgraph/scrobble-log/
├── schema.graphql          # Entity definitions
├── subgraph.yaml           # Data source config
├── src/
│   ├── mappings.ts         # Event handlers
│   └── entities.ts         # Re-exports from generated
├── abis/
│   └── ScrobbleLogV2.json  # Contract ABI
├── generated/              # Auto-generated types (codegen)
├── build/                  # Compiled WASM (build)
├── package.json
├── tsconfig.json
└── README.md
```

---

## Key Implementation Notes

### AssemblyScript Null Handling
AssemblyScript requires strict equality (`===`) for null checks with nullable types:
```typescript
// WRONG - causes compiler crash
if (user.firstBatchAt == null) { ... }

// CORRECT
let firstBatch = user.firstBatchAt;
if (firstBatch === null) { ... }
```

### Event Parameter Types
Event params from BigInt must be converted for i32 fields:
```typescript
let countBigInt = event.params.count;
let countI32 = countBigInt.toI32();
batch.count = countI32;
```

### CID Decoding
The contract emits CID as raw bytes. Decode to string:
```typescript
let cidString = event.params.cid.toString();
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
| Contract | `/contracts/base/src/ScrobbleLogV2.sol` |
| Lit Action | `/lit-actions/actions/scrobble-batch-sign-v2.js` |
| Action CID | `QmUvFXHk83bxPqcxLijjDRXkjJHyW8sRjk2My4ZBsxs9n5` |
| Client App | `/apps/dns-vpn-scrobbler/` |
