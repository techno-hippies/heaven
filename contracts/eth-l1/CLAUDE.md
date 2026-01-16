# ENS Subname Registry - L1

## Overview

Sell ENS subnames (e.g., `jordan.neodate.eth`) with native ENS resolution and `.eth.limo` support.

## Deployed Contracts

### Sepolia Testnet

| Contract | Address |
|----------|---------|
| SubnameRegistrar | [`0x98415bb59d5b4cF994aAAFFb0Ba4dBF16A72dedB`](https://sepolia.etherscan.io/address/0x98415bb59d5b4cF994aAAFFb0Ba4dBF16A72dedB) |
| Records | [`0xb6B1A8F7AE2f55C1dD1f4AC5Be7C0eEA63B54129`](https://sepolia.etherscan.io/address/0xb6B1A8F7AE2f55C1dD1f4AC5Be7C0eEA63B54129) |
| Resolver | [`0x7509DcA660b572Ee41Be08f73CB8f3908437858B`](https://sepolia.etherscan.io/address/0x7509DcA660b572Ee41Be08f73CB8f3908437858B) |

- **Parent ENS Name**: `neodate.eth` (Sepolia)
- **Price**: 0.001 ETH/year
- **Owner**: `0x03626B945ec2713Ea50AcE6b42a6f8650E0611B5`

### Mainnet

Not yet deployed.

## Quick Commands

```bash
# Install dependencies
forge install

# Run tests
forge test

# Deploy to Sepolia
source .env && forge script script/Deploy.s.sol:DeployScript --rpc-url $SEPOLIA_RPC_URL --broadcast -vvv

# Deploy to Mainnet
source .env && forge script script/Deploy.s.sol:DeployScript --rpc-url $MAINNET_RPC_URL --broadcast -vvv
```

## Architecture

```
┌─────────────────────┐      ┌─────────────────────┐
│  SubnameRegistrar   │─────►│      Records        │
│  (ERC-721 NFT)      │      │  (ENS-compatible)   │
│                     │      │                     │
│  - register/renew   │      │  - addr, text       │
│  - expiry/grace     │      │  - contenthash      │
└─────────────────────┘      └──────────┬──────────┘
                                        │
                             ┌──────────▼──────────┐
                             │      Resolver       │
                             │  (ENSIP-10 wildcard)│
                             └──────────┬──────────┘
                                        │
ENS Registry ◄──────────────────────────┘
(set resolver for neodate.eth → Resolver)
```

### Contracts

| Contract | Purpose |
|----------|---------|
| `SubnameRegistrar` | ERC-721 for subdomain ownership. Handles registration, renewal, expiry. |
| `Records` | ENS-compatible record storage (addr, text, contenthash). Authorization via NFT ownership. |
| `Resolver` | ENSIP-10 wildcard resolver. Reads from Records, set as resolver for parent ENS name. |

## Namehash (CRITICAL)

All contracts compute identical namehash for `label.parent.tld`:

```solidity
// namehash("jordan.neodate.eth")
bytes32 node = bytes32(0);
node = keccak256(abi.encodePacked(node, keccak256("eth")));      // TLD
node = keccak256(abi.encodePacked(node, keccak256("neodate"))); // parent
node = keccak256(abi.encodePacked(node, keccak256("jordan")));  // label
```

The Resolver receives DNS-encoded names and must convert to namehash:
- DNS format: `\x06jordan\x07neodate\x03eth\x00`
- Iterate through length-prefixed labels, hash iteratively

## ENS Integration

1. **Deploy** SubnameRegistrar, Records, Resolver
2. **Set Resolver** on ENS Registry for `neodate.eth`
3. **Users register** subnames via SubnameRegistrar
4. **Resolution** works natively via ENS + `.eth.limo`

## Resolution Flow

```
Client: "What's the addr for jordan.neodate.eth?"
    │
    ▼
ENS Registry: "Resolver for neodate.eth is 0x..."
    │
    ▼
Resolver.resolve(dnsEncode("jordan.neodate.eth"), addrSelector)
    │
    ▼
Resolver computes namehash, calls Records.addr(node)
    │
    ▼
Returns address
```

## Gotchas

1. **Namehash order**: Labels are hashed right-to-left (TLD first, then parent, then subname)

2. **DNS encoding**: Length-prefixed labels, null terminated. The Resolver must parse this correctly.

3. **ENS Registry**: You must own the parent name and set the resolver via ENS Registry, not just deploy contracts.

4. **ENSIP-10 Wildcard**: The Resolver implements `resolve(bytes,bytes)` for wildcard resolution of all subnames.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Var | Purpose |
|-----|---------|
| `PRIVATE_KEY` | Deployer wallet (with 0x prefix) |
| `SEPOLIA_RPC_URL` | Sepolia RPC endpoint |
| `MAINNET_RPC_URL` | Ethereum mainnet RPC |
| `PARENT_NAME` | e.g., "neodate" |
| `TLD` | e.g., "eth" |
| `PRICE_PER_YEAR` | Registration price in wei (default: 0.001 ETH) |
| `OWNER` | Contract owner address |
| `ETHERSCAN_API_KEY` | For contract verification (optional) |

## Key Files

```
contracts/eth-l1/
├── src/
│   ├── SubnameRegistrar.sol  # ERC-721 subdomain NFT
│   ├── Records.sol           # ENS-style records storage
│   └── Resolver.sol          # ENSIP-10 wildcard resolver
├── script/
│   └── Deploy.s.sol          # Deployment script
├── test/                     # Forge tests
├── foundry.toml
└── CLAUDE.md                 # This file
```

## Dependencies

- OpenZeppelin (ERC721, Ownable) via `forge install`

## Links

- [ENS Documentation](https://docs.ens.domains/)
- [ENSIP-10 Wildcard Resolution](https://docs.ens.domains/ensip/10)
- [ENS Namehash](https://docs.ens.domains/resolution/names#namehash)
