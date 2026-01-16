# Neodate - Claude Code Instructions

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
neodate/
├── app/                    # SolidJS web app (you are here)
│   └── src/
│       ├── components/ui/  # Base components
│       ├── components/icons/
│       ├── pages/
│       └── lib/utils.ts    # cn(), haptic()
├── apps/
│   ├── android/            # Kotlin VPN app
│   └── desktop/            # Tauri VPN client
├── contracts/zama-fhe/     # FHE contracts
├── services/dns-server/    # Rust DNS gateway
├── workers/                # Cloudflare Workers
└── lit-actions/            # PKP actions
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

## Documentation

See [README.md](./README.md) for detailed architecture, database schema, claim system, and integration specs.
