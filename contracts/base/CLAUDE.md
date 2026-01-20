# Base L2 Contracts (Foundry)

All non-FHE contracts deployed to Base. Uses Foundry toolchain.

## Contracts Overview

| Contract | Purpose |
|----------|---------|
| `MultiTldSubnameRegistrarV3.sol` | ENS subname NFTs for `.heaven` |
| `RecordsV2.sol` | ENS-compatible record storage |
| `Resolver.sol` | ENSIP-10 wildcard resolver |
| `DutchAuctionHouse.sol` | Premium name auctions |
| `SurveyRegistry.sol` | Encrypted survey responses (IPFS CIDs) |
| `ScrobbleLogV2.sol` | Music listening history |

## Name Registry

### What This Does

Users pick a username like `alex.heaven`. This contract:

1. **Mints an NFT** for the name (you own `alex.heaven` as an ERC-721 token)
2. **Stores records** (your wallet address, profile link, etc.)
3. **Bridges to ENS** so wallets can send to `alex.heaven.hnsbridge.eth`

### Gas Costs (Base L2)

| Function | Gas | Cost |
|----------|-----|------|
| `register()` | ~175k | ~$0.02 |
| `renew()` | ~50k | ~$0.005 |

### Registration Rules

**What Gets Blocked:**
```
"ab"     → Too short (min 4 chars)
"king"   → Reserved (premium word)
"ALEX"   → Invalid (lowercase only)
"alex!"  → Invalid (only a-z, 0-9, hyphen)
```

**What's Allowed:**
```
"alex"       → OK
"alex7"      → OK
"blue-sky"   → OK
"cosmic123"  → OK
```

### Reserved Names (~350 words)

- **Brand**: `heaven`, `hnsbridge`, `admin`, `support`, `official`
- **Premium**: `king`, `queen`, `alpha`, `god`, `love`, `crypto`, `bitcoin`
- **Profanity**: Common curse words and slurs
- **Tech**: `google`, `meta`, `discord` (impersonation risk)

Owner can mint reserved names via `adminRegister()`.

### Contract Settings

```
pricePerYear = 0            (free)
minLabelLength = 4          (blocks 1-3 char names)
maxDuration = 1 year        (prevents forever locks)
gracePeriod = 90 days       (owner can renew after expiry)
```

## Key Functions

### For Users

```solidity
// Register a name
register(parentNode, "alex", 365 days) → tokenId

// Register for someone else
registerFor(parentNode, "alex", recipientAddress, 365 days)

// Extend registration
renew(tokenId, 365 days)

// Check availability
available(parentNode, "alex") → true/false

// Get full ENS name
fullName(tokenId) → "alex.heaven.hnsbridge.eth"
```

### For Admin

```solidity
// Mint reserved names (bypasses restrictions)
adminRegister(parentNode, "king", winnerAddress, 365 days)

// Open/close registrations
setRegistrationsOpen(parentNode, true)

// Mark labels as reserved
setReservedHashes(parentNode, hashes[], true)

// Withdraw collected fees
withdraw()
```

## File Structure

```
contracts/base/
├── src/
│   ├── MultiTldSubnameRegistrarV3.sol  # Main registrar
│   ├── RecordsV2.sol                   # ENS-style record storage
│   ├── Resolver.sol                    # ENSIP-10 wildcard resolver
│   ├── DutchAuctionHouse.sol           # Premium name auctions
│   ├── SurveyRegistry.sol              # Survey responses
│   └── ScrobbleLogV2.sol               # Music scrobbles
├── script/
│   └── *.s.sol                         # Deployment scripts
├── data/
│   └── reserved-labels.txt             # Reserved words list
└── test/
```

## Architecture

```
┌────────────────────────────┐      ┌─────────────────────┐
│ MultiTldSubnameRegistrarV3 │─────►│     RecordsV2       │
│      (ERC-721 NFT)         │      │  (ENS-compatible)   │
│                            │      │                     │
│  - register/renew          │      │  - addr, text       │
│  - reserved list           │      │  - contenthash      │
│  - expiry tracking         │      │  - profile data     │
└────────────────────────────┘      └──────────┬──────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │      Resolver       │
                                    │  (ENSIP-10 wildcard)│
                                    └──────────┬──────────┘
                                               │
                                    ENS Registry (mainnet)
```

## DNS Integration

The on-chain registry is the **source of truth**. The Worker (D1) acts as a **cache** for fast DNS resolution:

```
User registers on-chain → Worker indexes event → D1 cache updated
                                                       ↓
                          DNS server queries Worker → Fast response
```

See `services/dns-server/CLAUDE.md` for DNS resolution details.

## Quick Reference

| What | Command |
|------|---------|
| Build | `forge build` |
| Test | `forge test` |
| Deploy | `forge script script/Deploy.s.sol --rpc-url $RPC --broadcast` |

---

# SurveyRegistry

Maps wallet + schemaId → IPFS CID for encrypted survey responses.

```solidity
register(schemaIdBytes32, responseCid, encryptionMode)
registerFor(user, surveyId, cid, encryptionMode, deadline, sig)  // gasless
getSurvey(wallet, schemaIdBytes32) → (cid, mode, updatedAt)
```

---

# ScrobbleLogV2

Append-only log of music plays with gasless batch submissions.

```solidity
scrobble(trackHash, timestamp, durationSecs, source)
batchScrobble(trackHashes[], timestamps[], durations[], sources[])
getScrobbles(user, offset, limit) → Scrobble[]
```
