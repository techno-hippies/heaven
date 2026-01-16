# Zama Dating Architecture

## Privacy Model

### The Side-Channel Problem

**Bad design (publicly decryptable criteria)**:
```solidity
FHE.makePubliclyDecryptable(criteriaMatched);  // Anyone can decrypt!
```

An attacker watching the chain could:
1. See all `MatchCreated` events
2. Decrypt every match's criteria via public KMS call
3. Build graph: "Alice↔Bob matched on religion, kink, politics"
4. Infer: "Alice is kinky and religious" from pattern of her matches
5. Cross-reference multiple matches to narrow down exact preferences

**This defeats the entire privacy model.**

---

### Correct Design: ACL-Scoped Decryption

Only the matched pair can decrypt their criteria:

```solidity
// Grant decryption rights ONLY to the two matched users
FHE.allow(criteriaMatched[i], user1);
FHE.allow(criteriaMatched[i], user2);
// NOT: FHE.makePubliclyDecryptable(...)
```

External observers see:
- `MatchCreated(alice, bob)` ← public event (they matched)
- Encrypted criteria handles ← can't decrypt without ACL

Alice and Bob see:
- Their match criteria (decrypted via user-scoped KMS call)
- "Here's why you matched: religion ✓, age ✓, kink ✓"

---

## Decryption Modes in Zama

| Mode | Who can decrypt | Use case |
|------|----------------|----------|
| `FHE.makePubliclyDecryptable()` | Anyone | Public reveals (e.g., auction winner) |
| `FHE.allow(handle, address)` | Specific address | Private reveals to authorized parties |
| `FHE.allowThis(handle)` | Contract itself | Contract needs to compute on value |

For dating:
- **Mutual match boolean**: Could be public (just "they matched")
- **Match criteria**: ACL-scoped to the pair only
- **Revealed values**: ACL-scoped to the pair only

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (User A)                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 1. Connect wallet (MetaMask / Lit PKP)                      │ │
│  │ 2. Set preferences (encrypt client-side with fhevmjs)       │ │
│  │ 3. Browse profiles (query TheGraph for public data)         │ │
│  │ 4. Like someone (call Dating.sendLike)                      │ │
│  │ 5. On match → decrypt criteria via user-scoped KMS call     │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      HOST CHAIN (Base L2)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Directory.sol (Public)                                    │   │
│  │ ├── profiles[user] → animeCid, buckets, visibility        │   │
│  │ └── No FHE, just public profile data                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Dating.sol (Encrypted)                                    │   │
│  │ ├── attributes[user] → euint8[] (private attrs)          │   │
│  │ ├── preferences[user] → euint8[] (private prefs)         │   │
│  │ ├── matchCriteria[pair][liker] → ebool[] (encrypted)     │   │
│  │ ├── pendingMatches[pair] → MatchPending                   │   │
│  │ └── isMatch[a][b] → bool (public fact of match)          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FHE COPROCESSOR                             │
│  • Executes FHE operations (add, eq, and, etc.)                 │
│  • Returns encrypted results                                     │
│  • Stateless computation on ciphertexts                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      KMS (Threshold Decryption)                  │
│  • 13 MPC nodes                                                  │
│  • Checks ACL before decrypting                                  │
│  • User requests decryption with signature                       │
│  • Returns cleartext + KMS proof                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. User Setup

```
User A:
├── Directory.registerProfile(animeCid, ageBucket=3, ...)     // Public
├── Dating.setPrivateAttributes(E(religion), E(age), ...)     // Encrypted
└── Dating.setPreferences(E(religionPref), E(ageMin), ...)    // Encrypted
```

### 2. Like Flow

```
User A likes User B:

sendLike(B) {
    // Load A's preferences (encrypted)
    prefs = preferences[A]

    // Load B's attributes (encrypted)
    attrs = attributes[B]

    // Compute compatibility per criterion (all encrypted)
    criteria[RELIGION] = FHE.eq(prefs.religion, attrs.religion)
    criteria[AGE] = FHE.and(
        FHE.ge(attrs.age, prefs.ageMin),
        FHE.le(attrs.age, prefs.ageMax)
    )
    criteria[KINK] = FHE.ge(attrs.kink, prefs.kinkMin)
    // ... more criteria

    // Overall compatibility
    compatible = FHE.and(criteria[0], criteria[1], ...)

    // Store for this like direction (A→B)
    matchCriteria[pairKey][A] = criteria
    likeCompatible[pairKey][A] = compatible

    // Grant ACL to both users (for later decryption)
    for each criterion:
        FHE.allow(criteria[i], A)
        FHE.allow(criteria[i], B)
    FHE.allow(compatible, A)
    FHE.allow(compatible, B)

    // Check if B already liked A
    if (likeCompatible[pairKey][B] exists) {
        // Compute mutual match
        mutualLike = FHE.and(compatible, likeCompatible[pairKey][B])
        FHE.allow(mutualLike, A)
        FHE.allow(mutualLike, B)

        // Store pending match for relayer to finalize
        pendingMatches[pairKey] = PendingMatch(A, B, mutualLike)
        emit MatchPending(pairKey, A, B, mutualLikeHandle)
    }

    emit LikeSent(A, B)
}
```

### 3. Match Finalization

The relayer watches for `MatchPending` events, but **cannot decrypt criteria**:

```
Relayer:
├── Sees: MatchPending(pairKey, A, B, mutualLikeHandle)
├── Requests public decryption of mutualLike boolean ONLY
├── If true: calls finalizeMatch(A, B, true, proof)
└── Does NOT decrypt criteria (no ACL access)
```

```solidity
finalizeMatch(user1, user2, isMutualMatch, proof) {
    // Verify KMS proof for the mutual match boolean
    FHE.checkSignatures(...)

    if (isMutualMatch) {
        isMatch[user1][user2] = true
        isMatch[user2][user1] = true

        // Criteria handles already have ACL set to user1, user2
        // They decrypt client-side, not here

        emit MatchCreated(user1, user2)
    }
}
```

### 4. User Decrypts Their Match Criteria

```
Frontend (User A after matching with B):

// Get criteria handles from contract
handles = Dating.getMatchCriteriaHandles(A, B)

// Request decryption from KMS (user-scoped)
// KMS checks: is msg.sender == A or B? (ACL check)
cleartexts = fhevm.userDecrypt(handles, A.signature)

// Display: "Here's why you matched"
// ✓ Religion (cleartexts[0] == true)
// ✓ Age (cleartexts[1] == true)
// ✗ Income (cleartexts[4] == false, but you both didn't care)
```

---

## What's Public vs Private

| Data | Visibility | Who can see |
|------|------------|-------------|
| Profile (anime, buckets) | Public | Everyone |
| Private attributes | Encrypted | Owner + matches (via ACL) |
| Preferences | Encrypted | Owner only |
| Like sent | Event only | Indexers see "A liked B" |
| Compatibility result | Encrypted | A and B only (ACL) |
| Match criteria | Encrypted | A and B only (ACL) |
| Match exists | Public | Everyone (isMatch mapping) |
| Revealed values | Encrypted | A and B only (ACL + consent) |

---

## Consent-Based Value Reveal

After matching, users can optionally reveal actual values (not just "matched: yes/no"):

```solidity
// User A consents to reveal their religion, age to match B
consentToReveal(B, RELIGION_BIT | AGE_BIT) {
    consent[pairKey][A] = RELIGION_BIT | AGE_BIT

    // Check mutual consent
    mutualConsent = consent[pairKey][A] & consent[pairKey][B]

    if (mutualConsent & RELIGION_BIT) {
        // Both consented to reveal religion
        // Grant ACL for actual values
        FHE.allow(attributes[A].religion, B)
        FHE.allow(attributes[B].religion, A)
        emit ValueRevealAuthorized(A, B, RELIGION)
    }
}
```

User decrypts partner's revealed values client-side via KMS.

---

## Contract Interface

```solidity
interface IDating {
    // Setup
    function setPrivateAttributes(
        externalEuint8[] calldata values,
        bytes calldata proof
    ) external;

    function setPreferences(
        externalEuint8[] calldata values,
        bytes calldata proof
    ) external;

    // Matching
    function sendLike(address to) external;

    function finalizeMatch(
        address user1,
        address user2,
        bool isMutualMatch,
        bytes calldata kmsProof
    ) external;

    // Consent
    function consentToReveal(
        address matchedWith,
        uint16 attributeBitmap
    ) external;

    // View (returns handles, user decrypts client-side)
    function getMatchCriteriaHandles(
        address a,
        address b
    ) external view returns (bytes32[] memory);

    function getRevealedValueHandles(
        address a,
        address b
    ) external view returns (bytes32[] memory);

    // Public state
    function isMatch(address a, address b) external view returns (bool);
}
```

---

## TheGraph Subgraph

Index public events only:

```graphql
type Profile @entity {
  id: Bytes!  # address
  animeCid: Bytes!
  ageBucket: Int!
  regionBucket: Int!
  genderId: Int!
  verifiedLevel: Int!
  updatedAt: BigInt!
}

type Match @entity {
  id: Bytes!  # pairKey
  user1: Bytes!
  user2: Bytes!
  timestamp: BigInt!
  # NOTE: No criteria here - that's private to the pair
}

type Like @entity {
  id: Bytes!  # tx hash
  from: Bytes!
  to: Bytes!
  timestamp: BigInt!
  # NOTE: No compatibility result - that's encrypted
}
```

---

## Security Considerations

### What the relayer can see:
- Public events (likes, matches)
- Encrypted handles
- Decrypted mutual match boolean (true/false only)

### What the relayer CANNOT see:
- Match criteria (which attributes matched)
- Attribute values
- Preference values

### What an external observer can see:
- "A liked B"
- "A and B matched"
- Public profile data

### What an external observer CANNOT see:
- Why they matched
- Their private attributes
- Their preferences

### Attack vectors mitigated:
1. **Side-channel from match graph**: Criteria encrypted, ACL-scoped
2. **Relayer learns preferences**: Only sees match boolean
3. **Cross-match inference**: Can't see which criteria matched across pairs

---

## Implementation Plan

### Phase 1: Core Contracts
- [ ] Update Dating.sol with ACL-scoped decryption
- [ ] Implement per-criterion encrypted storage
- [ ] Add consent-based value reveal
- [ ] Write deployment scripts

### Phase 2: Infrastructure
- [ ] Deploy to Base Sepolia (or Zama-supported L2)
- [ ] Create TheGraph subgraph for public data
- [ ] Set up relayer for match finalization

### Phase 3: Frontend
- [ ] Integrate fhevmjs for client-side encryption
- [ ] Implement user-scoped KMS decryption
- [ ] Build match reveal UI
- [ ] Add consent flow for value reveal

### Phase 4: Polish
- [ ] Gas optimization
- [ ] Error handling
- [ ] Rate limiting
- [ ] Audit

---

## Open Questions

1. **Should "like sent" be public or private?**
   - Current: Public event (indexers see "A liked B")
   - Alternative: Encrypt like, only reveal on match
   - Tradeoff: Privacy vs. indexability

2. **Mutual match boolean - public or ACL-scoped?**
   - Current: Public (relayer decrypts, calls finalizeMatch)
   - Alternative: ACL to both users, they finalize client-side
   - Tradeoff: UX (auto-notify) vs. privacy (observers can't see matches)

3. **Rate limiting likes?**
   - Prevent spam/scraping via many likes
   - Could use on-chain counter or off-chain rate limit

4. **Attribute update invalidation?**
   - If user changes attributes, do pending likes recompute?
   - Probably not - snapshot at like time is fine
