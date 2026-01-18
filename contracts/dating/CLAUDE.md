# Neodate V3 - Privacy-Preserving Dating with Zama FHE

## Overview

A privacy-first dating app using Zama's Fully Homomorphic Encryption (fhEVM) for encrypted compatibility matching. V3 is a minimal, gas-optimized version focusing on portable gender eligibility enforcement.

## Key Design Decisions (V3)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Like flow | 1-step | Better UX, single tx per like |
| Enforcement | Match-time, symmetric | FHE only runs on mutual likes |
| Portable guarantee | `isMatch` = preference-respecting | Matches are canonical |
| Attributes | Age + Gender only | ~10x gas reduction |
| `directLike` | Removed | Use candidate-set Merkle proofs |

## Gas Costs (Estimated)

| Contract | Function | Gas | Notes |
|----------|----------|-----|-------|
| **Directory** | `registerOrUpdateProfile()` | ~50k | Minimal fields |
| **Dating** | `setBasics()` | ~500k | 5 FHE values (down from 6.6M) |
| **Dating** | `submitLike()` (no mutual) | ~100k | Just storage |
| **Dating** | `submitLike()` (mutual) | ~300k | 2 FHE checks + pending |
| **Dating** | `finalizeMatch()` | ~200k | Shared values computed |

## Package Manager

Always use **bun** instead of npm:

```bash
bun install          # NOT npm install
bun run <script>     # NOT npm run <script>
bunx hardhat ...     # NOT npx hardhat ...
```

## Quick Commands

```bash
# Install dependencies
bun install

# Compile contracts
bunx hardhat compile

# Run tests
bunx hardhat test

# Deploy
bun run deploy
```

## Contracts

### DirectoryV2 (Public Registry)

Stores only public discovery fields:

```
Profile {
  animeCid        // AI avatar IPFS CID
  encPhotoCid     // Encrypted photo IPFS CID
  ageBucket       // Attested: 0=unset, 1=18-24, 2=25-29, 3=30-34, 4=35-39, 5=40-49, 6=50+
  verifiedLevel   // Attested: 0=none, 1=email, 2=phone, 3=passport
  claimedAgeBucket // User-set pre-verification
  genderIdentity  // Public only (0=hidden)
  updatedAt
  modelVersion
  exists
}
```

### DatingV3 (FHE Matching)

Encrypted per-user state (minimal):

```
encAge           // Claimed, overwritten by verified exact age
encGenderId      // 1=man, 2=woman, 3=trans man, 4=trans woman, 5=non-binary
encDesiredMask   // Bits: 0=men, 1=women, 2=nb (MASK_EVERYONE = 0x0007)
shareAgeOnMatch  // Reveal age bucket-start on match
shareGenderOnMatch // Reveal genderId on match
```

### PartnerLink (Unchanged)

Public mutual partner badge ("ring") - separate from FHE matching.

### SurveyRegistry (Unchanged)

Off-chain survey storage on Base Sepolia.

## Matching Pipeline (V3)

```
1. Candidate Selection (off-chain)
   - Client fetches Directory profiles
   - Filters by age bucket, gender, region, etc.
   - Builds Merkle tree of candidates
   - Signs LikeAuthorization (EIP-712)

2. submitLike (on-chain, 1-step)
   - Verifies Merkle proof (target in candidate set)
   - Stores hasLiked[liker][target] = true
   - If mutual: creates pending match with encrypted eligibility

3. Match Enforcement (on-chain, FHE)
   - Only runs on mutual likes
   - Symmetric: ok_ab AND ok_ba
   - _passesDesiredGender checks target's gender vs liker's mask

4. finalizeMatch (relayer)
   - Decrypts mutual eligibility
   - If true: sets isMatch, computes shared age+gender
```

## Gender Encoding

| Value | Identity | Bucket |
|-------|----------|--------|
| 1 | Man | 0 (men) |
| 2 | Woman | 1 (women) |
| 3 | Trans Man | 0 (men) |
| 4 | Trans Woman | 1 (women) |
| 5 | Non-binary | 2 (nb) |
| 255 | Unknown | - |

### Desired Mask Bits

- Bit 0: Men (man, trans man)
- Bit 1: Women (woman, trans woman)
- Bit 2: Non-binary
- `MASK_EVERYONE = 0x0007` (all three bits)

## Shared-on-Match

Only two values shared (if user opts in):

| Field | Reveal Format |
|-------|---------------|
| Age | 5-year bucket start: 18, 23, 28, 33, ... |
| Gender | Raw genderId (1-5) |

## Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Set oracle, relayer, directory, transfer admin |
| **Oracle** | Set verified attributes (age, sex from self.xyz) |
| **Relayer** | Submit likes, finalize matches |
| **Attestor** (Directory) | Set ageBucket, verifiedLevel |

## EIP-712 LikeAuthorization

```solidity
struct LikeAuthorization {
    bytes32 candidateSetRoot;  // Merkle root of allowed targets
    uint8 maxLikes;            // Quota for this authorization
    uint64 expiry;             // Unix timestamp
    uint64 nonce;              // Prevents replay
}
```

## Portability

**What other dapps can rely on:**

- `isMatch[a][b]` = both parties liked each other AND passed symmetric gender eligibility
- `hasLiked[a][b]` = a attempted to like b (may be ineligible)
- Shared values = age bucket + gender (if opted in)

**Portable guarantee is at match level, not individual likes.**

## Files

```
contracts/dating/
├── contracts/
│   ├── Dating.sol        # DatingV3 - FHE matching (minimal)
│   ├── Directory.sol     # DirectoryV2 - Public profiles (minimal)
│   ├── PartnerLink.sol   # Public partner badge
│   └── SurveyRegistry.sol # Off-chain survey storage
├── client/
│   └── encoding.ts       # Client helpers for V3
├── deploy/
│   ├── deployDating.ts
│   ├── deployDirectory.ts
│   └── ...
├── scripts/
│   └── deployAll.ts
└── CLAUDE.md             # This file
```

## Migration Notes

V3 removes:
- 12-attribute system (now just age + gender)
- `directLike` / daily quota (use Merkle proofs)
- Per-attribute preference arrays
- Complex compatibility loops

V3 adds:
- 1-step like flow
- Match-time symmetric enforcement
- Minimal shared-on-match (2 values)
