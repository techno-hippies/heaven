# DNS-VPN-Scrobbler (Tauri Desktop App)

Desktop app for music scrobbling + DNS-based content filtering (VPN). Built with Tauri, SolidJS, and TypeScript.

---

## Project Overview

**Current Phase:** Scrobbling first, VPN later.

| Feature | Status | Description |
|---------|--------|-------------|
| **Scrobbling** | Building | Collect music plays, batch to IPFS, anchor on-chain |
| **DNS VPN** | Future | Port from higher-power dns-client when scrobbling works |

---

## Architecture

### Scrobbler Flow

```
┌──────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│   Tauri Client   │────►│   Relay Worker    │────►│   Base L2       │
│   (this app)     │     │   (CF Worker)     │     │   (contract)    │
│                  │     │                   │     │                 │
│ - DBus/PulseAudio│     │ - Verify PKP sig  │     │ BatchCommitted  │
│ - SQLite queue   │     │ - Pin to Filebase │     │ (event only)    │
│ - Daily batch    │     │ - Submit tx       │     │                 │
└──────────────────┘     └───────────────────┘     └─────────────────┘
```

### Data Flow

1. **Client** collects scrobbles continuously (DBus/MPRIS on Linux)
2. Appends to **local SQLite queue**
3. Once per day (or per N scrobbles): builds **1 batch file** (NDJSON)
4. Sends batch to **relay** with PKP signature
5. Relay pins to **Filebase**, gets CID
6. Relay submits **1 tx** to contract with event:
   ```solidity
   event BatchCommitted(address indexed user, bytes cid, uint40 startTs, uint40 endTs, uint32 count)
   ```

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
│   │   │   ├── dbus.rs     # MPRIS listener
│   │   │   ├── queue.rs    # SQLite queue
│   │   │   └── batch.rs    # Batch builder
│   │   └── vpn/            # Future: WireGuard
│   └── Cargo.toml
├── .storybook/             # Storybook config
├── package.json
├── tsconfig.json
├── vite.config.ts
└── CLAUDE.md
```

---

## Contract: ScrobbleLogV2 (Event-Only)

Different from ScrobbleLogV1 in CLAUDE.md (per-track). This is **batch-based**:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ScrobbleLogV2 {
    event BatchCommitted(
        address indexed user,
        bytes cid,           // IPFS CID as raw bytes
        uint40 startTs,      // First scrobble timestamp
        uint40 endTs,        // Last scrobble timestamp
        uint32 count         // Number of scrobbles in batch
    );

    /// @notice Commit a batch of scrobbles (called by relay)
    function commitBatch(
        address user,
        bytes calldata cid,
        uint40 startTs,
        uint40 endTs,
        uint32 count
    ) external {
        // Relay is trusted, or add signature verification
        emit BatchCommitted(user, cid, startTs, endTs, count);
    }
}
```

**Why event-only:**
- 1 tx per user per day (not per track)
- CID in event log is permanent, queryable
- No storage = minimal gas
- Indexer (subgraph) fetches IPFS and builds aggregates

---

## Lit Actions

Location: `/media/t42/th42/Code/heaven/lit-actions/`

### scrobble-batch-sign.js

Signs scrobble batch for relay:

```javascript
// Input: batchHash (sha256 of NDJSON), userAddress
// Output: signature proving user owns this batch

const sigShare = await Lit.Actions.signEcdsa({
  toSign: ethers.utils.arrayify(batchHash),
  publicKey: pkpPublicKey,
  sigName: "scrobble-batch"
});
```

Relay verifies signature before pinning/submitting.

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
│ [Shield Icon]  Higher Power            │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │  Now Playing                       │ │
│ │  Karma Police - Radiohead          │ │
│ │  ▶ 2:34 / 4:22                     │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Today: 47 scrobbles                    │
│ Pending sync: 123                      │
│ Last sync: 2 hours ago                 │
│                                        │
│ [Sync Now]                             │
│                                        │
│ ──────────────────────────────────     │
│ Recent                                 │
│ • Let It Happen - Tame Impala   3m    │
│ • Karma Police - Radiohead      7m    │
│ • ...                                  │
└────────────────────────────────────────┘
```

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

## Migration from DNS-Client

When ready to add VPN:

1. Copy `src-tauri/src/lib.rs` VPN sections from `higher-power/apps/dns-client`
2. Add WireGuard deps to Cargo.toml
3. Create `src/features/vpn/` components
4. Share auth flow (PKP already integrated)

The app will support both features with tabs/nav.

---

## Relay Worker (Separate)

Lives in `/media/t42/th42/Code/heaven/workers/scrobble-relay/`:

```typescript
// POST /batch
// Body: { batch: NDJSON, signature: hex, publicKey: hex }
// 1. Verify PKP signature
// 2. Derive user address from publicKey
// 3. Pin to Filebase → get CID
// 4. Call contract.commitBatch(user, cid, ...)
// 5. Return { cid, txHash }
```

---

## Quick Reference

| What | Command |
|------|---------|
| Storybook | `bun run storybook` |
| Tauri Dev | `bun run tauri dev` |
| Build | `bun run tauri build` |
| Type check | `bun run check` |
