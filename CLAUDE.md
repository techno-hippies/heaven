# Heaven - Claude Code Instructions

## Package Manager

Use **bun** for all package operations:
- `bun install` / `bun add <pkg>` / `bun remove <pkg>`
- `bun run dev` / `bun run build` / `bun run check`

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | SolidJS, Tailwind CSS v4, Kobalte, Corvu |
| Icons | Phosphor (phosphor-icons-solid) |
| Build | Vite, Storybook |
| Desktop | Tauri (Rust) |
| Android | Kotlin, WireGuard |
| Backend | Cloudflare Workers (D1, R2), Rust (DNS) |
| Auth | Lit Protocol PKP + WebAuthn |
| Messaging | XMTP |
| Identity | Self.xyz |
| Matching | Zama fhEVM |

## Project Structure

```
heaven/
├── apps/
│   ├── website/            # SolidJS web app (main frontend)
│   │   └── src/
│   │       ├── ui/         # Design system primitives
│   │       ├── components/ # App components
│   │       ├── features/   # Feature modules (onboarding, messages, etc.)
│   │       ├── pages/      # Route pages (Home, Claim, etc.)
│   │       └── lib/        # Utilities (cn(), haptic())
│   ├── android/            # Kotlin VPN app
│   └── desktop/            # Tauri VPN client
├── contracts/
│   ├── base/               # Base chain contracts (ScrobbleLog)
│   └── fhevm/              # Zama fhEVM (Directory, Dating, PartnerLink)
├── services/dns-server/    # Rust DNS gateway
├── workers/
│   ├── api/                # Main API (candidates, likes, claim)
│   └── vpn-status/         # VPN connection check
├── subgraphs/              # The Graph indexers
│   └── dating/             # Likes/matches indexer
├── lit-actions/            # Lit Protocol PKP actions
└── docs/                   # Architecture docs
```

## Key Concepts

### Directory Tiers (4-state model)

| Tier | PKP State | Can Do |
|------|-----------|--------|
| `shadow` | No PKP | Appear in feed, receive likes (off-chain) |
| `handoff` | PKP with admin + WebAuthn | Complete onboarding |
| `claimed` | PKP owned (admin removed) | Browse verified profiles |
| `verified` | Claimed + Self.xyz + VPN | Full access (like, message, FHE) |

### Gating Rules

- **Liking**: `verified` only
- **Messaging**: `verified` + mutual match
- **Browsing**: `claimed` sees `verified`; `verified` sees all except `handoff`

## Coding Conventions

- Use Kobalte primitives for accessible UI
- Use Corvu for drawers/sheets
- Icons from `phosphor-icons-solid` only
- Utilities: `cn()` for class merging, `haptic()` for feedback
- Never store PII - use hashes and derived values
- Lazy-mint PKPs (don't mint until anchor verified)
- SolidJS: Use `<Show>` for conditional rendering, not early `if` returns

## Current Status

### Completed
- **Claim Flow** - Full shadow profile claim with Lit PKP minting
  - User visits `/c/:token` from email/notification
  - Verifies ownership via bio-edit or DM token
  - Creates WebAuthn passkey → mints PKP (3-5s)
  - Redirects to onboarding
- **API Worker** - Claim endpoints, shadow profiles, likes storage (D1)
- **Lit Integration** - WebAuthn auth, PKP minting, session management
- **FHE Profile Sponsorship** - Gasless on-chain profile creation
  - `DatingV3.setBasicsFor()` - Sponsor pays gas, user signs EIP-712 authorization
  - Lit Action (`dating-setbasics-sponsor-v1.js`) handles dual-signature flow
  - Real FHE encryption via `@zama-fhe/relayer-sdk`
  - Tested on Sepolia: [TX](https://sepolia.etherscan.io/tx/0x20c052fd0f8e098683671a532bde4adeb77349bb0eff92cc59b32f095f7a6390)

### In Progress
- **Onboarding** - UI steps built, needs PKP session wiring + contract mint integration

### Next Up
1. Wire onboarding to PKP auth (user authenticates at start)
2. Integrate FHE sponsorship into onboarding Phase 1 mint
3. Home feed showing profiles
4. Like/match flow with mutual match detection

## Development

```bash
# Website (port 3000)
cd apps/website && bun run dev

# API worker (port 8787)
cd workers/api && bun run dev

# Seed test data
cd workers/api && bun run seed
wrangler d1 execute heaven-api --local --file=./scripts/seed.sql --yes

# Test claim flow
open http://localhost:3000/#/c/test-alex
# DM code: HVN-ALEX01
```

## Documentation

See [README.md](./README.md) for detailed architecture, database schema, claim system, and integration specs.
See [apps/website/CLAUDE.md](./apps/website/CLAUDE.md) for frontend-specific conventions.
