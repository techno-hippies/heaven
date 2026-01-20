# V0 Implementation Plan

## Overview

Ship the minimal end-to-end flow: **pre-minted shadow PKPs → on-chain likes → subgraph indexing → XMTP chat on match**.

**Key decisions:**
- Shadow profiles have **pre-minted PKPs** (admin-controlled)
- Likes go **on-chain immediately** (Variant A)
- **Subgraph** is source of truth for likes/matches (not D1)
- D1 holds auxiliary data: shadow profile metadata, claim state, featured rankings

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ON-CHAIN (Ethereum Sepolia / Zama fhEVM)                                   │
│                                                                             │
│  DirectoryV2 (0x4186...)        DatingV3 (0x1282...)                        │
│  ├─ profiles[]                  ├─ hasLiked[from][to]                       │
│  └─ ProfileUpdated event        ├─ isMatch[a][b]                            │
│                                 ├─ LikeSent(from, to)                       │
│                                 ├─ MatchPending(pairKey, user1, user2)      │
│                                 └─ MatchCreated(user1, user2)               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │ events
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  SUBGRAPH (The Graph / gnd)                                                 │
│  subgraphs/dating/                                                          │
│                                                                             │
│  Entities:                                                                  │
│    Profile { id, animeCid, ageBucket, genderIdentity, ... }                │
│    Like { id, from, to, timestamp }                                        │
│    Match { id, user1, user2, timestamp }                                   │
│    PendingMatch { id, user1, user2, mutualOkHandle, finalized }            │
│                                                                             │
│  Queries:                                                                   │
│    likes(where: { to: $address }) → who liked me                           │
│    matches(where: { user1: $address }) → my matches                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │ GraphQL
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  WORKERS (Cloudflare)                                                       │
│  workers/api/                                                               │
│                                                                             │
│  GET  /api/candidates   → D1 (featured list) + subgraph (exclude liked)    │
│  POST /api/likes        → Relayer → DatingV3.submitLike()                  │
│  GET  /api/matches      → Subgraph query                                   │
│  GET  /api/likes/received → Subgraph query (who liked me)                  │
│  POST /api/claim/*      → D1 + Lit (PKP auth handoff)                      │
│                                                                             │
│  D1 holds:                                                                  │
│    - shadow_profiles (metadata, featured_rank, claim state)                │
│    - claim_tokens (proof verification)                                     │
│    - users (tier tracking)                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  FRONTEND (apps/website)                                                    │
│                                                                             │
│  Home.tsx → GET /api/candidates → display cards → POST /api/likes          │
│  Messages.tsx → GET /api/matches → XMTP conversations                      │
│  Claim.tsx → POST /api/claim/* → PKP handoff                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Tiers (Updated for Pre-Minted PKPs)

| Tier | PKP State | On-Chain | Can Do |
|------|-----------|----------|--------|
| **shadow** | PKP exists (admin auth only) | Directory + DatingV3 initialized | Appear in feed, receive likes |
| **handoff** | WebAuthn added, admin present | Same | Complete onboarding |
| **claimed** | Admin auth removed | Same | Own identity, browse |
| **verified** | Claimed + Self.xyz + VPN | Same | Like, message, FHE matching |

**Key change**: Shadow profiles now have PKPs from day 1. "Cannot like" is enforced by **relayer policy**, not on-chain.

---

## Pre-Mint Script Responsibilities

For each scraped profile, the pre-mint script must:

```typescript
// 1. Mint PKP with admin ECDSA auth
const pkp = await litClient.mintPKP({ authMethods: [adminEcdsaAuth] })

// 2. Register in DirectoryV2
await directoryV2.registerOrUpdateProfile(
  animeCid,           // Generated anime avatar
  Bytes32.zero(),     // No encrypted photo yet
  0,                  // claimedAgeBucket (unset)
  0,                  // genderIdentity (hidden)
  1                   // modelVersion
)

// 3. Initialize DatingV3 with permissive defaults
await datingV3.setBasics(
  encryptedAge,              // From scraped data or default
  encryptedGenderId,         // From scraped data or default
  MASK_EVERYONE,             // Accept all genders (0x001F)
  true,                      // shareAgeOnMatch
  true,                      // shareGenderOnMatch
  proof
)

// 4. Store in D1
await db.insert(shadow_profiles).values({
  id: generateId(),
  pkp_token_id: pkp.tokenId,
  pkp_address: pkp.ethAddress,
  source: 'dateme',
  display_name: pseudonym,
  // ... other metadata
})
```

---

## Subgraph Deployment

```bash
cd subgraphs/dating

# Install dependencies
bun install

# Generate types
bun run codegen

# Build
bun run build

# Local development with gnd
export PATH="/usr/lib/postgresql/16/bin:$PATH"
gnd --ethereum-rpc sepolia:$SEPOLIA_RPC

# Deploy to The Graph Studio
bun run auth --studio <DEPLOY_KEY>
bun run deploy
```

### Example Queries

```graphql
# Who liked me?
query LikesReceived($user: Bytes!) {
  likes(where: { to: $user }, orderBy: timestamp, orderDirection: desc) {
    id
    from { id }
    timestamp
  }
}

# My matches
query UserMatches($user: Bytes!) {
  asUser1: matches(where: { user1: $user }) {
    user2 { id }
    timestamp
  }
  asUser2: matches(where: { user2: $user }) {
    user1 { id }
    timestamp
  }
}

# Pending matches (for relayer)
query PendingMatches {
  pendingMatches(where: { finalized: false }) {
    id
    user1 { id }
    user2 { id }
    mutualOkHandle
  }
}
```

---

## API Endpoints

### `GET /api/candidates`

Returns curated profiles for the feed.

**Response:**
```typescript
{
  candidates: Array<{
    targetType: 'shadow' | 'user'
    targetId: string              // PKP address
    displayName: string
    avatarUrl: string
    ageBucket: number
    genderIdentity: number
  }>
  meta: {
    candidateSetRoot: string      // Merkle root for like authorization
    nonce: number
    expiry: number
    maxLikes: number
  }
}
```

**Logic:**
1. Query D1 `shadow_profiles` by `featured_rank`
2. Query subgraph to exclude already-liked
3. Return merged results

### `POST /api/likes`

Submits a like on-chain via relayer.

**Request:**
```typescript
{
  viewerAddress: string
  targetAddress: string
  signature?: string    // EIP-712 LikeAuthorization (V0.5)
}
```

**Response:**
```typescript
{
  success: boolean
  txHash: string
  mutual: boolean       // If this created a match
  peerAddress?: string
}
```

**Logic:**
1. Verify viewer is `verified` tier (D1 check)
2. Compute Merkle proof for target
3. Call `DatingV3.authorizeLikes()` if needed
4. Call `DatingV3.submitLike(viewer, target, nonce, proof)`
5. Return tx hash; frontend polls subgraph for match status

### `GET /api/matches`

Returns viewer's matches from subgraph.

**Response:**
```typescript
{
  matches: Array<{
    peerAddress: string
    displayName: string
    avatarUrl: string
    matchedAt: number
  }>
}
```

---

## Claim Flow (Pre-Minted PKPs)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. OUTREACH                                                                │
│                                                                             │
│  "Someone liked you on Heaven! Claim: heaven.example/c/<token>"             │
│  "Or add NEO-XXXXXX to your dateme bio"                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  2. USER PROVES PLATFORM CONTROL                                            │
│                                                                             │
│  Bio-edit: User adds "NEO-XXXXXX" to profile, backend re-scrapes           │
│  DM token: User enters token from DM                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  3. ADD WEBAUTHN TO EXISTING PKP                                            │
│                                                                             │
│  Backend (admin auth):                                                      │
│    - User creates passkey                                                   │
│    - Lit.addAuthMethod(pkpTokenId, webauthnCredential)                     │
│    - D1: directory_tier = 'handoff'                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  4. REMOVE ADMIN AUTH                                                       │
│                                                                             │
│  User (WebAuthn):                                                           │
│    - Signs removeAuthMethod for admin ECDSA                                │
│    - Submits to Lit                                                        │
│  Backend detects: D1: directory_tier = 'claimed'                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  5. COMPLETE VERIFICATION                                                   │
│                                                                             │
│  - Self.xyz passport scan                                                  │
│  - VPN setup + verification                                                │
│  - D1: directory_tier = 'verified'                                         │
│  - User can now like others                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## D1 Schema

Reduced from original—subgraph handles likes/matches:

```sql
-- Claimed users (tier tracking)
CREATE TABLE users (
  address TEXT PRIMARY KEY,
  directory_tier TEXT DEFAULT 'shadow',
  created_at INTEGER NOT NULL,
  last_active_at INTEGER
);

-- Shadow profile metadata (source data, not on-chain)
CREATE TABLE shadow_profiles (
  id TEXT PRIMARY KEY,
  pkp_token_id TEXT NOT NULL,
  pkp_address TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT,
  display_name TEXT,
  bio TEXT,
  age_bucket INTEGER,
  gender_identity INTEGER,
  photos_json TEXT,
  anime_cid TEXT,
  featured_rank INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  claimed_at INTEGER
);

-- Claim tokens
CREATE TABLE claim_tokens (
  id TEXT PRIMARY KEY,
  shadow_profile_id TEXT NOT NULL,
  token_hash TEXT,
  human_code_hash TEXT,
  method TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0
);
```

---

## XMTP Integration

Port from `apps/old-website/src/lib/xmtp/`:

```typescript
// On match detection
async function onMatchCreated(peerAddress: string) {
  const client = await initXMTPClient(pkpInfo, signMessage)

  // Both users allow each other
  await client.contacts.allow([peerAddress])

  // Create or get conversation
  const dm = await getOrCreateDM(peerAddress)

  // Navigate to conversation
  navigate(`/messages/${peerAddress}`)
}
```

---

## File Structure

```
heaven/
├── subgraphs/
│   └── dating/                    # NEW: Likes/matches indexer
│       ├── schema.graphql
│       ├── subgraph.yaml
│       ├── src/
│       │   ├── directory.ts
│       │   └── dating.ts
│       └── abis/
├── workers/
│   └── api/                       # NEW: Candidates/likes/claim API
│       ├── schema.sql
│       ├── wrangler.toml
│       └── src/
│           ├── index.ts
│           └── routes/
├── apps/website/
│   └── src/
│       ├── lib/xmtp/              # COPY from old-website
│       └── pages/
│           ├── Home.tsx           # Wire to /api/candidates
│           └── Messages.tsx       # Wire to /api/matches + XMTP
└── contracts/fhevm/
    └── deployments/11155111.json  # Contract addresses
```

---

## Next Steps

1. [x] Create D1 schema
2. [x] Build candidates endpoint
3. [x] Build likes endpoint (relayer)
4. [x] Build matches endpoint
5. [x] Create dating subgraph
6. [x] Port XMTP client
7. [x] Wire Home page (swipe UI + /api/candidates)
8. [x] Wire Messages page (using MessagesView + XMTP)
9. [x] Build claim flow (API + frontend wired)
10. [x] WebAuthn + Lit PKP integration (passkey minting for new users)
11. [x] Wire onboarding to PKP auth session (auto-prompts passkey on entry)
12. [ ] Pre-mint script for shadow profiles (admin-controlled PKPs)
13. [ ] Add WebAuthn to existing PKP flow (for pre-minted shadows)
14. [ ] Deploy subgraph to The Graph
15. [ ] End-to-end test: 2 users → like → match → chat

---

## Current Implementation Notes

### Claim Flow (Current - V0.1)

The current implementation mints a **new PKP** for each claimed user rather than adding WebAuthn to a pre-minted PKP. This is simpler but means:

- Shadow profiles don't have PKPs yet (no on-chain presence)
- Likes to shadows are stored in D1, not on-chain
- On claim, user gets a fresh PKP linked via `claimed_address` in D1

**Flow:**
```
User visits /c/:token
  → Verifies ownership (bio-edit or DM token)
  → Creates passkey (WebAuthn)
  → Mints new PKP (3-5 seconds)
  → D1 updated: shadow_profiles.claimed_address = pkp.ethAddress
  → Redirect to /onboarding
```

**Files:**
- `apps/website/src/pages/Claim.tsx` - Full claim UI
- `apps/website/src/lib/lit/auth-webauthn.ts` - `mintPKPForClaim()`
- `workers/api/src/routes/claim.ts` - API endpoints

### Pre-Mint Flow (V0.2 - Not Yet Implemented)

For production, shadow profiles should have **pre-minted PKPs** so likes can go on-chain immediately:

```
Pre-mint script:
  → Mint PKP with admin ECDSA auth
  → Register in DirectoryV2
  → Initialize DatingV3
  → Store pkp_address in D1

Claim flow (updated):
  → User creates passkey
  → Backend adds WebAuthn to existing PKP (admin auth)
  → User removes admin auth (becomes owner)
```

This requires:
- `createWebAuthnCredentialForClaim()` already exists in auth-webauthn.ts
- Backend endpoint to call `addPermittedAuthMethod` with admin key
- Frontend flow to call `removeAuthMethod` to claim ownership
