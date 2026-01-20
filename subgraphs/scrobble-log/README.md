# ScrobbleLog Subgraph

Indexes `BatchCommitted` events from ScrobbleLogV2 on Base Sepolia and fetches batch content from IPFS.

## Contract

- **Address:** `0xeeC197414D3656d1fb4bA0d6E60AD4160aF64378`
- **Network:** Base Sepolia
- **Start Block:** 36000000

## Setup

```bash
bun install
bun run codegen
bun run build
```

## Local Testing with gnd

[Graph Node Dev (gnd)](https://github.com/graphprotocol/graph-node-dev) provides a simple local testing environment.

### Start gnd

```bash
# Ensure PostgreSQL is in PATH
export PATH="/usr/lib/postgresql/16/bin:$PATH"

# Start with Base Sepolia RPC
gnd --ethereum-rpc base-sepolia:$BASE_SEPOLIA_RPC

# Or use a specific RPC URL
gnd --ethereum-rpc base-sepolia:https://sepolia.base.org
```

### Deploy Locally

The subgraph auto-deploys on gnd startup. Access at:
- **GraphQL:** http://localhost:8000/subgraphs/name/subgraph-0
- **IPFS:** http://localhost:5001

### Example Query

```graphql
{
  users(first: 10) {
    id
    totalBatches
    totalTracks
    batches {
      cid
      count
      startTs
      endTs
      tracks {
        artist
        title
        playedAt
      }
    }
  }
  globalStats(id: "global") {
    totalBatches
    totalTracks
    totalUsers
  }
}
```

## Deploy to The Graph Studio

1. Create subgraph at https://thegraph.com/studio/
2. Get deploy key
3. Authenticate and deploy:

```bash
bun run auth --studio <DEPLOY_KEY>
bun run deploy
```

## Entities

### User
- `id`: User address (Bytes)
- `totalBatches`: Number of batches committed
- `totalTracks`: Total tracks across all batches
- `batches`: Derived list of ScrobbleBatch

### ScrobbleBatch
- `id`: txHash-logIndex
- `user`: Reference to User
- `cid`: IPFS CID string
- `startTs/endTs`: Batch time range
- `count`: Number of tracks
- `ipfsLoaded`: Whether IPFS content was fetched
- `tracks`: Derived list of Track

### Track
- `id`: batchId-index
- `batch`: Reference to ScrobbleBatch
- `artist/title/album`: Track metadata
- `duration`: Track duration in seconds
- `playedAt`: Unix timestamp when played

### GlobalStats
- `totalBatches/totalTracks/totalUsers`: Aggregate stats

## Notes

- IPFS fetching happens during indexing; if Filebase gateway is slow, tracks may not load
- The subgraph uses the IPFS gateway configured in gnd (default: localhost:5001)
- For production, ensure the IPFS content is pinned and accessible
