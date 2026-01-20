# Heaven

<p align="center">
  <img src="logo.png" alt="Heaven Logo" width="200">
</p>

Privacy-first dating with encrypted compatibility matching, decentralized identity, and DNS-based discovery.

## Components

| Component | Description |
|-----------|-------------|
| [Website](apps/website/) | Core experience - profiles, surveys, store, chat with matches |
| [DNS VPN](apps/dns-vpn-scrobbler/) | Desktop VPN + music scrobbling (Linux) |
| [Android](apps/android/) | Android VPN + scrobbling (WIP) |
| [DNS Server](services/dns-server/) | Rust DNS gateway |
| [Workers](workers/) | Cloudflare Workers (API, VPN status) |
| [Contracts](contracts/) | Base (.heaven), Ethereum (.⭐ .🌀), Zama fhEVM |
| [Lit Actions](lit-actions/) | Sponsored transactions (Naga dev) |

## Key Technologies

| Tech | Purpose |
|------|---------|
| [Zama fhEVM](https://docs.zama.ai/) | Fully homomorphic encryption for private compatibility matching |
| [Handshake](https://handshake.org/) | Decentralized DNS for `.⭐` and `.🌀` TLDs |
| [handshake-volume-resolver](https://github.com/james-stevens/handshake-volume-resolver) | HNS + ICANN DNS resolution (fork) |
| [Lit Protocol](https://developer.litprotocol.com/) | PKP wallets + Lit Actions for sponsored tx + access control encryption |
| [Filebase](https://filebase.com/) | IPFS pinning for profiles, surveys, scrobbles |
| [XMTP](https://xmtp.org/) | E2E encrypted messaging between matches |
| [Self.xyz](https://self.xyz/) | Passport-based identity verification |
| [Tauri](https://tauri.app/) | Desktop app framework (Rust + web frontend) |
| [Tinybird](https://tinybird.co/) | DNS analytics pipeline |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLIENTS                                                             │
│  Website (SolidJS) · Desktop VPN (Tauri) · Android (Kotlin)         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐
│ Cloudflare      │  │ DNS VPN Server  │  │ Decentralized           │
│ Workers (D1)    │  │ (Rust)          │  │                         │
│                 │  │                 │  │ Lit Protocol (PKP/Actions)
│ • api           │  │ • WireGuard     │  │ XMTP (messaging)        │
│ • vpn-status    │  │ • HNS/ENS/Base  │  │ Zama fhEVM (matching)   │
│                 │  │ • Tinybird      │  │ Self.xyz (identity)     │
└─────────────────┘  └─────────────────┘  └─────────────────────────┘
```

### DNS Resolution

```
VPN Client → dns-server (Rust) ─┬─ .heaven ────→ Heaven API → Base L2 registry
                                │
                                └─ all else ───→ hp-resolver → HSD (Handshake)
                                                             → ICANN upstream
```

- **`.heaven`** - Intercepted by dns-server, resolved via Heaven API (queries Base L2 on-chain registry)
- **Handshake TLDs** (`.⭐`, `.🌀`, etc.) - Forwarded to [hp-resolver](https://github.com/james-stevens/handshake-volume-resolver) → [HSD](https://github.com/handshake-org/hsd) full node
- **ICANN/ENS** - Forwarded to hp-resolver → upstream resolvers

### Music Scrobbling

Desktop and Android apps detect music playback, batch plays locally, then commit to IPFS + on-chain via Lit Actions. No Spotify integration - we capture from any player (MPRIS on Linux, MediaSession on Android).

## Name Registries

ENS-compatible subname registries with on-chain ownership (ERC-721 NFTs).

| Chain | TLD | Price | Notes |
|-------|-----|-------|-------|
| Base | `.heaven` | FREE | Platform-sponsored, 5+ chars |
| Ethereum | `.⭐` `.🌀` | 0.01+ ETH | Handshake TLDs, length-based pricing |

Both use `MultiTldSubnameRegistrarV3` + `RecordsV2` + ENSIP-10 wildcard `Resolver`. Names resolve via ENS at `*.hnsbridge.eth`.

See [contracts/base/](contracts/base/) and [contracts/ethereum/](contracts/ethereum/).

## FHE Matching (Zama)

Encrypted compatibility matching on [Zama fhEVM](https://docs.zama.ai/) (Sepolia testnet).

| Contract | Purpose |
|----------|---------|
| DatingV3 | FHE-encrypted age, gender, preferences |
| Directory | Public profile metadata |

Users encrypt preferences client-side with `@zama-fhe/relayer-sdk`. Compatibility computed on encrypted values - neither party reveals preferences unless matched.

## IPFS + Lit Encryption

User data is stored on IPFS with tiered encryption via Lit Protocol access control:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Client                                                              │
│    ├── Encrypts sensitive tiers with Lit Protocol                   │
│    ├── Pins to Filebase (IPFS) via Lit Action                       │
│    └── Registers CID on-chain (SurveyRegistry, RecordsV2)           │
└─────────────────────────────────────────────────────────────────────┘
```

| Tier | Visibility | Encryption |
|------|------------|------------|
| **Public** | Anyone | None |
| **Match-Only** | Matched pairs | Lit (`areMatched()` condition) |
| **Private** | Owner only | Lit (owner address condition) |

**Storage**: [Filebase](https://filebase.com/) provides IPFS pinning with Filecoin backup. Users who want additional redundancy can pin the CID themselves via Filecoin/Filebase.

## Lit Actions

Sponsored transactions without server-held private keys. Running on **Naga dev** network.

| Action | Purpose |
|--------|---------|
| Profile pin | Encrypt + pin profile data to Filebase IPFS |
| Survey sponsor | Gasless survey submissions to SurveyRegistry |
| Scrobble batch | IPFS pin + on-chain commit to ScrobbleLogV2 |
| FHE profile | Sponsor pays gas for DatingV3.setBasicsFor() |

Sponsor PKP: `0x089fc7801D8f7D487765343a7946b1b97A7d29D4`

## Development

```bash
# Website (port 3000)
cd apps/website && bun install && bun run dev

# API worker (port 8787)
cd workers/api && bun install && bun run dev

# Desktop app
cd apps/dns-vpn-scrobbler && bun install && bun run tauri dev
```

## Status

| Feature | Status |
|---------|--------|
| Claim flow | ✅ Complete |
| PKP + Lit Actions | ✅ Working (Naga dev) |
| FHE profiles | ✅ Working (Zama Sepolia) |
| DNS VPN | ✅ Linux working |
| Music scrobbling | ✅ Complete |
| Survey | 🚧 In progress |
| Store | 🚧 In progress |
| Android VPN | 🚧 In progress |
| Onboarding | 🚧 In progress |
