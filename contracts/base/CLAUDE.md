# Base L2 Contracts (Foundry)

All non-FHE contracts deployed to Base. Uses Foundry toolchain.

---

## Contracts Overview

| Contract | Purpose |
|----------|---------|
| `SubnameRegistrarV2` | ENS subname NFTs (`.heaven`, `.⭐`, `.🌀`) |
| `SurveyRegistry` | Encrypted survey responses (IPFS CIDs) |
| `ScrobbleLogV1` | Music listening history |
| `Records` | ENS-compatible record storage |
| `Resolver` | ENSIP-10 wildcard resolver |
| `DutchAuctionHouse` | Premium name auctions |

---

# Name Registry

## What This Does (Simple Version)

Users pick a username like `alex.heaven` or `luna.⭐`. This contract:

1. **Mints an NFT** for the name (you own `alex.heaven` as an ERC-721 token)
2. **Stores records** (your wallet address, profile link, etc.)
3. **Bridges to ENS** so wallets can send to `alex.heaven.hnsbridge.eth`

Think of it like ENS, but for our custom TLDs.

---

## Gas Costs (L1 Mainnet)

| Function | Gas | Cost @ 0.033 gwei |
|----------|-----|-------------------|
| `register()` | 175k | **$0.02** |
| `renew()` | ~50k | ~$0.005 |

*Costs assume ETH @ $3,300. At higher gas (5 gwei), multiply by ~150x.*

---

## The Three TLDs

| TLD | Example | Price | Who It's For |
|-----|---------|-------|--------------|
| `.heaven` | `alex.heaven` | Free | Everyone (default) |
| `.⭐` | `luna.⭐` | $12/year | Premium vanity |
| `.🌀` | `cosmic.🌀` | $12/year | Premium vanity |

Each TLD is a separate namespace. `alex.heaven` and `alex.⭐` are different people.

---

## How Registration Works

### User Flow

```
1. User picks "alex" on the app
2. App calls: registrar.register("alex", 1 year)
3. User pays (free for .heaven, ETH for paid TLDs)
4. Contract mints NFT #42 to user
5. User now owns alex.heaven for 1 year
```

### What Gets Blocked

```
"ab"     → Too short (min 4 chars)
"king"   → Reserved (premium word)
"ALEX"   → Invalid (lowercase only)
"alex!"  → Invalid (only a-z, 0-9, hyphen)
```

### What's Allowed

```
"alex"       → OK
"alex7"      → OK
"blue-sky"   → OK
"cosmic123"  → OK
```

---

## Reserved Names (~350 words)

We block certain names so they can't be grabbed:

- **Brand**: `heaven`, `hnsbridge`, `admin`, `support`, `official`
- **Premium**: `king`, `queen`, `alpha`, `god`, `love`, `crypto`, `bitcoin`
- **Profanity**: Common curse words and slurs
- **Tech**: `google`, `meta`, `discord` (impersonation risk)

Owner can still mint these via `ownerRegister()` for partnerships/giveaways.

---

## Length-Based Pricing (Paid TLDs Only)

For `.⭐` and `.🌀`, shorter names cost more:

| Length | Multiplier | If base is $10/yr |
|--------|------------|-------------------|
| 1 char | 100x | $1,000/yr |
| 2 char | 50x | $500/yr |
| 3 char | 10x | $100/yr |
| 4 char | 3x | $30/yr |
| 5+ | 1x | $10/yr |

So `a.⭐` costs $1,000/yr, but `alex.⭐` costs $10/yr.

---

## Contract Settings

### Free Tier (`.heaven`)

```
pricePerYear = 0
minLabelLength = 4       (blocks 1-3 char names)
maxDuration = 1 year     (prevents forever locks)
lengthPricingEnabled = false
```

### Paid Tier (`.⭐`, `.🌀`)

```
pricePerYear = 0.01 ETH
minLabelLength = 1       (allow short names at premium)
maxDuration = 3 years
lengthPricingEnabled = true
lengthMult1 = 100, lengthMult2 = 50, lengthMult3 = 10, lengthMult4 = 3
```

---

## Key Functions

### For Users

```solidity
// Register a name for yourself
register("alex", 365 days) → tokenId

// Register for someone else
registerFor("alex", recipientAddress, 365 days) → tokenId

// Extend your registration (anyone can pay to extend anyone's name)
renew(tokenId, 365 days)

// Check if a name is available
available("alex") → true/false

// Get your full name
fullName(tokenId) → "alex.heaven.hnsbridge.eth"
```

### For Owner (Admin)

```solidity
// Mint reserved/short names (bypasses all restrictions except valid chars)
ownerRegister("king", winnerAddress, 365 days)

// Open/close registrations (deploy closed, open when ready)
setRegistrationsOpen(true)

// Set reserved words
setReservedLabels(["king", "queen", "god"], true)

// Configure pricing
setPrice(0.01 ether)
setLengthPricing(true, 100, 50, 10, 3)

// Withdraw collected fees
withdraw()
```

---

## Deployment Steps

```bash
# 1. Deploy (registrations are CLOSED by default)
PARENT_NAME=heaven TLD=hnsbridge.eth PRICE_PER_YEAR=0 \
  forge script script/DeployV2.s.sol --rpc-url $RPC --broadcast

# 2. Set reserved words (~350 premium/profanity)
REGISTRAR=0x... forge script script/SetReserved.s.sol --rpc-url $RPC --broadcast

# 3. Set ENS resolver (via ENS app or contract call)
# Point heaven.hnsbridge.eth resolver to our Resolver contract

# 4. Open registrations
cast send $REGISTRAR "setRegistrationsOpen(bool)" true --private-key $PK
```

---

## File Structure

```
contracts/base/
├── src/
│   ├── SubnameRegistrarV2.sol  # Main registrar (use this)
│   ├── DutchAuctionHouse.sol   # Premium name auctions
│   ├── SubnameRegistrar.sol    # V1 (legacy, don't use)
│   ├── Records.sol             # ENS-style record storage
│   ├── Resolver.sol            # ENSIP-10 wildcard resolver
│   ├── SurveyRegistry.sol      # Survey responses (IPFS CIDs)
│   └── ScrobbleLogV1.sol       # Music scrobbles
├── script/
│   ├── DeployV2.s.sol          # Deploy V2 registrar
│   ├── SetReserved.s.sol       # Set ~350 reserved words
│   └── ReserveShortLabels.s.sol # Reserve all 1-2 char (optional)
├── data/
│   └── reserved-labels.txt     # Master list of reserved words
└── test/
```

---

## Architecture

```
┌──────────────────────┐      ┌─────────────────────┐
│  SubnameRegistrarV2  │─────►│      Records        │
│  (ERC-721 NFT)       │      │  (ENS-compatible)   │
│                      │      │                     │
│  - register/renew    │      │  - addr, text       │
│  - reserved list     │      │  - contenthash      │
│  - length pricing    │      │  - profile data     │
└──────────────────────┘      └──────────┬──────────┘
                                         │
                              ┌──────────▼──────────┐
                              │      Resolver       │
                              │  (ENSIP-10 wildcard)│
                              └──────────┬──────────┘
                                         │
                              ENS Registry (mainnet)
```

---

## Example Scenarios

### Scenario 1: User registers `cosmic.heaven`

```
1. User calls register("cosmic", 365 days)
2. Contract checks:
   - registrationsOpen? ✓
   - valid chars? ✓ (lowercase, no special chars)
   - length >= 4? ✓ (6 chars)
   - not reserved? ✓
   - not already taken? ✓
3. Price = 0 (free tier)
4. Mints NFT #1 to user
5. Sets expiry to now + 365 days
6. User owns cosmic.heaven.hnsbridge.eth
```

### Scenario 2: User tries to register `king.heaven`

```
1. User calls register("king", 365 days)
2. Contract checks reserved["king"] → true
3. REVERTS with Reserved()
```

### Scenario 3: Owner gives away `king.⭐`

```
1. Owner calls ownerRegister("king", winnerAddress, 365 days)
2. Contract checks:
   - caller is owner? ✓
   - valid chars? ✓
   - (skips: minLength, reserved, maxDuration, registrationsOpen)
3. Mints NFT to winner
4. Winner owns king.star.hnsbridge.eth
```

### Scenario 4: Name expires

```
1. alex.heaven expires on Jan 1
2. Jan 1 - Mar 31: Grace period (owner can still renew)
3. Apr 1+: Anyone can register "alex" again
4. Old records are cleared, old NFT is burned
```

---

## Dynamic Pricing

Prices can be changed anytime after deployment:

```solidity
// Change base price (affects all future registrations/renewals)
setPrice(0.02 ether)

// Change length multipliers
setLengthPricing(true, 100, 50, 10, 3)
```

**What changes affect:**
- Future `register()` and `renew()` calls
- Does NOT affect already-minted tokens or past payments

**Launch pattern:**
1. Deploy with conservative pricing
2. Open registrations
3. Adjust `pricePerYear` / multipliers as demand becomes clear

---

## Renewal

Anyone can pay to extend anyone's name:

```solidity
// I want to extend my friend's name as a gift
renew(friendsTokenId, 365 days)
```

This is ENS-style behavior. The payer doesn't get ownership, they just extend the current owner's registration.

---

## Dutch Auctions (Premium Names)

For special names like `king.⭐`, we run Dutch auctions where price decreases over time.

### How It Works

```
1. Owner reserves "king" in registrar (public blocked)
2. Owner creates auction: startPrice=$1000, endPrice=$100, duration=7 days
3. Price decreases linearly: Day 1 = $1000, Day 4 = $550, Day 7 = $100
4. User calls buy("king", 1 year) and pays: premium($550) + base($10) = $560
5. AuctionHouse mints via operatorRegister(), keeps premium, sends base to registrar
6. User owns king.star.hnsbridge.eth
```

### Contracts

| Contract | Role |
|----------|------|
| `SubnameRegistrarV2` | Mints NFT, collects base fee |
| `DutchAuctionHouse` | Manages auctions, collects premium |

### Setup

```bash
# 1. Reserve premium names
cast send $REGISTRAR "setReservedLabels(string[],bool)" '["king","queen","god"]' true

# 2. Deploy auction house
forge create src/DutchAuctionHouse.sol:DutchAuctionHouse \
  --constructor-args $REGISTRAR $OWNER

# 3. Set auction house as operator
cast send $REGISTRAR "setOperator(address,bool)" $AUCTION_HOUSE true

# 4. Create auction (1 ETH start, 0.1 ETH end, 7 days)
LABEL_HASH=$(cast keccak "king")
cast send $AUCTION_HOUSE "createAuction(bytes32,uint128,uint128,uint64,uint64)" \
  $LABEL_HASH 1000000000000000000 100000000000000000 $START_TIME $END_TIME
```

### Key Functions

```solidity
// Create auction (owner only)
createAuction(labelHash, startPrice, endPrice, startTime, endTime)

// Check current price
currentPremiumPrice(labelHash) → premium
totalPrice("king", 365 days) → (premium, base, total)

// Buy at current price
buy("king", 365 days) → tokenId

// Withdraw premium proceeds
withdraw(treasuryAddress)
```

---

## ENS Bridge

Names resolve in both directions:

```
Handshake:  alex.⭐ → DNS TXT points to ENS
ENS:        alex.star.hnsbridge.eth → our Resolver → Records contract
```

So MetaMask can send to `alex.star.hnsbridge.eth` and it works.

---

## Environment Variables

```bash
PRIVATE_KEY=0x...           # Deployer wallet
SEPOLIA_RPC_URL=...         # Testnet RPC
MAINNET_RPC_URL=...         # Mainnet RPC
PARENT_NAME=heaven         # or "star" or "heart"
TLD=hnsbridge.eth           # Always this for multi-TLD
PRICE_PER_YEAR=0            # In wei (0 for free tier)
OWNER=0x...                 # Contract owner address
```

---

## Quick Reference

| What | Command |
|------|---------|
| Build | `forge build` |
| Test | `forge test` |
| Deploy | `forge script script/DeployV2.s.sol --rpc-url $RPC --broadcast` |
| Set reserved | `REGISTRAR=0x... forge script script/SetReserved.s.sol --broadcast` |
| Open registrations | `cast send $REG "setRegistrationsOpen(bool)" true` |
| Check available | `cast call $REG "available(string)" "alex"` |
| Register | `cast send $REG "register(string,uint256)" "alex" 31536000 --value 0` |

---

# SurveyRegistry

Maps wallet + schemaId → IPFS CID for encrypted survey responses. Supports gasless submissions via EIP-712.

## Key Functions

```solidity
// Register a survey response
register(schemaIdBytes32, responseCid, encryptionMode)

// Register on behalf of user (gasless)
registerFor(user, surveyId, cid, encryptionMode, deadline, sig)

// Delete a survey
deleteSurvey(schemaIdBytes32)

// Read
getSurvey(wallet, schemaIdBytes32) → (cid, mode, updatedAt)
hasSurvey(wallet, schemaIdBytes32) → bool
getActiveSchemas(wallet) → bytes32[]
```

## Encryption Modes

| Mode | Value | Description |
|------|-------|-------------|
| None | 0 | Unencrypted |
| Match-only | 1 | Decryptable by matches |
| Tiered | 2 | Public + match-only + private sections |

---

# ScrobbleLogV1

Append-only log of music plays. Supports gasless batch submissions via EIP-712.

## Key Functions

```solidity
// Log a single play
scrobble(trackHash, timestamp, durationSecs, source)

// Batch log (up to 100)
batchScrobble(trackHashes[], timestamps[], durations[], sources[])

// Gasless versions
scrobbleFor(user, trackHash, timestamp, duration, source, deadline, sig)
batchScrobbleFor(user, trackHashes[], timestamps[], durations[], sources[], deadline, sig)

// Read
getScrobble(user, index) → Scrobble
getScrobbles(user, offset, limit) → Scrobble[]
scrobbleCount(user) → uint256
getTrackPlayCount(user, trackHash) → uint256
```

## Source Codes

| Code | Source |
|------|--------|
| 0 | Unknown |
| 1 | Spotify |
| 2 | Apple Music |
| 3 | YouTube |
| 4 | Local files |
| 5 | Other |
