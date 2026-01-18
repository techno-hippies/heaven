# Neodate Lit Actions

Lit Protocol actions for sponsored on-chain writes without a server-held private key.

## Survey Registry Sponsor

Signs and broadcasts `SurveyRegistry.registerFor(...)` using a funded service PKP.
The action is permissioned to a single registry contract on Base Sepolia.

### Security Model

- No private key on a server; signing happens inside Lit nodes.
- Action is bound to a specific IPFS CID.
- Action only builds calldata for the configured registry address.

### Deployment

1. Mint a PKP (requires tstLPX tokens):
   ```bash
   bun scripts/mint-pkp.ts
   ```

2. Update the PKP constants in `actions/survey-registry-sponsor-v1.js`.

3. Deploy the action:
   ```bash
   bun scripts/setup.ts survey
   ```

4. Fund the PKP with Base Sepolia ETH.

### Client Inputs

The action expects the user signature and survey payload. Transaction parameters
are fetched inside the Lit Action.

```ts
{
  user,        // user PKP address
  surveyId,    // bytes32
  cid,         // IPFS CID
  encryptionMode, // 0=none, 1=matchOnly, 2=tiered
  deadline,    // unix timestamp (seconds)
  userSig,     // EIP-712 signature from user PKP
}
```

You can pass `dryRun: true` to skip broadcast and return the signed transaction.

## Directory Structure

```
lit-actions/
├── actions/                    # Lit Action source files
│   └── survey-registry-sponsor-v1.js
├── scripts/                    # Deployment scripts
│   ├── setup.ts               # Full deployment orchestrator
│   ├── mint-pkp.ts            # Mint new PKP
│   ├── upload-action.ts       # Upload to IPFS via Pinata
│   ├── add-permission.ts      # Grant PKP permission for CID
│   └── verify.ts              # Verify deployment
├── config/                     # Network configs
├── cids/                       # Deployed CIDs by environment
└── output/                     # PKP credentials
```
