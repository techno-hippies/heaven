# Noir Date - Privacy-Preserving Dating with Zama FHE

## Overview

A privacy-first dating app using Zama's Fully Homomorphic Encryption (fhEVM) to enable encrypted compatibility matching without revealing user preferences or dealbreakers.

## Gas Costs (L1 Mainnet @ 0.033 gwei, ETH $3,300)

| Contract | Function | Gas | Cost |
|----------|----------|-----|------|
| **Directory** | `registerOrUpdateProfile()` | 138k | **$0.015** |
| **Directory** | update existing | 42k | $0.005 |
| **Dating** | `setProfile()` | 6.6M | **$0.72** |
| **Dating** | `sendLike()` | 2.0M | **$0.22** |
| **Dating** | `finalizeMatch()` | ~3-5M | $0.33-0.55 |

**Full onboarding:** ~$0.75 (Directory + Dating profile)
**Per like:** $0.22

### Why Dating is expensive

```
12 attributes × 5 encrypted values = 60 FHE operations
Each FHE.fromExternal + FHE.allowThis ≈ 100k gas
60 × 100k = 6M gas
```

### Optimization opportunities

1. **Move to L2** (Base/Arbitrum) → ~100x cheaper ($0.007 per profile)
2. **Reduce attributes** → fewer FHE ops
3. **Lazy encrypt** → only encrypt attributes with filters enabled

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
bunx hardhat test test/DatingV2.ts

# Run client encoding tests
bun test client/encoding.test.ts

# Check deployer balance
bun run balance

# Deploy to Sepolia
bun run deploy

# Seed fake profiles
SEED_COUNT=10 bun run seed
```

## Deployed Contracts (Sepolia)

| Contract | Address |
|----------|---------|
| Directory | [`0x41866647a334BBA898EBe2011C3b2971C1F3D5b5`](https://sepolia.etherscan.io/address/0x41866647a334BBA898EBe2011C3b2971C1F3D5b5) |
| Dating | [`0x1282fF4F33eFA67ea4f85E462F5D73e2cfF25b07`](https://sepolia.etherscan.io/address/0x1282fF4F33eFA67ea4f85E462F5D73e2cfF25b07) |
| PartnerLink | [`0xF4804Af42F062c962a22a9b54d1E060A9037506C`](https://sepolia.etherscan.io/address/0xF4804Af42F062c962a22a9b54d1E060A9037506C) |

**Network:** Sepolia (chainId 11155111) with Zama fhEVM coprocessor

**Deployer:** `0x03626B945ec2713Ea50AcE6b42a6f8650E0611B5`

### Seeded Test Profiles

5 test profiles in Directory (see `deployments/11155111-seed.json`):
- alex, jordan, taylor, morgan, casey

### Frontend Config

Add to `app/.env`:

```bash
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_DIRECTORY_ADDRESS=0x41866647a334BBA898EBe2011C3b2971C1F3D5b5
VITE_DATING_ADDRESS=0x1282fF4F33eFA67ea4f85E462F5D73e2cfF25b07
VITE_PARTNERLINK_ADDRESS=0xF4804Af42F062c962a22a9b54d1E060A9037506C
```

### Next Steps

1. **Frontend integration** - Create `useDirectory()` / `useDating()` hooks
2. **More profiles** - `SEED_COUNT=20 bun run seed` (needs Sepolia ETH)
3. **Test as user** - Connect wallet, browse profiles, submit likes

## Deployment

### Environment Setup

Create `.env`:

```bash
# Shared deployer wallet (same as L1 registry)
DEPLOYER_PRIVATE_KEY=0x...

# Sepolia (Zama fhEVM runs here via coprocessor)
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Zama Relayer (for FHE operations)
RELAYER_URL=https://relayer.testnet.zama.org
GATEWAY_CHAIN_ID=10901
```

### Deploy

```bash
bun run deploy
```

Outputs to `deployments/11155111.json`.

### Seed Profiles

```bash
SEED_COUNT=10 bun run seed
```

## Architecture

### Contracts

- **`contracts/Dating.sol`** - Core FHE dating contract with encrypted matching
- **`contracts/Directory.sol`** - Public profile data (avatar CID, region, etc.)
- **`contracts/PartnerLink.sol`** - Public mutual partner badge ("ring")

### Client

- **`client/encoding.ts`** - TypeScript helpers for encoding attributes and preferences

## Matching Pipeline

```
┌─────────────────────────────────────────────────────────┐
│  1. Candidate Selection (WHO you see)                   │
│                                                         │
│     if (wallet has DNS data from VPN dapp) {            │
│         candidateSet = generateFromDNSBehavior(wallet)  │
│     } else {                                            │
│         candidateSet = generateFromDirectory(wallet)    │
│     }                                                   │
│                                                         │
│     Output: Merkle root of candidates per user/day      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  2. Compatibility Check (IF you match)                  │
│     - On-chain FHE in DatingV2                          │
│     - Encrypted preferences + dealbreakers              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  3. Overlap Reveal (WHY you matched)                    │
│     - ACL-scoped to matched pair only                   │
│     - Only for CRITERIA, never dealbreakers             │
└─────────────────────────────────────────────────────────┘
```

### Candidate Selection Sources

| Source | When Used | Signal Quality |
|--------|-----------|----------------|
| **DNS traffic** (from VPN dapp) | Wallet linked to VPN | High (behavioral) |
| **Directory fields** | Fallback | Basic (region, age, lifestyle) |

DNS data provides richer behavioral matching; Directory fields are the fallback for users without VPN data.

## Privacy Model

Three categories of criteria:

| Category | Storage | On Match | Observer Learns |
|----------|---------|----------|-----------------|
| **Public** | Directory (plaintext) | N/A | Everything (0=hidden is visible) |
| **Secret Criteria** | DatingV2 (encrypted), `revealFlag=1` | "We matched on X" via ACL-scoped overlap | Nothing |
| **Secret Dealbreakers** | DatingV2 (encrypted), `revealFlag=0` | Nothing revealed | Nothing |

## Attribute Layout

```
ID  Name                  Type         Domain              UNKNOWN
--  ----                  ----         ------              -------
0   EXACT_AGE             Numeric      18-254              255
1   BIOLOGICAL_SEX        Categorical  0=M, 1=F            15
2   GENDER_IDENTITY       Categorical  1-10                15
3   KIDS                  Categorical  1-5                 15
4   KIDS_TIMELINE         Categorical  1-6                 15
5   RELATIONSHIP_STRUCTURE Categorical 1-4                 15
6   SMOKING               Categorical  1-3                 15
7   RELATIONSHIP_STATUS   Categorical  1-5                 15
8   DRINKING              Categorical  1-3                 15
9   RELIGION              Categorical  1-7                 15
10  KINK_LEVEL            Numeric      1-7                 255
11  GROUP_PLAY_MODE       Categorical  1-6                 15
```

### RELATIONSHIP_STATUS Values

| Value | Meaning |
|-------|---------|
| 1 | Single |
| 2 | In a relationship |
| 3 | Married |
| 4 | Separated |
| 5 | Divorced |
| 15 | Unknown/unspecified |

### GROUP_PLAY_MODE Values

| Value | Meaning |
|-------|---------|
| 1 | Not interested |
| 2 | Open to threesomes |
| 3 | Single seeking couples |
| 4 | Couple seeking third |
| 5 | Couple seeking couples |
| 6 | Open to group events |
| 15 | Unknown/unspecified |

## Encoding Rules

### Values (What I Am)

- **Categorical**: 1-14 = valid values, 15 = UNKNOWN, >15 sanitized to 15
- **Numeric**: Valid domain or 255 = UNKNOWN
  - Age: 18-254 valid, <18 or >254 sanitized to 255
  - Kink: 1-7 valid, <1 or >7 sanitized to 255

### Preferences (What I Want)

**Categorical** (`prefMask: euint16`):
- Bitmask where bit N = accept value N
- `0x7FFF` (WILDCARD_MASK) = accept all known values (NONE policy)
- Bit 15 = accept UNKNOWN

**Numeric** (`prefMin/prefMax: euint8`):
- Range check: `prefMin <= value <= prefMax`
- Wildcard: `prefMin=0 && prefMax>=254` = accept all known values
- UNKNOWN handling: `prefMask` bit 15 (UNKNOWN_BIT = 0x8000)
- Wildcard does NOT bypass UNKNOWN gate

### Reveal Flags

- `revealFlag=1` (CRITERIA): Overlap may be revealed to matched pair
- `revealFlag=0` (DEALBREAKER): Never revealed, even on match

## Filter vs Signal: The Density Problem

### The Problem

With 12 attributes ANDed together, narrow preferences cause match density to collapse:

```
P(match) = P(attr0) × P(attr1) × ... × P(attr11)
         = 0.5 × 0.3 × 0.3 × ...
         ≈ 0 (very quickly)
```

If users set specific preferences on all attributes, they get "no one matches."

### The Solution: Signals vs Filters

| Mode | prefMask | Behavior | UX |
|------|----------|----------|----|
| **Signal** | `WILDCARD_MASK` (0x7FFF) | Always passes known values, revealed on match | "I prefer X but show me everyone" |
| **Filter** | Specific bits | Gates matching | "Only show me X" |

- **Signal** = preference stored for revelation but doesn't gate matching
- **Filter** = hard gate (dealbreaker behavior)

### Recommended Defaults

**Default to WILDCARD (signal)** for most attributes. Only these should filter by default:

| Attribute | Default | Rationale |
|-----------|---------|-----------|
| EXACT_AGE | Filter ON | Core demographic |
| BIOLOGICAL_SEX | Filter ON | Core preference |
| GENDER_IDENTITY | Filter ON | Core preference |
| REGION (Directory) | Filter ON | Geographic reality |
| All others | Signal (WILDCARD) | Let users opt-in |

This ensures users get matches while still revealing shared preferences.

### Wildcard Mechanics

**Categorical** (prefMask):
- `WILDCARD_MASK = 0x7FFF` → accepts all known values (bits 0-14 set)
- Contract: `FHE.and(theirValue, myMask) != 0` always true with wildcard

**Numeric** (prefMin/prefMax):
- `prefMin=0, prefMax>=254` → accepts all known values
- Contract: `prefMin <= value <= prefMax` always true for valid range
- Note: UNKNOWN (255) still checked via bit 15 of prefMask

## UI Flow Model

### Two Flows

The UI has two distinct flows for each attribute:

| Flow | Question | Selection | Control |
|------|----------|-----------|---------|
| **Value** | "What are you?" | Single-select | Visibility picker (public/match/private) |
| **Preference** | "What do you want?" | Multi-select | Filter toggle (ON/OFF) |

### Value Steps (What I Am)

- User picks ONE value (e.g., "I am Female")
- Visibility controls WHO sees it:
  - `public` → stored in Directory (plaintext)
  - `match` → revealed only to matches (revealFlag=1)
  - `private` → never revealed (revealFlag=0)

### Preference Steps (What I Want)

- User picks MULTIPLE values (e.g., "I want Male or Female")
- Filter toggle controls IF it gates matching:
  - **OFF** (default for most): `prefMask = WILDCARD_MASK` → shows everyone (known values)
  - **ON**: `prefMask = selected bits` → hides non-matching profiles

### UI Helper Functions

The `client/encoding.ts` provides helpers to map UI state to contract encoding:

```typescript
// For categorical attributes (gender, relationship structure, etc.)
createCategoricalConfig(
  myValue: number,          // What I am (single value)
  acceptedValues: number[], // What I want (multi-select)
  filterEnabled: boolean,   // Filter toggle state
  visibility: 'public' | 'match' | 'private'
): AttributeConfig

// For numeric attributes (age, kink level)
createNumericConfig(
  myValue: number,          // What I am
  prefMin: number,          // Range start
  prefMax: number,          // Range end
  filterEnabled: boolean,   // Filter toggle state
  visibility: 'public' | 'match' | 'private'
): AttributeConfig
```

When `filterEnabled=false`, these helpers automatically apply WILDCARD encoding.

## Like System

### Direct Likes (`sendLike`)

- User calls directly
- Daily quota enforced (default 10/day, admin-configurable)
- Resets at UTC midnight (`block.timestamp / 1 days`)

### Authorized Likes (`submitLike`)

- Relayer-only (prevents griefing)
- Requires EIP-712 signed `LikeAuthorization`
- Merkle proof validates target is in candidate set
- Per-authorization quota

### Nonce Rules

- Each nonce can only be used once per user (forever)
- Explicit `nonceUsed` mapping prevents re-authorization attacks
- Duplicate likes to same target blocked

## FHE Constraints (Zama fhEVM)

### Supported Operations

```solidity
FHE.add, FHE.sub, FHE.mul        // Arithmetic
FHE.and, FHE.or, FHE.not         // Boolean
FHE.eq, FHE.ne, FHE.lt, FHE.gt   // Comparison
FHE.le, FHE.ge, FHE.min, FHE.max // Comparison
FHE.shl, FHE.shr                 // Shift
FHE.select(cond, ifTrue, ifFalse) // Branching
FHE.div(x, plaintext)            // Division (PLAINTEXT divisor only!)
FHE.rem(x, plaintext)            // Remainder (PLAINTEXT divisor only!)
```

### ACL Model

```solidity
FHE.allowThis(handle)              // Contract can use
FHE.allow(handle, address)         // Specific address can decrypt
// NEVER: FHE.makePubliclyDecryptable() for sensitive data
```

### Sanitization

All user inputs are sanitized to prevent out-of-domain values:

```solidity
_sanitizeCategorical(val)  // >15 → 15 (clamp, not modulo)
_sanitizeAge(val)          // <18 or >254 → 255
_sanitizeKink(val)         // <1 or >7 → 255
```

## Overlap Reveals

Overlaps are revealed only if ALL conditions met:

1. Both values are KNOWN (not UNKNOWN)
2. Both users set `revealFlag=1` (CRITERIA)
3. Both users actively filtering (not WILDCARD)
4. Values are in same group:
   - Categorical: exact match
   - Age: 5-year buckets (18-22, 23-27, 28-32, ...)
   - Kink: groups (1-2 vanilla, 3-4 open-minded, 5-7 enthusiast)

Overlap booleans are ACL-scoped to matched pair only.

## Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Set oracle, relayer, directory, directLikeQuota, transfer admin |
| **Oracle** | Set verified attributes (age, biological sex from passport) |
| **Relayer** | Submit authorized likes, finalize matches |

## Test Coverage

```
DatingV2
  Profile Setup
    ✓ should initialize profile with encrypted values
    ✓ should not allow overwriting verified attributes
  Like Authorization
    ✓ should authorize likes with valid signature
  Matching Flow
    ✓ should allow direct like
    ✓ should detect mutual like and create pending match
    ✓ should submit like with Merkle proof
    ✓ should reject like with invalid Merkle proof
  Numeric LENIENT Unknown
    ✓ should pass UNKNOWN value when LENIENT
    ✓ should fail UNKNOWN value when STRICT
  Photo Grants
    ✓ should allow auto photo grant on mutual match
    ✓ should allow manual photo grant after match
  Quota Enforcement
    ✓ should enforce daily direct like quota
    ✓ should reject nonce reuse in authorizeLikes
    ✓ should reject duplicate likes
```

## Key Files

```
contracts/dating/
├── contracts/
│   ├── Dating.sol        # Core FHE dating contract
│   ├── Directory.sol     # Public profile storage
│   └── PartnerLink.sol   # Public mutual partner badge
├── client/
│   ├── encoding.ts       # Attribute encoding helpers
│   └── encoding.test.ts  # Client-side tests
├── scripts/
│   ├── deployAll.ts      # Deploy all contracts to fhEVM
│   └── seedProfiles.ts   # Seed fake profiles for testing
├── deploy/
│   ├── deployDirectory.ts
│   ├── deployDating.ts
│   └── deployPartnerLink.ts
├── deployments/
│   └── <chainId>.json    # Deployed contract addresses
├── test/
│   └── DatingV2.ts       # Hardhat tests
├── .env                  # Environment config (not committed)
└── CLAUDE.md             # This file
```

## PartnerLink Contract

Separate from FHE matching - a public "ring" for social commitment:

```solidity
proposePartner(address partner)  // Initiate proposal
acceptPartner(address proposer)  // Accept incoming proposal
cancelProposal()                 // Cancel outgoing proposal
breakPartner()                   // Either side can break
isPartnered(address)             // Check if partnered
getPartner(address)              // Get partner address
```

Use cases:
- "Partnered with 0x..." badge in UI
- Couples signaling public commitment
- Does NOT affect FHE matching logic
