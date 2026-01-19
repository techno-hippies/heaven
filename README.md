# Heaven

Privacy-first dating app with DNS-behavioral matching, FHE compatibility, and decentralized identity.

## Product Overview

**Core Concept**: Match people based on their DNS traffic patterns (websites visited), verified identity claims, and encrypted compatibility preferences.

### User-Facing Features

| Feature | Description |
|---------|-------------|
| **Home** | Suggested profiles to match (swipe interface) |
| **Messages** | XMTP encrypted messaging with matches |
| **Profile** | User's own profile page |
| **AI Chat** | Stickied AI companion for DNS pattern insights |

### Navigation

- **Desktop**: Left sidebar
- **Mobile**: Bottom footer tab bar

---

## Architecture Diagram

```
                                    USER DEVICES
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   Browser Extension     Android App        Desktop App       iOS App        │
│   (Chrome/Firefox)      (Kotlin)           (Tauri/Rust)      (Swift) TBD    │
│                                                                              │
└──────────────────┬───────────┬───────────────┬─────────────────┬─────────────┘
                   │           │               │                 │
                   ▼           ▼               ▼                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              WEB APPLICATION                                  │
│   SolidJS + Tailwind v4 + @solidjs/router + @kobalte/core                    │
│                                                                              │
│   Pages:                                                                     │
│   ├── /              Home (swipe feed)                                       │
│   ├── /messages      XMTP inbox + AI companion                               │
│   ├── /profile       Own profile                                             │
│   ├── /onboarding    PKP auth → photos → Self.xyz                            │
│   └── /claim/:token  Account claim flow                                      │
│                                                                              │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                   ┌────────────────┼────────────────┐
                   │                │                │
                   ▼                ▼                ▼
┌──────────────────────┐ ┌──────────────────┐ ┌─────────────────────────────────┐
│   DNS VPN BACKEND    │ │   CLOUDFLARE     │ │   DECENTRALIZED LAYER          │
│   (dns-server/Rust)  │ │   WORKERS        │ │                                 │
├──────────────────────┤ ├──────────────────┤ │   Lit Protocol                  │
│ • WireGuard gateway  │ │ • config-sync    │ │     ├── PKP wallets            │
│ • DNS logging        │ │ • voice (Agora)  │ │     └── WebAuthn auth          │
│ • Tinybird ingest    │ │ • likes-api      │ │                                 │
│ • SIWE + JWT auth    │ │ • suggestions    │ │   XMTP                          │
│ • HNS/ETH resolution │ │ • relayer        │ │     └── E2E messaging          │
└──────────────────────┘ └──────────────────┘ │                                 │
                                              │   Zama fhEVM                    │
                                              │     ├── DatingV2.sol            │
                                              │     └── Directory.sol           │
                                              │                                 │
                                              │   EFP                           │
                                              │     └── On-chain follows        │
                                              │                                 │
                                              │   Self.xyz                      │
                                              │     └── Identity attestations   │
                                              │                                 │
                                              │   Tinybird                      │
                                              │     └── DNS analytics pipeline  │
                                              └─────────────────────────────────┘
```

---

## Directory Tiers (4-State Model)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  TIER            │  PKP STATE                │  PERMISSIONS                  │
├──────────────────┼───────────────────────────┼───────────────────────────────┤
│  shadow          │  No PKP yet (lazy mint)   │  Appear in feed, receive      │
│                  │  OR admin-only PKP        │  likes (stored off-chain)     │
├──────────────────┼───────────────────────────┼───────────────────────────────┤
│  handoff         │  WebAuthn added,          │  Complete onboarding          │
│                  │  admin still present      │  (Self.xyz, VPN setup)        │
├──────────────────┼───────────────────────────┼───────────────────────────────┤
│  claimed         │  Admin auth REMOVED       │  Own identity, but cannot     │
│                  │  (cryptographically owned)│  like/message until verified  │
├──────────────────┼───────────────────────────┼───────────────────────────────┤
│  verified        │  Claimed + Self.xyz + VPN │  Full access: like, message,  │
│                  │                           │  FHE prefs, DNS matching      │
└──────────────────┴───────────────────────────┴───────────────────────────────┘
```

### Gating Rules

**Discoverability (can be shown to others)**:

| Profile Tier | Discoverable? |
|--------------|---------------|
| `shadow` | Yes (by `verified` viewers only) |
| `handoff` | No (mid-claim, not in feed) |
| `claimed` | Yes (by `verified` viewers only) |
| `verified` | Yes (by `claimed` and `verified` viewers) |

**Browsing (can view feed)**:

| Viewer Tier | Can Browse? | Sees Which Profiles |
|-------------|-------------|---------------------|
| `shadow` | No | N/A (no PKP, no auth) |
| `handoff` | No | N/A (must complete onboarding) |
| `claimed` | Yes | `verified` only |
| `verified` | Yes | `shadow` + `claimed` + `verified` |

**Actions**:

| Action | Required Tier |
|--------|---------------|
| Receive likes | `shadow`, `claimed`, `verified` |
| Complete onboarding | `handoff` or higher |
| Like others | `verified` only |
| Send messages | `verified` only + mutual match |
| Set FHE preferences | `verified` only |

### Integrations

| Integration | Purpose |
|-------------|---------|
| **EFP** (Ethereum Follow Protocol) | On-chain following/matching |
| **XMTP** | E2E encrypted messaging |
| **Self.xyz** | Identity verification (passport-based) |
| **Spotify** | Music taste matching (TBD) |
| **HNS** (Handshake) | DNS-based profile access |
| **Lit Protocol PKP** | Decentralized identity + WebAuthn |

---

## Components to Migrate

### From `/media/t42/th42/Code/higher-power/`

| Source | Destination | Notes |
|--------|-------------|-------|
| `apps/dns-client/` | `/apps/desktop/` | Tauri VPN client |
| `apps/android/` | `/apps/android/` | Android VPN app |
| `services/dns-server/` | `/services/dns-server/` | Rust DNS gateway |
| `workers/voice/` | TBD | AI voice companion |
| `workers/config-sync/` | `/workers/config-sync/` | Extension sync |
| `workers/likes-api/` | `/workers/likes-api/` | Like submission |
| `workers/relayer/` | `/workers/relayer/` | Meta-tx relayer |
| `workers/suggestions/` | `/workers/suggestions/` | Candidate suggestions |
| `contracts/dating/` | `/contracts/dating/` | FHE matching contracts |
| `lit-actions/` | `/lit-actions/` | PKP actions |

---

## Account & Claim System

### The Problem

We're bootstrapping the directory by crawling public dating profiles (dateme.directory, ACX dating threads, cuties.dating). These people don't have accounts with us yet. We need to:

1. Create "shadow profiles" they can discover and claim
2. Let them prove ownership without requiring email (most don't have it)
3. Hand off cryptographic ownership cleanly via PKP

### Crawled Data (Current State)

From `/media/t42/th42/Code/dateme-dir-crawler/`:

| Source | Profiles | With Email | Photos Downloaded |
|--------|----------|------------|-------------------|
| ACX dating threads | 926 | 23 | ~900 |
| cuties.dating | 728 | 0 | ~1000 |
| dateme.directory | 577 | 147 | ~900 |
| **Total** | **2,231** | **170 (7.6%)** | **2,825** |

**Key insight**: 92% have no email. Platform account control is the identity anchor.

### Shadow Profile Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. CRAWL                                                                   │
│     Scrape public dating profiles from dateme docs, cuties, manifold, etc.  │
│     Extract: name, photos, bio, age, location, preferences                  │
│     Store raw in crawler DB (dateme.db)                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  2. TRANSFORM                                                               │
│     Generate anime avatar from photos (fal.ai Nano Banana Pro)              │
│     Create pseudonym (don't use real name publicly)                         │
│     Map fields to our schema                                                │
│     DELETE original photos after anime generation (privacy)                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  3. CREATE SHADOW PROFILE (NO PKP YET)                                      │
│     Insert into shadow_profiles with directory_tier = 'shadow'              │
│     pkp_token_id = NULL (lazy mint later)                                   │
│     Likes to this profile stored off-chain in likes table (to_type='shadow')│
│     Can appear in feed, receive likes, but no on-chain identity yet         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  4. OUTREACH (optional, scarce)                                             │
│     If we can DM: send ONE message with claim link + fallback instructions  │
│     If we can't DM: wait for organic discovery or triggered outreach        │
│     Triggered = they got a like, now worth spending 1 DM                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  5. CLAIM (VERIFY BEFORE MINT)                                              │
│                                                                             │
│     5a. User initiates claim                                                │
│         → Create claim_attempt with token/code                              │
│         → NO PKP minted yet (avoid cost for abandoned claims)               │
│                                                                             │
│     5b. User proves platform account control                                │
│         → verifyAnchorProof() succeeds                                      │
│         → Anchor marked verified                                            │
│                                                                             │
│     5c. MINT PKP (only after proof verified)                                │
│         → Mint PKP with admin auth                                          │
│         → User creates passkey (WebAuthn)                                   │
│         → Add WebAuthn to PKP → tier becomes 'handoff'                      │
│                                                                             │
│     5d. User removes admin auth → tier becomes 'claimed'                    │
│                                                                             │
│     5e. User completes Self.xyz + VPN → tier becomes 'verified'             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### PKP Minting Strategy (Verify-First)

**Don't mint PKPs until anchor proof is verified.** This avoids minting for users who never prove control.

| Event | Action |
|-------|--------|
| User initiates claim | Create claim_attempt, NO PKP yet |
| verifyAnchorProof() succeeds | NOW mint PKP with admin auth |
| Profile receives first like (optional) | Mint PKP (enables on-chain like) |
| High-value profile (manual) | Pre-mint for important profiles |

This is the biggest lever on cost and operational complexity. Shadow profiles work fine without PKPs - likes are stored off-chain until claim.

### Claim Proofs (Pick Per Platform)

Since most users don't have email, we use **platform account control** as the identity anchor:

#### 1. Token Redemption (when DMs allow links)

Best for: dateme.directory (has contact info), manifold.love (can DM after like)

```
DM content: "Claim your Heaven profile: heaven.example/c/a8f3...
            If links don't work, go to heaven.example/claim and enter: NEO-7X9K2M"
```

- Generate `claim_token` (128-bit random)
- Store only `hash(token)` + expiry + sourceUrl
- Single-use, expires in 7 days
- One message completes the funnel (no follow-ups needed)

#### 2. Profile Edit Proof (when DMs unreliable or links blocked)

Best for: cuties.dating, any platform where we can scrape profiles

```
Site shows: "Add NEO-7X9K2M to your [platform] bio, then click Verify"
            User edits their public profile
            Our backend re-scrapes, finds code
            Claim proceeds
```

- Most robust "no-email" method
- Platform-agnostic
- User removes code after verification

**Implementation Details (to reduce false positives)**:

```typescript
interface BioEditVerification {
  // Which fields to check (platform-specific)
  fieldsToCheck: ('bio' | 'tagline' | 'prompt_answer' | 'about_me')[]

  // Exact pattern to match (with checksum for typo detection)
  pattern: /NEO-[A-Z0-9]{6}/  // e.g., NEO-7X9K2M

  // Time window for active verification session (platforms cache aggressively)
  // Note: Code validity is 7 days, but once user clicks "Verify", we scrape within 15 min
  verificationWindowMinutes: 15

  // Cache busting (fetch multiple times)
  fetchAttempts: 3
  delayBetweenFetchesMs: 2000

  // Record for auditability
  verificationSnapshot: {
    timestamp: number
    htmlHash: string       // sha256 of fetched HTML
    matchedField: string   // Which field contained the code
    matchedValue: string   // The exact matched text
  }
}

async function verifyBioEditProof(attemptId: string): Promise<{
  verified: boolean
  shadowProfileId?: string
  snapshot?: VerificationSnapshot
  error?: string
}> {
  // ATOMIC: Check unused + mark used in single transaction to prevent race conditions
  const attempt = await db.transaction(async (tx) => {
    const [attempt] = await tx.select().from(claim_attempts)
      .where(eq(claim_attempts.id, attemptId))
      .for('update')  // Row lock

    if (!attempt) return null
    if (attempt.used) return { ...attempt, _alreadyUsed: true }

    // Don't mark used yet - only on successful verification
    return attempt
  })

  if (!attempt) {
    return { verified: false, error: 'Invalid attempt ID' }
  }
  if ((attempt as any)._alreadyUsed) {
    return { verified: false, error: 'This claim attempt has already been used' }
  }

  const anchor = await getClaimAnchor(attempt.anchor_id)
  const now = Date.now()

  // 1. Check if code still valid (7 days)
  if (now > attempt.expires_at) {
    return { verified: false, error: 'Claim code expired (7 days)' }
  }

  // 2. Verify pre-scrape state exists (for audit - security comes from attempt-bound code)
  if (!attempt.pre_html_hash || !attempt.pre_scraped_at) {
    return { verified: false, error: 'Invalid attempt: missing pre-scrape state' }
  }

  // 3. Check/start verification window (15 min from first verify click)
  if (!attempt.verify_window_started_at) {
    await db.update(claim_attempts)
      .set({ verify_window_started_at: now })
      .where(eq(claim_attempts.id, attempt.id))
  } else {
    const windowEnd = attempt.verify_window_started_at + (15 * 60 * 1000)
    if (now > windowEnd) {
      return { verified: false, error: 'Verification window expired (15 min). Click Verify again to restart.' }
    }
  }

  // 4. Derive the expected code (server-side, no DB lookup needed)
  const expectedCode = deriveHumanCode(attemptId, SERVER_SECRET)

  // 5. Fetch profile multiple times (cache busting)
  for (let i = 0; i < 3; i++) {
    const html = await fetchProfile(anchor.source_url, { noCache: true })
    const postHtmlHash = sha256(html)

    // 6. Check configured fields for the code
    for (const field of getFieldsForPlatform(anchor.platform)) {
      const fieldValue = extractField(html, field)
      if (fieldValue && fieldValue.includes(expectedCode)) {
        // ATOMIC: Mark used on success
        const updated = await db.update(claim_attempts)
          .set({ used: 1, used_at: now })
          .where(and(eq(claim_attempts.id, attempt.id), eq(claim_attempts.used, 0)))
          .returning()

        if (updated.length === 0) {
          return { verified: false, error: 'Race condition: attempt used by another request' }
        }

        // Redact PII: only store hash + excerpt around code
        const codeIndex = fieldValue.indexOf(expectedCode)
        const excerptStart = Math.max(0, codeIndex - 32)
        const excerptEnd = Math.min(fieldValue.length, codeIndex + expectedCode.length + 32)
        const matchedExcerpt = fieldValue.slice(excerptStart, excerptEnd)

        const snapshot: VerificationSnapshot = {
          method: 'bio_edit',
          attemptId,
          anchorId: anchor.id,
          verifiedAt: now,
          preHtmlHash: attempt.pre_html_hash,
          postHtmlHash,
          matchedField: field,
          matchedValueHash: sha256(fieldValue),
          matchedExcerpt  // Only ~64 chars around the code
        }
        await storeVerificationSnapshot(attemptId, snapshot)
        return { verified: true, shadowProfileId: attempt.shadow_profile_id, snapshot }
      }
    }

    await sleep(2000)  // Wait before retry
  }

  return { verified: false, error: 'Code not found in profile' }
}

// SECURITY: attemptId is a secret (used to derive bio-edit codes)
// Must be cryptographically random, ≥128 bits, and single-use
function generateAttemptId(): string {
  return crypto.randomBytes(16).toString('base64url')  // 128 bits
}

// Called when creating a bio_edit claim attempt - establishes pre-scrape state
async function createBioEditAttempt(shadowProfileId: string, anchorId: string): Promise<{
  attemptId: string
  displayCode: string
  error?: string
}> {
  const anchor = await getClaimAnchor(anchorId)

  // Pre-scrape: verify code is NOT already present (prevents replay)
  const html = await fetchProfile(anchor.source_url, { noCache: true })
  const preHtmlHash = sha256(html)
  const attemptId = generateAttemptId()
  const expectedCode = deriveHumanCode(attemptId, SERVER_SECRET)

  // Check that code is absent in pre-scrape
  for (const field of getFieldsForPlatform(anchor.platform)) {
    const fieldValue = extractField(html, field)
    if (fieldValue && fieldValue.includes(expectedCode)) {
      return { attemptId: '', displayCode: '', error: 'Code collision - try again' }
    }
  }

  // Store attempt with pre-scrape state (NO PII - only hashes)
  const allFields = extractAllFields(html, anchor.platform)
  const preFieldsHashes = Object.fromEntries(
    Object.entries(allFields).map(([k, v]) => [k, sha256(v as string)])
  )

  await db.insert(claim_attempts).values({
    id: attemptId,
    shadow_profile_id: shadowProfileId,
    anchor_id: anchorId,
    method: 'bio_edit',
    pre_html_hash: preHtmlHash,
    pre_scraped_at: Date.now(),
    pre_fields_json: JSON.stringify(preFieldsHashes),  // Hashes only, no plaintext
    expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000)  // 7 days
  })

  return { attemptId, displayCode: expectedCode }
}

// DM credential verification (token or human code)
// Looks up attempt by credential hash - no attemptId needed (matches /c/<token> UX)
async function verifyDmCredential(credential: string): Promise<{
  verified: boolean
  shadowProfileId?: string
  snapshot?: VerificationSnapshot
  error?: string
}> {
  const now = Date.now()

  // 1. Determine credential type based on format
  const isHumanCode = /^NEO-[A-Z0-9]{6}$/i.test(credential)
  const credentialType: 'token' | 'human_code' = isHumanCode ? 'human_code' : 'token'

  // 2. Compute hash and lookup attempt
  let attempt: ClaimAttempt | null = null
  if (credentialType === 'token') {
    const tokenHash = sha256(credential)
    attempt = await db.select().from(claim_attempts)
      .where(and(
        eq(claim_attempts.token_hash, tokenHash),
        eq(claim_attempts.method, 'dm'),
        eq(claim_attempts.used, 0),
        gt(claim_attempts.expires_at, now)
      ))
      .limit(1)
      .then(rows => rows[0] || null)
  } else {
    const codeHash = hmacSha256(SERVER_SECRET, credential.toUpperCase())
    attempt = await db.select().from(claim_attempts)
      .where(and(
        eq(claim_attempts.human_code_hash, codeHash),
        eq(claim_attempts.method, 'dm'),
        eq(claim_attempts.used, 0),
        gt(claim_attempts.expires_at, now)
      ))
      .limit(1)
      .then(rows => rows[0] || null)
  }

  // 3. Rate limiting for human codes (brute-force protection) - before revealing if attempt exists
  if (credentialType === 'human_code') {
    // Rate limit by IP only (we don't have anchor_id yet if attempt not found)
    const rateLimit = await checkGlobalRateLimit(getClientIp())
    if (rateLimit.locked) {
      return { verified: false, error: `Too many attempts. Locked until ${rateLimit.lockedUntil}` }
    }
    if (rateLimit.remaining <= 0) {
      return { verified: false, error: 'Rate limit exceeded. Try again in 1 hour.' }
    }
    await recordGlobalAttempt(getClientIp(), attempt !== null)
  }

  if (!attempt) {
    return { verified: false, error: 'Invalid or expired credential' }
  }

  // 4. ATOMIC: Mark used on success
  const updated = await db.update(claim_attempts)
    .set({ used: 1, used_at: now })
    .where(and(eq(claim_attempts.id, attempt.id), eq(claim_attempts.used, 0)))
    .returning()

  if (updated.length === 0) {
    return { verified: false, error: 'Credential already used' }
  }

  // 5. Success - store snapshot with credential type
  const snapshot: VerificationSnapshot = {
    method: 'dm',
    attemptId: attempt.id,
    anchorId: attempt.anchor_id,
    verifiedAt: now,
    credentialType
  }
  await storeVerificationSnapshot(attempt.id, snapshot)

  return { verified: true, shadowProfileId: attempt.shadow_profile_id, snapshot }
}
```

#### 3. Reply Nonce (when we can read DM replies)

Best for: platforms with bidirectional messaging

```
We DM: "Reply with this code to claim: 7X9K2M"
User replies: "7X9K2M"
We verify: nonce matches + sender ID == anchor.platform_user_id
```

- Only works if we can programmatically read replies
- Fallback when profile can't be edited
- Nonce derived from attemptId (like bio-edit code)

```typescript
// Derive reply nonce from attemptId (same pattern as bio-edit code)
function deriveReplyNonce(attemptId: string, serverSecret: string): string {
  const hash = hmacSha256(serverSecret, `reply_nonce:${attemptId}`)
  const chars = '23456789'  // Short numeric for easy typing
  let nonce = ''
  for (let i = 0; i < 6; i++) {
    nonce += chars[hash[i] % chars.length]
  }
  return nonce  // e.g., "742983"
}

// Called when creating a reply_nonce claim attempt
async function createReplyNonceAttempt(shadowProfileId: string, anchorId: string): Promise<{
  attemptId: string
  displayNonce: string
  error?: string
}> {
  const anchor = await getClaimAnchor(anchorId)

  if (!anchor.platform_user_id) {
    return { attemptId: '', displayNonce: '', error: 'Platform user ID required for reply-nonce' }
  }

  const attemptId = generateAttemptId()
  const displayNonce = deriveReplyNonce(attemptId, SERVER_SECRET)

  await db.insert(claim_attempts).values({
    id: attemptId,
    shadow_profile_id: shadowProfileId,
    anchor_id: anchorId,
    method: 'reply_nonce',
    expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000)  // 7 days
  })

  return { attemptId, displayNonce }
}

// Verify reply-nonce: called when we receive a DM reply (webhook/polling)
async function verifyReplyNonce(attemptId: string): Promise<{
  verified: boolean
  shadowProfileId?: string
  snapshot?: VerificationSnapshot
  error?: string
}> {
  const attempt = await getClaimAttempt(attemptId)
  if (!attempt || attempt.method !== 'reply_nonce') {
    return { verified: false, error: 'Invalid attempt' }
  }
  if (attempt.used) {
    return { verified: false, error: 'This claim attempt has already been used' }
  }

  const now = Date.now()
  if (now > attempt.expires_at) {
    return { verified: false, error: 'Claim nonce expired (7 days)' }
  }

  // Check if we've received a reply
  if (!attempt.reply_received_at) {
    return { verified: false, error: 'No reply received yet' }
  }

  // The reply data is stored by the webhook/polling handler
  // It already verified: nonce matches + sender == anchor.platform_user_id
  // (Webhook handler sets reply_received_at only on valid reply)

  // ATOMIC: Mark used on success
  const updated = await db.update(claim_attempts)
    .set({ used: 1, used_at: now })
    .where(and(eq(claim_attempts.id, attempt.id), eq(claim_attempts.used, 0)))
    .returning()

  if (updated.length === 0) {
    return { verified: false, error: 'Race condition: attempt used by another request' }
  }

  const anchor = await getClaimAnchor(attempt.anchor_id)
  const snapshot: VerificationSnapshot = {
    method: 'reply_nonce',
    attemptId,
    anchorId: attempt.anchor_id,
    verifiedAt: now,
    senderPlatformIdHash: sha256(anchor.platform_user_id || ''),
    replyReceivedAt: attempt.reply_received_at
  }
  await storeVerificationSnapshot(attemptId, snapshot)

  return { verified: true, shadowProfileId: attempt.shadow_profile_id, snapshot }
}

// Webhook handler: called when we receive a DM reply
async function handleReplyWebhook(
  senderPlatformId: string,
  replyText: string,
  platform: string
): Promise<void> {
  // Find active reply_nonce attempts for this platform user
  const anchors = await db.select().from(claim_anchors)
    .where(and(
      eq(claim_anchors.platform_user_id, senderPlatformId),
      eq(claim_anchors.platform, platform)
    ))

  for (const anchor of anchors) {
    const attempts = await db.select().from(claim_attempts)
      .where(and(
        eq(claim_attempts.anchor_id, anchor.id),
        eq(claim_attempts.method, 'reply_nonce'),
        eq(claim_attempts.used, 0),
        gt(claim_attempts.expires_at, Date.now())
      ))

    for (const attempt of attempts) {
      const expectedNonce = deriveReplyNonce(attempt.id, SERVER_SECRET)
      if (replyText.includes(expectedNonce)) {
        // Valid reply - mark received
        await db.update(claim_attempts)
          .set({ reply_received_at: Date.now() })
          .where(eq(claim_attempts.id, attempt.id))
        return
      }
    }
  }
}
```

### Claim Anchor as First-Class Primitive

**ClaimAnchor is the identity primitive.** A person may appear on multiple platforms. We require proof of **one anchor** before adding passkey to the PKP.

```typescript
// ClaimAnchor = proof that someone controls a platform account
interface ClaimAnchor {
  id: string
  platform: 'dateme' | 'acx' | 'cuties' | 'manifold'
  sourceUrl: string                    // Original profile URL
  platformUserId?: string              // Platform-specific ID if available
  allowedProofs: ('bio_edit' | 'dm' | 'reply_nonce')[]
  lastScraped: Date
  verified: boolean                    // True after successful proof
  verifiedAt?: Date
}

interface ShadowProfile {
  id: string

  // PKP identity (NULL until claim initiated - lazy mint)
  pkpTokenId?: string                  // Lit PKP NFT token ID (nullable)
  pkpAddress?: string                  // PKP eth address 0x... (nullable)

  // Directory tier state machine
  directoryTier: 'shadow' | 'handoff' | 'claimed' | 'verified'

  // Display (all derived, no PII)
  pseudonym: string                    // Generated, not real name
  animeAvatarUrl: string               // Generated from photos
  bio: string                          // Sanitized excerpt
  age?: number
  location?: string

  // Tier transition timestamps
  handoffAt?: Date                     // WebAuthn added
  claimedAt?: Date                     // Admin auth removed
  verifiedAt?: Date                    // Self.xyz + VPN verified

  // Claim anchors
  claimAnchors: ClaimAnchor[]          // All known source profiles
}
```

### Claim Proof Priority Order

1. **Profile-edit proof** (most robust) - user adds `NEO-XXXX` to public bio; we re-fetch and verify
2. **DM token/code** (scarce DM) - one message includes link + fallback code + profile-edit instructions
3. **Reply nonce** (only if we can reliably read replies)

### Core Claim Interface

```typescript
// Derivable codes: server can regenerate without storing plaintext
// This allows bio_edit verification to search HTML for the expected code
function deriveHumanCode(attemptId: string, serverSecret: string): string {
  const hash = hmacSha256(serverSecret, `bio_edit:${attemptId}`)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  // No ambiguous chars
  let code = 'NEO-'
  for (let i = 0; i < 6; i++) {
    code += chars[hash[i] % chars.length]
  }
  return code  // e.g., "NEO-7X9K2M"
}

// Client-submitted evidence (minimal - server does the heavy lifting)
type ClaimRequest =
  | {
      method: 'bio_edit'
      attemptId: string           // Server derives code from attemptId
      // Client just says "I added the code, please verify"
      // Server re-derives code, fetches profile, searches for it
    }
  | {
      method: 'dm'
      credential: string          // The full token OR the human code
      // NO attemptId needed - server looks up by hash:
      //   sha256(token) → find attempt with matching token_hash
      //   hmac(SECRET, code) → find attempt with matching human_code_hash
      // This matches real UX: /c/<token> → lookup by token_hash
    }
  | {
      method: 'reply_nonce'
      attemptId: string           // Server derives nonce, checks stored reply
      // Nonce = deriveNonce(attemptId, SERVER_SECRET)
      // Verification: reply text contains nonce + sender matches anchor.platform_user_id
    }

// Server-generated verification result (stored for audit)
// IMPORTANT: No PII stored - only hashes and minimal excerpts
interface VerificationSnapshot {
  method: 'bio_edit' | 'dm' | 'reply_nonce'
  attemptId: string
  anchorId: string
  verifiedAt: number

  // bio_edit specific (server-generated, NOT client-supplied)
  // NO raw bio text - only hashes and redacted excerpts
  preHtmlHash?: string           // Hash at attempt creation (for audit)
  postHtmlHash?: string          // Hash at verification (code present)
  matchedField?: string          // Which field contained the code (bio, tagline, etc.)
  matchedValueHash?: string      // sha256(fieldValue) - NO plaintext
  matchedExcerpt?: string        // ~64 chars around code only (redacted context)

  // dm specific
  credentialType?: 'token' | 'human_code'

  // reply_nonce specific
  senderPlatformIdHash?: string  // sha256(platformId) - NO plaintext
  replyReceivedAt?: number
}

// Single entry point for all claim verification
async function verifyAnchorProof(request: ClaimRequest): Promise<{
  verified: boolean
  shadowProfileId?: string
  snapshot?: VerificationSnapshot
  error?: string
}> {
  switch (request.method) {
    case 'bio_edit':
      // Server derives code, fetches profile, searches for it
      return verifyBioEditProof(request.attemptId)
    case 'dm':
      // Lookup attempt by credential hash, verify, apply rate limits
      return verifyDmCredential(request.credential)
    case 'reply_nonce':
      // Derive nonce, check stored reply matches + sender ID
      return verifyReplyNonce(request.attemptId)
  }
}

// After verification succeeds:
// 1. Mint PKP with admin auth (if not already minted)
// 2. User creates passkey, add WebAuthn to PKP
// 3. User removes admin auth method → tier = 'claimed'
// 4. Promote to tier = 'verified' (after Self.xyz + VPN)
```

### PKP Ownership Model (Aligned with Directory Tiers)

```
TIER: shadow (no PKP yet)
┌─────────────────────────────────────────────────────────────────┐
│  No PKP minted                                                  │
│  Profile exists only in D1 database                             │
│  Likes stored in likes table (to_type='shadow', off-chain)      │
│                                                                 │
│  Can: appear in feed, receive likes (off-chain)                 │
│  Cannot: anything requiring on-chain identity                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    User initiates claim → create claim_attempt (NO PKP)
                              ↓
                    verifyAnchorProof() succeeds
                              ↓
                    MINT PKP with admin auth
                    User creates passkey → add WebAuthn to PKP
                              ↓
TIER: handoff (PKP exists, admin + user both have access)
┌─────────────────────────────────────────────────────────────────┐
│  PKP minted with:                                               │
│    1. Admin ECDSA (our backend)                                 │
│    2. WebAuthn (user's passkey) ← just added                    │
│                                                                 │
│  Lit Action Policy (recommended):                               │
│    - Constrain admin signing to: Directory writes, EFP ops      │
│    - Reduces blast radius during handoff window                 │
│                                                                 │
│  Can: complete onboarding (Self.xyz, VPN setup)                 │
│  Cannot: like/message (not verified yet)                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    User removes admin auth method
                              ↓
TIER: claimed (user owns PKP, admin removed)
┌─────────────────────────────────────────────────────────────────┐
│  PKP owned by user:                                             │
│    1. WebAuthn (user's passkey)                                 │
│                                                                 │
│  Admin auth: REMOVED (cryptographically owned)                  │
│                                                                 │
│  Can: own identity, browse verified profiles                    │
│  Cannot: like/message (need Self.xyz + VPN)                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Self.xyz verified + VPN active
                              ↓
TIER: verified (full access)
┌─────────────────────────────────────────────────────────────────┐
│  PKP owned + identity verified:                                 │
│    1. WebAuthn (user's passkey)                                 │
│    + Self.xyz attestation (age, sex, nationality)               │
│    + VPN active (DNS data flowing)                              │
│                                                                 │
│  Can: everything (like, message, FHE prefs, DNS matching)       │
└─────────────────────────────────────────────────────────────────┘
```

### Lit Protocol Integration Notes

**Add/Remove Auth Methods**: Use Lit's contracts SDK to add WebAuthn, then user removes admin auth.
See: https://developer.litprotocol.com/user-wallets/pkps/advanced-topics/auth-methods/add-remove-auth-methods

**Session Signatures**: Generate on-demand, do NOT cache session sigs.
See: https://developer.litprotocol.com/sdk/authentication/session-sigs/intro

**Lit Action Policy (optional but recommended)**: Even while admin-controlled, constrain PKP signing to specific actions/call-data using Lit Actions. This reduces blast radius.
See: https://developer.litprotocol.com/user-wallets/pkps/advanced-topics/auth-methods/custom-auth

### Outreach Strategy (DM Scarcity)

Manifold.love: 1 DM/day after liking once. Cuties: unclear. Dateme: email/contact varies.

**Principles:**
1. **One message must complete the funnel** - no "reply YES" flows
2. **Include fallback** - link + human code + bio-edit instructions
3. **Trigger on value** - DM when they receive a like (higher conversion)
4. **Passive discovery** - "Is this you?" page works without any DM

**DM Template:**
```
Hey! Someone created a profile for you on Heaven based on your
public dating doc. You can claim it here: heaven.example/c/[token]

If that link doesn't work:
1. Go to heaven.example/claim
2. Enter code: NEO-[code]

Or add "NEO-[code]" to your [platform] bio and we'll verify automatically.

Questions? [support link]
```

### Avatar Generation Pipeline

Using fal.ai Nano Banana Pro:

```
1. Download source photos (already done: 2,825 in photos/)
2. For each profile:
   a. Pick best photo (face detection + quality score)
   b. POST to fal.ai/nano-banana-pro with anime style prompt
   c. Store result in R2/CDN
   d. DELETE source photo (keep only perceptual hash for dedup)
3. Never store or display original photos
```

### Safety Valves

| Risk | Mitigation |
|------|------------|
| Wrong person claims | Bio-edit proof requires platform account control |
| Claim token leak | Hash-only storage, 7-day expiry, single-use |
| Spam/abuse | Rate limit claims by IP + device fingerprint |
| "Not me" | Hard-delete shadow profile, add to blocklist |
| Stale data | Re-scrape before claim to verify still public |

### Token Security

**Problem**: Short human codes (e.g., `NEO-7X9K2M`) are low-entropy and brute-forceable offline if DB leaks.

**Solution**: Use HMAC for human codes, sha256 for high-entropy tokens:

```typescript
// High-entropy claim token (128-bit): sha256 is fine
const claimToken = crypto.randomBytes(16).toString('base64url')  // ~128 bits
const tokenHash = sha256(claimToken)  // Store this

// Low-entropy human code (6-8 chars): use HMAC to prevent offline guessing
const humanCode = generateHumanCode()  // e.g., "NEO-7X9K2M" (~40 bits)
const codeHash = hmacSha256(SERVER_SECRET, humanCode)  // Store this
// If SERVER_SECRET doesn't leak, attacker can't brute-force offline
```

**Additional controls**:
- Human codes expire in 7 days (same as link tokens) - HMAC prevents offline brute-force
- Rate limit: 5 attempts per anchor per hour per IP
- Lockout: 10 failed attempts → 24h lockout for that anchor
- With HMAC + rate limiting, even low-entropy codes are safe for 7-day windows

### Abuse Controls for Claim Attempts

```sql
-- Track failed claim attempts for rate limiting
CREATE TABLE claim_rate_limits (
  id TEXT PRIMARY KEY,
  anchor_id TEXT NOT NULL REFERENCES claim_anchors(id),

  -- Rate limit keys (store hashes, not raw values)
  ip_hash TEXT NOT NULL,
  device_hash TEXT,

  -- Counters
  attempt_count INTEGER DEFAULT 0,
  last_attempt_at INTEGER,
  locked_until INTEGER,  -- NULL = not locked

  created_at INTEGER DEFAULT (unixepoch()),

  UNIQUE(anchor_id, ip_hash)
);

CREATE INDEX idx_rate_limits_anchor ON claim_rate_limits(anchor_id);
CREATE INDEX idx_rate_limits_locked ON claim_rate_limits(locked_until);
```

---

## Database Schema (Cloudflare D1)

```sql
-- Shadow profiles (lazy PKP minting)
CREATE TABLE shadow_profiles (
  id TEXT PRIMARY KEY,

  -- PKP identity (NULL until claim initiated - lazy mint)
  pkp_token_id TEXT,      -- Lit PKP NFT token ID (nullable)
  pkp_address TEXT,       -- PKP eth address 0x... (nullable)

  -- Display (all derived, no PII)
  pseudonym TEXT NOT NULL,
  anime_avatar_url TEXT,
  bio TEXT,
  age INTEGER,
  location TEXT,

  -- Directory tier: 'shadow' | 'handoff' | 'claimed' | 'verified'
  directory_tier TEXT DEFAULT 'shadow' CHECK(
    directory_tier IN ('shadow', 'handoff', 'claimed', 'verified')
  ),

  -- Tier transition timestamps
  handoff_at INTEGER,     -- WebAuthn added to PKP
  claimed_at INTEGER,     -- Admin auth removed from PKP
  verified_at INTEGER,    -- Self.xyz + VPN verified

  -- Verification state
  self_xyz_verified INTEGER DEFAULT 0,
  self_xyz_verified_at INTEGER,
  vpn_verified INTEGER DEFAULT 0,
  vpn_verified_at INTEGER,

  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Claim anchors (first-class identity primitive)
-- One verified anchor required before PKP handoff
CREATE TABLE claim_anchors (
  id TEXT PRIMARY KEY,
  shadow_profile_id TEXT NOT NULL REFERENCES shadow_profiles(id),

  platform TEXT NOT NULL,  -- 'dateme', 'acx', 'cuties', 'manifold'
  source_url TEXT NOT NULL UNIQUE,
  platform_user_id TEXT,
  allowed_proofs TEXT NOT NULL,  -- JSON array: ['bio_edit', 'dm', 'reply_nonce']

  -- Verification state
  verified INTEGER DEFAULT 0,
  verified_at INTEGER,
  verified_method TEXT,  -- Which proof method succeeded
  verification_snapshot TEXT,  -- JSON: {timestamp, html_hash, matched_field}

  last_scraped INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Active claim attempts
-- SECURITY: attemptId is cryptographically random (≥128 bits) and single-use
-- For bio_edit: code is derived from attemptId, so attemptId must stay secret
CREATE TABLE claim_attempts (
  id TEXT PRIMARY KEY,            -- Cryptographically random, ≥128 bits
  shadow_profile_id TEXT NOT NULL REFERENCES shadow_profiles(id),
  anchor_id TEXT NOT NULL REFERENCES claim_anchors(id),

  method TEXT NOT NULL,           -- 'bio_edit', 'dm', 'reply_nonce'

  -- DM method: token OR human code hash (exactly one)
  token_hash TEXT,                -- sha256(claim_token) for high-entropy link tokens
  human_code_hash TEXT,           -- hmac(SERVER_SECRET, code) for short human codes

  -- Bio-edit method: pre-scrape state for audit (security from attempt-bound code)
  -- Note: pre-scrape is for audit/diagnostics, not security (code is per-attempt)
  pre_html_hash TEXT,             -- sha256 of HTML at attempt creation
  pre_scraped_at INTEGER,         -- Timestamp of pre-scrape
  pre_fields_json TEXT,           -- JSON of field hashes (NO plaintext PII)

  -- Reply-nonce method: nonce is derived from attemptId like bio_edit
  -- Verification requires senderPlatformId == anchor.platform_user_id
  reply_received_at INTEGER,      -- When we received the reply (from polling/webhook)

  -- Expiry timestamps
  expires_at INTEGER NOT NULL,           -- Token/code validity: 7 days
  verify_window_started_at INTEGER,      -- Set when user clicks "Verify" (bio_edit)

  used INTEGER DEFAULT 0,
  used_at INTEGER,

  created_at INTEGER DEFAULT (unixepoch()),

  -- Method→field invariants (all methods)
  CHECK(
    -- dm: exactly one of token_hash OR human_code_hash
    (method = 'dm' AND (
      (token_hash IS NOT NULL AND human_code_hash IS NULL) OR
      (token_hash IS NULL AND human_code_hash IS NOT NULL)
    ) AND pre_html_hash IS NULL AND pre_scraped_at IS NULL) OR

    -- bio_edit: pre-scrape fields required, no token hashes
    (method = 'bio_edit' AND
      token_hash IS NULL AND human_code_hash IS NULL AND
      pre_html_hash IS NOT NULL AND pre_scraped_at IS NOT NULL) OR

    -- reply_nonce: no token hashes, no pre-scrape (nonce derived from attemptId)
    (method = 'reply_nonce' AND
      token_hash IS NULL AND human_code_hash IS NULL AND
      pre_html_hash IS NULL AND pre_scraped_at IS NULL)
  )
);

-- Enforce: at most 1 active (unused, unexpired) attempt per anchor+method
CREATE UNIQUE INDEX idx_active_attempt_per_anchor_method
  ON claim_attempts(anchor_id, method)
  WHERE used = 0 AND expires_at > unixepoch();

-- Unified likes table (handles both shadow and PKP targets)
CREATE TABLE likes (
  id TEXT PRIMARY KEY,
  from_pkp_address TEXT NOT NULL,  -- Liker's PKP address (must be 'verified' tier)

  -- Target can be shadow profile OR PKP address (one must be set)
  to_type TEXT NOT NULL CHECK(to_type IN ('shadow', 'pkp')),
  to_shadow_profile_id TEXT REFERENCES shadow_profiles(id),
  to_pkp_address TEXT,
  CHECK(
    (to_type = 'shadow' AND to_shadow_profile_id IS NOT NULL AND to_pkp_address IS NULL) OR
    (to_type = 'pkp' AND to_pkp_address IS NOT NULL AND to_shadow_profile_id IS NULL)
  ),

  created_at INTEGER DEFAULT (unixepoch()),

  -- For shadow targets: migration state (DO NOT auto-migrate - requires opt-in)
  -- visible_to_recipient: Liker explicitly chose to reveal after claim
  -- migrated: Actually written on-chain (only for shadow→claimed transitions)
  visible_to_recipient INTEGER DEFAULT 0,  -- Liker must opt-in to reveal
  migrated INTEGER DEFAULT 0,              -- For shadow targets only
  migrated_at INTEGER,

  -- For PKP targets: may be cached from on-chain EFP data
  -- is_efp_synced: True if this like is also recorded in EFP on-chain
  is_efp_synced INTEGER DEFAULT 0,

  UNIQUE(from_pkp_address, to_shadow_profile_id),
  UNIQUE(from_pkp_address, to_pkp_address)
);

CREATE INDEX idx_likes_from ON likes(from_pkp_address);
CREATE INDEX idx_likes_to_shadow ON likes(to_shadow_profile_id) WHERE to_type = 'shadow';
CREATE INDEX idx_likes_to_pkp ON likes(to_pkp_address) WHERE to_type = 'pkp';

-- Pending likes migration: OPT-IN, not automatic
-- Problem: Auto-revealing who liked before claim is privacy-leaking
-- Solution: When shadow profile claims, notify likers that profile is now active
--           Liker can then choose to "reveal" their like (set visible_to_recipient=1)
--           Only visible_to_recipient=1 likes appear in recipient's "who liked me"
-- UX: "Sarah claimed their profile! Tap to reveal your like."

-- Block profiles from being shown (user said "not me")
CREATE TABLE blocklist (
  source_url TEXT PRIMARY KEY,
  reason TEXT,
  reported_by_hash TEXT,  -- sha256(IP or device fingerprint)
  created_at INTEGER DEFAULT (unixepoch())
);

-- Indexes
CREATE INDEX idx_shadow_profiles_tier ON shadow_profiles(directory_tier);
CREATE INDEX idx_claim_anchors_profile ON claim_anchors(shadow_profile_id);
CREATE INDEX idx_claim_anchors_platform ON claim_anchors(platform);
CREATE INDEX idx_claim_attempts_profile ON claim_attempts(shadow_profile_id);
CREATE INDEX idx_claim_attempts_expires ON claim_attempts(expires_at);
-- (likes indexes defined with CREATE TABLE likes above)
```

### Directory Tier Transitions

```
shadow_profiles.directory_tier state machine:

  'shadow'   → verifyAnchorProof() + WebAuthn added    → 'handoff'
  'handoff'  → PKP auth-method removal event observed  → 'claimed'
  'claimed'  → self_xyz_verified + vpn_verified        → 'verified'

State transition triggers:
  shadow  → handoff:  User proves anchor + creates passkey, we add WebAuthn to PKP
  handoff → claimed:  Backend observes admin auth removed from PKP (via Lit event/polling)
                      Sets directory_tier='claimed', claimed_at=now()
  claimed → verified: User completes Self.xyz + VPN setup
```

### Query Patterns

```sql
-- Feed query (what a verified user sees)
-- Verified users see: shadow + claimed + verified (all except handoff)
-- Uses DISTINCT to avoid duplicates from multiple claim_anchors per profile
-- Excludes: already-liked profiles, blocklisted source URLs
SELECT DISTINCT sp.* FROM shadow_profiles sp
WHERE sp.directory_tier IN ('shadow', 'claimed', 'verified')
  -- Exclude profiles the viewer already liked (shadow or PKP target)
  AND NOT EXISTS (
    SELECT 1 FROM likes l
    WHERE l.from_pkp_address = ?  -- viewer's PKP address
      AND (l.to_shadow_profile_id = sp.id OR l.to_pkp_address = sp.pkp_address)
  )
  -- Exclude blocklisted profiles (check all their source URLs)
  AND NOT EXISTS (
    SELECT 1 FROM claim_anchors ca
    JOIN blocklist b ON b.source_url = ca.source_url
    WHERE ca.shadow_profile_id = sp.id
  );

-- Feed query (what a claimed user sees)
-- Claimed users see: verified only
SELECT sp.* FROM shadow_profiles sp
WHERE sp.directory_tier = 'verified'
  AND NOT EXISTS (
    SELECT 1 FROM likes l
    WHERE l.from_pkp_address = ?
      AND (l.to_shadow_profile_id = sp.id OR l.to_pkp_address = sp.pkp_address)
  );

-- Can this profile like others? (must be verified tier)
SELECT directory_tier = 'verified' AS can_like FROM shadow_profiles WHERE id = ?;

-- Can these two profiles message?
-- Both must be verified + have a mutual PKP-to-PKP match (not shadow likes)
SELECT
  a.directory_tier = 'verified' AND b.directory_tier = 'verified'
  AND a.pkp_address IS NOT NULL AND b.pkp_address IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM likes l1
    JOIN likes l2 ON l1.from_pkp_address = l2.to_pkp_address
                 AND l1.to_pkp_address = l2.from_pkp_address
    WHERE l1.from_pkp_address = a.pkp_address
      AND l1.to_pkp_address = b.pkp_address
      AND l1.to_type = 'pkp'  -- Must be PKP-to-PKP like, not shadow
      AND l2.to_type = 'pkp'
  )
AS can_message
FROM shadow_profiles a, shadow_profiles b WHERE a.id = ? AND b.id = ?;
```

---

## Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. PKP Authentication                                          │
│     └── Create or connect Lit PKP via passkey                   │
├─────────────────────────────────────────────────────────────────┤
│  2. Username                                                     │
│     └── Choose unique handle                                     │
├─────────────────────────────────────────────────────────────────┤
│  3. Photos → Anime                                               │
│     └── Upload photos, generate anime avatar                     │
├─────────────────────────────────────────────────────────────────┤
│  4. Self.xyz Verification                                        │
│     └── Scan passport for age, sex, nationality                  │
├─────────────────────────────────────────────────────────────────┤
│  5. DNS VPN Setup                                                │
│     └── Install VPN client, verify connection                    │
│     └── Site checks VPN status before allowing likes             │
├─────────────────────────────────────────────────────────────────┤
│  6. Directory Registration                                       │
│     └── Write public profile to Directory.sol                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## DNS VPN Architecture

### Server Stack (144.126.205.242)

```
┌─────────────────────────────────────────────────┐
│ hp-wireguard (linuxserver/wireguard)            │
│   Port 51820/udp (WireGuard)                    │
│   wg0 interface: 10.13.13.1                     │
│   Subnet: 10.13.13.0/24                         │
├─────────────────────────────────────────────────┤
│ dns-server (network_mode: service:wireguard)    │
│   DNS on 0.0.0.0:53                             │
│   API on 0.0.0.0:8080                           │
│   SIWE + JWT auth                               │
│   WireGuard peer provisioning                   │
└─────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────┐
│ hp-resolver (handshake-volume-resolver)         │
│   ICANN + Handshake + .eth DNS                  │
└─────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────┐
│ Tinybird                                         │
│   dns_events datasource                          │
│   user_category_daily_mv materialized view       │
└─────────────────────────────────────────────────┘
```

### VPN Client Platforms

| Platform | Implementation | Config |
|----------|----------------|--------|
| **Android** | Kotlin + WireGuard GoBackend | `DNS=10.13.13.1` |
| **Desktop (Linux/Mac/Windows)** | Tauri + Rust + wg-quick | PostUp/PreDown scripts |
| **iOS** | Swift + NetworkExtension | TBD |

### VPN Status Check

Site must verify DNS VPN is active before allowing directory registration or likes:

```typescript
async function checkVpnStatus(): Promise<boolean> {
  // Option 1: Query our DNS server for a canary domain
  // Option 2: Call API endpoint that checks if request comes from VPN subnet
  const response = await fetch('https://api.heaven.example/vpn-status')
  return response.json().connected
}
```

---

## Smart Contracts

### Dating Contracts (contracts/dating/)

| Contract | Purpose |
|----------|---------|
| **Dating.sol** | FHE matching with encrypted preferences |
| **Directory.sol** | Public profile data (avatar, region) |
| **PartnerLink.sol** | Public mutual partner badge |

### Name Registry (contracts/name-registry/)

ENS subname registry for `*.heaven.eth` identities.

**Sepolia Testnet:**

| Contract | Address |
|----------|---------|
| SubnameRegistrar | `0x98415bb59d5b4cF994aAAFFb0Ba4dBF16A72dedB` |
| Records | `0xb6B1A8F7AE2f55C1dD1f4AC5Be7C0eEA63B54129` |
| Resolver | `0x7509DcA660b572Ee41Be08f73CB8f3908437858B` |

See [contracts/name-registry/CLAUDE.md](contracts/name-registry/CLAUDE.md) for details.

### Privacy Model

| Category | Storage | On Match |
|----------|---------|----------|
| **Public** | Directory (plaintext) | Visible |
| **Secret Criteria** | DatingV2 (encrypted, revealFlag=1) | "We matched on X" |
| **Secret Dealbreakers** | DatingV2 (encrypted, revealFlag=0) | Never revealed |

---

## Matching Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Candidate Selection (WHO you see)                           │
│                                                                 │
│     if (wallet has DNS data from VPN) {                         │
│         candidates = generateFromDNSBehavior(wallet)            │
│     } else {                                                    │
│         candidates = generateFromDirectory(wallet)              │
│     }                                                           │
│                                                                 │
│     Output: Merkle root of candidates per user/day              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. Compatibility Check (IF you match)                          │
│     On-chain FHE in DatingV2                                    │
│     Encrypted preferences + dealbreakers                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. Overlap Reveal (WHY you matched)                            │
│     ACL-scoped to matched pair only                             │
│     Only for CRITERIA, never dealbreakers                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Messaging Architecture

### XMTP Integration

- E2E encrypted messaging between matches
- Cannot message until mutual like (match)
- Conversations stored client-side

### AI Companion

- Permanently stickied at top of Messages
- Powered by LLM with access to user's DNS patterns
- Provides insights about browsing behavior
- Uses Tinybird analytics endpoints: `trends`, `vector`, `context`

---

## EFP Integration

### Following = Liking

Use EFP (Ethereum Follow Protocol) for the social graph:

```typescript
// Follow = express interest
await efp.follow(targetAddress, { tag: 'romantic-interest' })

// Mutual follow = match
const mutualFollow = await efp.isMutualFollow(userA, userB)
```

### API Endpoints

- `GET /users/{address}/followers` - who's interested in me
- `GET /users/{address}/following` - who I'm interested in
- `POST /lists/buttonState` - get follow state between two users

---

## Key Technologies

| Category | Technology |
|----------|------------|
| **Frontend** | SolidJS, Tailwind CSS v4, Kobalte |
| **Desktop** | Tauri (Rust backend) |
| **Android** | Kotlin, WireGuard GoBackend |
| **Backend** | Cloudflare Workers, Rust (DNS) |
| **Auth** | Lit Protocol PKP + WebAuthn (passkeys) |
| **Messaging** | XMTP |
| **Social Graph** | EFP (Ethereum Follow Protocol) |
| **Identity** | Self.xyz (passport verification) |
| **Matching** | Zama fhEVM (FHE) |
| **Analytics** | Tinybird (DNS patterns) |
| **DNS** | Handshake + ICANN + .eth |

---

## Integration Details

### 1. Spotify Integration

**Goal**: Derive a taste vector for matching, discard raw history.

**Scopes needed**:
- `user-top-read` (top artists/tracks) - primary
- `user-read-recently-played` (optional, for recency weighting)

See: https://developer.spotify.com/documentation/web-api/concepts/scopes

**Implementation**:
```typescript
// Fetch top artists, compute embedding, discard raw data
const topArtists = await spotify.getMyTopArtists({ limit: 50 })
const tasteVector = computeEmbedding(topArtists)  // Store this
// Do NOT store artist names or listening history
```

**Rate limits**: Spotify enforces rolling window limits, expect 429s. Implement exponential backoff.
See: https://developer.spotify.com/documentation/web-api/concepts/rate-limits

---

### 2. HNS Profile Access

**Start with gateway UX**, not native resolution:

```
https://hns.to/alice.heaven  → works in normal browsers
```

See: https://kb.porkbun.com/article/211-what-is-a-handshake-tld-and-how-to-resolve-them

Later: ship resolver/extension for "real" HNS browsing (already supported by dns-server via hp-resolver).

---

### 3. XMTP Message Gating

**Important**: This is a UX contract, not network enforcement. XMTP is permissionless - anyone can send a message to any address at the protocol level.

**What we control (app behavior)**:
- Main inbox shows ONLY `allowed` conversations (mutual matches)
- Message requests from non-matches are quarantined or hidden entirely
- User never sees unsolicited messages unless they explicitly check requests

**What we don't control (protocol level)**:
- Anyone can still send an XMTP message to a PKP address
- Messages exist on the network even if we don't display them
- Other XMTP clients could show all messages

**Implementation**:

```typescript
// On match creation, update consent for both parties
async function onMatch(userA: string, userB: string) {
  const clientA = await getXmtpClient(userA)
  const clientB = await getXmtpClient(userB)

  // Set consent to 'allowed' for the match
  await clientA.contacts.allow([userB])
  await clientB.contacts.allow([userA])
}

// When loading inbox, filter by consent
async function getVisibleConversations(user: string) {
  const client = await getXmtpClient(user)
  const conversations = await client.conversations.list()

  // Only show allowed (matched) conversations
  return conversations.filter(c =>
    client.contacts.isAllowed(c.peerAddress)
  )
}
```

See: https://docs.xmtp.org/chat-apps/user-consent/user-consent

**Identity linking**: XMTP supports linking multiple identities to a single inbox ID (useful if adding identities beyond PKP later).
See: https://docs.xmtp.org/protocol/identity

---

### 4. Self.xyz Integration

**Request only what's needed** (selective disclosure):
- `minimumAge` / `olderThan` (not exact birthdate)
- `nationality`
- `gender` (biological sex)
- Do NOT request name

See: https://docs.self.xyz/use-self/disclosures

**Flow**:
1. User scans passport with Self.xyz app
2. Self.xyz issues attestation to their address (PKP)
3. We verify attestation on-chain or via API
4. Mark user as `selfXyzVerified = true`

---

### 5. Zama fhEVM Notes

**Async/latency**: fhEVM uses encrypted types in Solidity, but heavy computation is off-chain with orchestration on-chain. Decryption can be callback-driven.

See: https://docs.zama.org/protocol/protocol/overview

**Implications**:
- `checkCompatibility()` is not instant - plan for async UX
- ACL-scoped decryption means only matched pair can see overlap
- Design UI to handle "compatibility check in progress" state

---

## Open Questions (Remaining)

1. **iOS VPN**: NetworkExtension implementation timeline - need Swift developer

2. **PKP Minting Cost**: Minting 2,231 PKPs upfront is expensive. Options:
   - Batch mint with Lit's bulk APIs
   - Lazy-mint on first like received
   - Hybrid: mint for high-value profiles, lazy for rest

3. **Multi-Platform Dedup**: If someone appears on both dateme and cuties:
   - Option A: Merge into one shadow profile (complex)
   - Option B: Keep separate until claim, merge on claim (simpler)
   - **Recommendation**: Option B - use perceptual hash to suggest "is this also you?" during claim
