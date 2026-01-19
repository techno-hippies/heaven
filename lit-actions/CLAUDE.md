# Lit Actions - Heaven

## Overview

Lit Actions that run on Lit Protocol's decentralized nodes. Primary use: **sponsored transactions** where a funded PKP pays gas on behalf of users.

## Sponsored Transaction Pattern

```
User EOA                    Lit Action                  Contract
   │                            │                           │
   │  1. Sign EIP-712 permit    │                           │
   │  (off-chain, no gas)       │                           │
   │ ──────────────────────────▶│                           │
   │                            │  2. PKP signs + broadcasts│
   │                            │     registerFor(user, sig)│
   │                            │ ─────────────────────────▶│
   │                            │                           │  3. Verify sig
   │                            │                           │     Write data
```

**Key benefits:**
- Users never need gas tokens
- PKP is decentralized (Lit nodes control it, not a single server)
- Non-custodial: PKP can only act with valid user signature
- Rate limiting via Lit's permission system (only permitted CIDs can use PKP)

## Current Actions

| Action | File | Purpose |
|--------|------|---------|
| Survey Sponsor | `actions/survey-registry-sponsor-v1.js` | Register surveys to SurveyRegistry |

## Deployed Resources

| Resource | Value |
|----------|-------|
| Sponsor PKP | `0x089fc7801D8f7D487765343a7946b1b97A7d29D4` |
| SurveyRegistry | `0xdf9ed085cf7f676ccce760c219ce118ab38ce8ca` (Base Sepolia) |
| Action CID | See `cids/dev.json` |

## Commands

```bash
bun scripts/mint-pkp.ts      # Mint new sponsor PKP
bun scripts/setup.ts survey  # Deploy action to IPFS + add permission
bun tests/survey-sponsor.test.ts --broadcast  # Test with real tx
```

## Updating an Action

1. Edit `actions/survey-registry-sponsor-v1.js`
2. Run `bun scripts/setup.ts survey` (uploads to IPFS, adds PKP permission)
3. Update app env: `VITE_SURVEY_SPONSOR_CID=<new CID>`

## Environment

`LIT_NETWORK` env var controls which Lit network to use:
- `naga-dev` - Free dev network (default)
- `naga-test` - Testnet (requires tstLPX)

## Files

```
lit-actions/
├── actions/                    # Lit Action source files
│   └── survey-registry-sponsor-v1.js
├── scripts/
│   ├── mint-pkp.ts            # Mint new PKP with EOA ownership
│   └── setup.ts               # Deploy action + add permission
├── tests/
│   ├── survey-sponsor.test.ts # E2E test for survey flow
│   └── shared/env.ts          # Network detection
├── output/
│   └── pkp-naga-dev.json      # PKP credentials
└── cids/
    └── dev.json               # Deployed action CIDs
```

## Funding the Sponsor PKP

The PKP needs ETH on the target chain (Base Sepolia) to pay for transactions:

```bash
# Check balance
cast balance 0x089fc7801D8f7D487765343a7946b1b97A7d29D4 --rpc-url https://sepolia.base.org

# Send from your wallet (using cast or any wallet)
cast send 0x089fc7801D8f7D487765343a7946b1b97A7d29D4 --value 0.01ether --rpc-url https://sepolia.base.org
```
