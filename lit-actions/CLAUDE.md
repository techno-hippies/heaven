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
| Scrobble Batch Sponsor | `actions/scrobble-batch-sign-v2.js` | Pin scrobbles to IPFS and commit to ScrobbleLogV2 |
| Dating SetBasics Sponsor | `actions/dating-setbasics-sponsor-v1.js` | Sponsor FHE profile creation on DatingV3 |

## Deployed Resources

| Resource | Value |
|----------|-------|
| Sponsor PKP | `0x089fc7801D8f7D487765343a7946b1b97A7d29D4` |
| SurveyRegistry | `0xdf9ed085cf7f676ccce760c219ce118ab38ce8ca` (Base Sepolia) |
| ScrobbleLogV2 | `0x1AA06c3d5F4f26C8E1954C39C341C543b32963ea` (Base Sepolia) |
| DatingV3 | `0xcAb2919b79D367988FB843420Cdd7665431AE0e7` (Sepolia) |
| Action CIDs | See `cids/dev.json` |

## Commands

```bash
bun scripts/mint-pkp.ts       # Mint new sponsor PKP
bun scripts/setup.ts survey   # Deploy survey action to IPFS + add permission
bun scripts/setup.ts scrobble # Deploy scrobble action to IPFS + add permission
bun scripts/setup.ts datingSetbasicsSponsor  # Deploy dating action
bun tests/survey-sponsor.test.ts --broadcast   # Test survey flow
bun tests/scrobble-batch-sign.test.ts          # Test scrobble flow
bun tests/dating-setbasics-fhe.test.ts         # Test FHE profile (dry run)
bun tests/dating-setbasics-fhe.test.ts --broadcast  # Test FHE profile (real)
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
│   ├── survey-registry-sponsor-v1.js
│   ├── scrobble-batch-sign-v2.js
│   └── dating-setbasics-sponsor-v1.js  # FHE profile sponsorship
├── scripts/
│   ├── mint-pkp.ts            # Mint new PKP with EOA ownership
│   └── setup.ts               # Deploy action + add permission
├── tests/
│   ├── survey-sponsor.test.ts       # E2E test for survey flow
│   ├── scrobble-batch-sign.test.ts  # E2E test for scrobble flow
│   ├── dating-setbasics-fhe.test.ts # Real FHE encryption test
│   └── shared/env.ts                # Network detection
├── keys/
│   └── dev/scrobble/          # Encrypted Filebase API key
├── output/
│   └── pkp-naga-dev.json      # PKP credentials
└── cids/
    └── dev.json               # Deployed action CIDs
```

## Funding the Sponsor PKP

The PKP needs ETH on target chains to pay for transactions:

```bash
# Check balance (Base Sepolia for surveys/scrobbles)
cast balance 0x089fc7801D8f7D487765343a7946b1b97A7d29D4 --rpc-url https://sepolia.base.org

# Check balance (Sepolia for FHE/dating)
cast balance 0x089fc7801D8f7D487765343a7946b1b97A7d29D4 --rpc-url https://ethereum-sepolia-rpc.publicnode.com

# Send from your wallet
cast send 0x089fc7801D8f7D487765343a7946b1b97A7d29D4 --value 0.05ether --rpc-url <RPC_URL>
```

## Dating SetBasics Sponsor

Sponsors gasless FHE profile creation on `DatingV3`. Users sign EIP-712 authorization, sponsor PKP pays gas.

**Flow:**
1. Client encrypts profile data using `@zama-fhe/relayer-sdk`
2. User's PKP signs EIP-712 authorization (dataHash + deadline + nonce)
3. Lit Action builds `setBasicsFor()` calldata with user signature
4. Sponsor PKP signs and broadcasts transaction

**Contract fields (all FHE-encrypted):**
- `encAge` (euint8) - User's age
- `encGenderId` (euint8) - Gender identity (1-5)
- `encDesiredMask` (euint16) - 5-bit bitmask of desired genders
- `encShareAge` (ebool) - Whether to reveal age on match
- `encShareGender` (ebool) - Whether to reveal gender on match

**Verified working:** [Sepolia TX](https://sepolia.etherscan.io/tx/0x20c052fd0f8e098683671a532bde4adeb77349bb0eff92cc59b32f095f7a6390)
