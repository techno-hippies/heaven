# Heaven

Privacy-preserving dating using Zama's Fully Homomorphic Encryption (fhEVM). Part of the Higher Power ecosystem.

> **Status**: Work in progress.

## Overview

Enables encrypted compatibility matching without revealing user preferences or dealbreakers. Built on Zama's fhEVM for Sepolia testnet.

## Contracts

| Contract | Purpose |
|----------|---------|
| `DatingV2.sol` | Core FHE matching with encrypted attributes |
| `Directory.sol` | Public profile data (avatar, region) |

## Privacy Model

| Category | Storage | On Match |
|----------|---------|----------|
| **Public** | Directory (plaintext) | Visible |
| **Secret Criteria** | Encrypted, revealable | "We matched on X" |
| **Secret Dealbreakers** | Encrypted, never revealed | Nothing |

## Quick Start

```bash
# Install
npm install

# Compile
npx hardhat compile

# Test
npx hardhat test test/DatingV2.ts

# Deploy to local
npx hardhat node
npx hardhat deploy --network localhost
```

## Client

See [`client/`](client/) for TypeScript encoding helpers and SolidJS UI components.

```bash
cd client
bun install
bun run storybook
```

## Documentation

- [`CLAUDE.md`](CLAUDE.md) - Detailed architecture and attribute layout
- [`ARCHITECTURE.md`](ARCHITECTURE.md) - System design
- [Zama fhEVM Docs](https://docs.zama.ai/fhevm)

## License

MIT
