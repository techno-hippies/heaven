# DNS-VPN-Scrobbler (Tauri Desktop App)

Desktop app for music scrobbling + DNS-based content filtering (VPN). Built with Tauri, SolidJS, and TypeScript.

---

## Project Overview

**Current Phase:** Scrobbling complete. VPN working with known browser limitations.

| Feature | Status | Description |
|---------|--------|-------------|
| **Scrobbling Backend** | ✅ Complete | MPRIS listener + SQLite queue + Tauri commands/events |
| **Scrobbling UI** | ✅ Complete | Dashboard with real data, Now Playing, Recent Tracks |
| **Lit Action Sync** | ✅ Complete | Real batch signing via Lit Protocol |
| **DNS VPN** | ⚠️ Partial | WireGuard tunnel + DNS routing works; browser single-label TLD issue |

---

## Implementation Status

### Completed

| Component | Status | Details |
|-----------|--------|---------|
| **MPRIS Listener** | ✅ Working | Detects players, tracks playback, handles play/pause |
| **SQLite Queue** | ✅ Working | Stores scrobbles with art_url, sync status, batch CID |
| **Tauri Commands** | ✅ Working | get_now_playing, get_recent_scrobbles, get_sync_status, etc |
| **Frontend Hooks** | ✅ Working | useNowPlaying, useScrobbleQueue with art resolution |
| **Dashboard UI** | ✅ Working | Now Playing card, stats, Recent Tracks with album art |
| **ScrobbleLogV2 Contract** | ✅ Deployed | Base Sepolia: `0x1AA06c3d5F4f26C8E1954C39C341C543b32963ea` |
| **Lit Action v2** | ✅ Deployed | CID: `QmUvFXHk83bxPqcxLijjDRXkjJHyW8sRjk2My4ZBsxs9n5` |
| **Filebase Integration** | ✅ Working | Encrypted API key, real IPFS pinning tested |
| **E2E Tests** | ✅ Passing | Both skip-pin and real-pinning modes |
| **Subgraph** | ✅ Complete | Location: `/subgraph/scrobble-log/`, tested with gnd |
| **Nonce Tracking** | ✅ Complete | SQLite table for replay protection |
| **Lit Sync Service** | ✅ Complete | `src/lib/lit/scrobble-sync.ts` |

### Key Files

| File | Location |
|------|----------|
| Contract | `/contracts/base/src/ScrobbleLogV2.sol` |
| Lit Action | `/lit-actions/actions/scrobble-batch-sign-v2.js` |
| Action Test | `/lit-actions/tests/scrobble-batch-sign.test.ts` |
| Encrypted Key | `/lit-actions/keys/dev/scrobble/filebase_api_key_scrobble.json` |
| Action CID | `/lit-actions/cids/dev.json` |
| Subgraph | `/subgraph/scrobble-log/` |
| Lit Sync | `src/lib/lit/scrobble-sync.ts` |
| Scrobble Hook | `src/features/scrobble/hooks/use-scrobble-queue.ts` |

---

## Architecture

### Scrobbler Flow (Sponsored via Lit)

```
┌──────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│   Tauri Client   │────►│   Lit Protocol    │────►│   Base L2       │
│   (this app)     │     │   (Two PKPs)      │     │   (contract)    │
│                  │     │                   │     │                 │
│ - DBus/PulseAudio│     │ 1. Decrypt Filebase     │ BatchCommitted  │
│ - SQLite queue   │     │ 2. Pin to IPFS    │     │ (event only)    │
│ - Daily batch    │     │ 3. User PKP signs │     │                 │
└──────────────────┘     │ 4. Master PKP tx  │     └─────────────────┘
                         └───────────────────┘
                                  │
                                  ▼ Master PKP pays gas
                         ┌───────────────────┐
                         │  Sponsored TX     │
                         │  (user never pays)│
                         └───────────────────┘
```

**Two-PKP Architecture:**
- **User PKP**: Signs batch digest (proves user authorized this batch)
- **Master PKP** (`0x089fc7801D8f7D487765343a7946b1b97A7d29D4`): Submits tx and pays gas

### Data Flow

1. **Client** collects scrobbles continuously (DBus/MPRIS on Linux)
2. Appends to **local SQLite queue**
3. Once per day (or per N scrobbles): builds **1 batch** (JSON array)
4. Calls **Lit Action v2** with batch data:
   - Lit Action decrypts Filebase API key (only accessible inside Lit nodes)
   - Pins batch JSON to Filebase IPFS (via `runOnce`)
   - Computes count/startTs/endTs from actual tracks (doesn't trust client)
   - User PKP signs digest
   - Master PKP signs and broadcasts tx (pays gas)
   - Returns: `{ txHash, cidString, cidHash, ... }`
5. **Contract** verifies user signature via `ECDSA.recover`, emits event
6. **User never pays gas** - Master PKP sponsors all transactions

### Batch File Format (NDJSON)

```json
{"playedAt":1737200167,"dur":386,"artist":"Radiohead","title":"Karma Police","source":"rhythmbox"}
{"playedAt":1737200553,"dur":234,"artist":"Tame Impala","title":"Let It Happen","source":"spotify"}
```

No registry needed - batch contains display fields. Indexer fetches CID and parses.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | SolidJS, Tailwind CSS v4, Kobalte, Corvu |
| Icons | Phosphor (phosphor-icons-solid) |
| Build | Vite, Storybook |
| Desktop | Tauri v2 (Rust) |
| DB | SQLite (local queue) |
| Auth | Lit Protocol PKP + WebAuthn |
| Storage | IPFS via Filebase |
| Chain | Base L2 |

---

## Project Structure

```
apps/dns-vpn-scrobbler/
├── src/                    # SolidJS frontend
│   ├── ui/                 # Design system primitives
│   ├── components/         # App components
│   ├── features/
│   │   ├── scrobble/       # Scrobbling UI
│   │   │   ├── components/ # Feature-internal
│   │   │   ├── hooks/      # useScrobbleQueue, etc.
│   │   │   └── lib/        # SQLite helpers
│   │   └── vpn/            # Future: VPN UI
│   ├── pages/              # Main views
│   ├── lib/                # Utilities (cn, haptic, etc.)
│   └── app/                # Providers, router
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── lib.rs          # Main Tauri commands
│   │   ├── scrobble/       # Scrobble collection
│   │   │   ├── mpris.rs    # MPRIS listener + state updates
│   │   │   ├── state.rs    # Track timing + threshold logic
│   │   │   ├── queue.rs    # SQLite queue + sync metadata
│   │   │   └── types.rs    # Shared scrobble types/events
│   │   └── vpn/            # Future: WireGuard
│   └── Cargo.toml
├── .storybook/             # Storybook config
├── package.json
├── tsconfig.json
├── vite.config.ts
└── CLAUDE.md
```

## Contract: ScrobbleLogV2 (Event-Only)

**Deployed:** Base Sepolia `0x1AA06c3d5F4f26C8E1954C39C341C543b32963ea`

Different from ScrobbleLogV1 (per-track). This is **batch-based** with **user signature verification**:

```solidity
contract ScrobbleLogV2 {
    event BatchCommitted(
        address indexed user,
        bytes cid,           // IPFS CID as raw bytes
        bytes32 cidHash,     // keccak256(cid)
        uint40 startTs,      // First scrobble timestamp
        uint40 endTs,        // Last scrobble timestamp
        uint32 count,        // Number of scrobbles in batch
        uint64 nonce         // Replay protection
    );

    /// @notice Get digest for signing (EIP-191 personal sign)
    function getDigest(
        address user, bytes32 cidHash,
        uint40 startTs, uint40 endTs,
        uint32 count, uint64 nonce
    ) public view returns (bytes32);

    /// @notice Commit batch (anyone can submit with valid user signature)
    function commitBatch(
        address user, bytes calldata cid,
        uint40 startTs, uint40 endTs,
        uint32 count, uint64 nonce,
        bytes calldata userSig  // Signature from PKP
    ) external;

    /// @notice Batch commit (skip invalid, emit BatchRejected)
    function commitBatches(BatchInput[] calldata batches) external;
}
```

**Security:**
- Signature verification via `ECDSA.recover` prevents forgery
- EIP-191 personal sign format (`\x19Ethereum Signed Message:\n32`)
- Nonce per user prevents replay attacks
- Anyone can submit tx (gas sponsor friendly)

**Why event-only:**
- 1 tx per user per day (not per track)
- CID in event log is permanent, queryable
- No storage = minimal gas (~25k per batch)
- Subgraph fetches IPFS and builds aggregates

---

## Lit Actions

Location: `/media/t42/th42/Code/heaven/lit-actions/`

### scrobble-batch-sign-v2.js

**CID:** `QmUvFXHk83bxPqcxLijjDRXkjJHyW8sRjk2My4ZBsxs9n5`

Pins batch to IPFS, signs with user PKP, and broadcasts via master PKP:

```javascript
// Input from client:
jsParams = {
  userPkpPublicKey,       // User's PKP public key (signs digest)
  tracks,                 // Array of { artist, title, album?, duration?, playedAt }
  nonce,                  // Replay protection (client tracks this)
  filebaseEncryptedKey,   // From keys/dev/scrobble/filebase_api_key_scrobble.json
  dryRun,                 // Optional: return signed tx without broadcasting
  skipPin,                // Optional: use cidOverride instead of pinning
  cidOverride,            // Optional: pre-pinned CID for testing
}

// Inside Lit Action:
// 1. Validate tracks and compute count/startTs/endTs from actual data
// 2. Decrypt Filebase API key (runOnce - only one node does IO)
// 3. Pin batch JSON to Filebase IPFS
// 4. User PKP signs digest (proves authenticity)
// 5. Build tx with commitBatch() calldata
// 6. Master PKP signs and broadcasts tx (pays gas)

// Output:
response = {
  success: true,
  txHash,           // Transaction hash (from broadcast)
  cidString,        // IPFS CID string
  cidBytesHex,      // Raw CID bytes as hex
  cidHash,          // keccak256(cidBytes)
  startTs, endTs,   // Computed from tracks
  count, nonce,     // Batch metadata
  sponsor,          // Master PKP address (0x089fc...)
}
```

**Key pattern:** Master PKP (`0x089fc7801D8f7D487765343a7946b1b97A7d29D4`) pays gas. User never needs ETH.

---

## Auth Flow

Same as DNS VPN client:

1. User opens app
2. If no PKP: redirect to auth page (WebAuthn + Lit)
3. Auth page returns PKP address + session key
4. App stores session locally (Tauri secure storage)
5. For each batch: sign with PKP via Lit

---

## Now Playing (Optional, Future)

Separate from batching:

1. Client detects track change
2. Sends signed `PUT /now-playing` to relay
3. Relay stores in KV with TTL (5 min)
4. Friends can poll or subscribe via WebSocket

Not MVP - batching first.

---

## Scrobble Sources

| Code | Source | Detection |
|------|--------|-----------|
| 0 | Unknown | Default |
| 1 | Spotify | DBus name match |
| 2 | Apple Music | N/A (macOS) |
| 3 | YouTube Music | Browser extension |
| 4 | Local | Rhythmbox, VLC, etc. |
| 5 | Other | Fallback |

Linux detection via DBus MPRIS:
- `org.mpris.MediaPlayer2.spotify`
- `org.mpris.MediaPlayer2.rhythmbox`
- `org.mpris.MediaPlayer2.vlc`

---

## Batch Cadence

| Trigger | Value |
|---------|-------|
| Time | Every 24 hours |
| Count | OR every 500 scrobbles |
| Manual | User can force-sync |

Batching happens in Rust backend. SQLite stores pending until batch is acked.

---

## UI Views

### Main Dashboard

```
┌────────────────────────────────────────┐
│ [Shield Icon]  Heaven                  │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ [Art] ▶ Playing                    │ │
│ │       Karma Police                 │ │
│ │       Radiohead                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌─────────┐ ┌─────────┐               │
│ │  47     │ │  123    │               │
│ │ Today   │ │ Pending │               │
│ └─────────┘ └─────────┘               │
│                                        │
│ Synced 2 hours ago        [Sync Now]  │
│                                        │
│ Recent Tracks                          │
│ ┌────────────────────────────────────┐│
│ │[art] Let It Happen       3m ago    ││
│ │      Tame Impala         pending   ││
│ │[art] Karma Police        7m ago    ││
│ │      Radiohead           pending   ││
│ └────────────────────────────────────┘│
└────────────────────────────────────────┘
```

**UI Notes:**
- Now Playing shows play/pause state, no progress bar (simpler, avoids seek issues)
- Recent Tracks show album art stored with each scrobble
- Pending badge on unsynced items

### Settings

- PKP address display
- Sync frequency toggle
- Source filters
- Forget device (logout)

---

## Coding Conventions

From heaven/CLAUDE.md:
- Use Kobalte primitives for accessible UI
- Use Corvu for drawers/sheets
- Icons from `phosphor-icons-solid` only
- Utilities: `cn()` for class merging
- Never store PII - use hashes where possible

---

## Development

```bash
# Install deps
bun install

# Run Storybook (UI development)
bun run storybook

# Run Tauri dev (full app)
bun run tauri dev

# Build
bun run tauri build
```

---

## DNS VPN Implementation

### Current Status (Jan 2025)

| Component | Status | Notes |
|-----------|--------|-------|
| **WireGuard Tunnel** | ✅ Working | Via `wg-quick` + `pkexec` |
| **DNS Routing** | ✅ Working | All DNS routes through 10.13.13.1 |
| **ICANN Domains** | ✅ Working | google.com, github.com, etc. |
| **Handshake (dotted)** | ✅ Working | `nathan.woodburn/`, `d/` resolve and load |
| **Handshake (single-label)** | ⚠️ DNS works, browser blocks | `shakestation` resolves but browsers refuse |
| **DANE/TLSA** | ⚠️ Records resolve, no validation | Browsers don't support DANE natively |
| **Tinybird Logging** | ✅ Working | DNS events logged for analytics |

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Tauri Client   │────►│  WireGuard VPN   │────►│  VPN Server     │
│  (this app)     │     │  (wg-quick)      │     │  144.126.205.242│
│                 │     │                  │     │                 │
│ - SIWE auth     │     │ - 10.13.13.x IP  │     │ - hp-dns-gw     │
│ - PKP signing   │     │ - DNS via %i     │     │ - hp-resolver   │
│ - Config file   │     │ - resolvectl     │     │ - hp-hsd        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### DNS Resolution Chain

```
Browser → systemd-resolved → WireGuard (10.13.13.1) → hp-dns-gw → hp-resolver
                                                                      │
                                                          ┌───────────┴───────────┐
                                                          ▼                       ▼
                                                    ICANN (upstream)        HSD (Handshake)
```

### WireGuard Config (Linux)

Generated by server at `/api/get-wg-config`, saved to:
`~/.local/share/com.heaven.desktop/heaven-vpn.conf`

```ini
[Interface]
PrivateKey = <generated>
Address = 10.13.13.X/32
PostUp = resolvectl dns %i 10.13.13.1; resolvectl domain %i "~."; resolvectl flush-caches
PreDown = resolvectl revert %i || true

[Peer]
PublicKey = xLNj8b7YpyQTZaZDn6re8YQyN/AwCjD7ikm+SDRWniQ=
AllowedIPs = 10.13.13.1/32
Endpoint = 144.126.205.242:51820
PersistentKeepalive = 25
```

**Key fix (Jan 2025):** DNS must be set on VPN interface (`%i`) not default interface (`$IF`).

### Known Issues

#### 1. Single-Label TLDs in Browsers

**Problem:** Browsers block single-label hostnames (no dots) as a security policy.
- `shakestation` → DNS resolves (tcpdump confirms) → Browser shows ERR_NAME_NOT_RESOLVED
- `nathan.woodburn` → Works (has a dot)

**Root cause:** Chrome/Firefox/Brave treat single-label names as search queries or intranet names.

**Potential solutions:**
- Browser extension to force navigation
- Local proxy (PAC file or letsdane)
- Not solvable via DNS alone

#### 2. DANE/TLSA Not Validated

**Problem:** TLSA records resolve but browsers don't validate them.
- `dig @10.13.13.1 _443._tcp.shakestation TLSA` → Returns valid record
- Browser still shows cert warning (ignores TLSA)

**Solution needed:** letsdane proxy or browser extension for DANE validation.

### Server Deployment

Server: `144.126.205.242` (Digital Ocean)
Deployed: `/opt/dns-vpn/`

```bash
# SSH to server
ssh root@144.126.205.242

# Check containers
docker ps  # hp-wireguard, hp-dns-gw, hp-resolver, hp-hsd, hp-postgres

# View logs
docker logs hp-dns-gw --tail 50

# Rebuild after code changes
cd /opt/dns-vpn && docker compose build hp-dns-gw && docker compose up -d hp-dns-gw
```

### Key Files

| File | Purpose |
|------|---------|
| `src-tauri/src/vpn/` | Rust VPN commands (connect, disconnect, status) |
| `src/features/vpn/hooks/` | Frontend hooks for VPN state |
| `src/lib/lit/sign.ts` | PKP message signing for SIWE |
| `services/dns-server/src/api/mod.rs` | Server-side WireGuard config generation |

### Testing VPN

```bash
# Check tunnel status
sudo wg show heaven-vpn

# Test DNS routing
dig @10.13.13.1 google.com +short
dig @10.13.13.1 d +short  # Handshake TLD

# Test systemd-resolved
resolvectl status heaven-vpn
resolvectl query d

# Monitor DNS traffic
sudo tcpdump -ni heaven-vpn udp port 53
```

### Next Steps

1. **Browser extension** for single-label TLD navigation
2. **letsdane integration** for DANE/TLSA validation
3. **UI polish** for VPN connect/disconnect
4. **Auto-connect** on app startup (optional)

---

## Subgraph

Location: `/media/t42/th42/Code/heaven/subgraph/scrobble-log/`

Indexes `BatchCommitted` events and fetches IPFS batch content:

```graphql
type ScrobbleBatch @entity {
  id: ID!                    # txHash-logIndex
  user: User!
  cid: String!
  cidHash: Bytes!
  startTs: BigInt!
  endTs: BigInt!
  count: Int!
  nonce: BigInt!
  tracks: [Track!]! @derivedFrom(field: "batch")
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: Bytes!
}

type Track @entity {
  id: ID!                    # batchId-index
  batch: ScrobbleBatch!
  artist: String!
  title: String!
  album: String
  duration: Int
  playedAt: BigInt!
}
```

**Local testing with gnd:**
```bash
export PATH="/usr/lib/postgresql/16/bin:$PATH"
gnd --ethereum-rpc base-sepolia:$BASE_SEPOLIA_RPC
# Access at http://localhost:8000/subgraphs/name/subgraph-0
```

---

## Quick Reference

| What | Command |
|------|---------|
| Storybook | `bun run storybook` |
| Tauri Dev | `bun run tauri dev` |
| Build | `bun run tauri build` |
| Type check | `bun run check` |
