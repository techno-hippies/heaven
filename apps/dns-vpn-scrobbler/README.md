# Heaven DNS VPN

<p align="center">
  <img src="public/images/logo-1024x1024.png" alt="Heaven Logo" width="150">
</p>

Desktop VPN client with music scrobbling. Routes DNS through Heaven's servers for Handshake (.⭐, .🌀) and Base (.heaven) domain resolution.

**Platforms**: Linux first, others coming after testnet.

## Features

- **DNS VPN** - WireGuard tunnel with Handshake/ENS/Base resolution
- **Music Scrobbling** - Detect plays via MPRIS, batch to IPFS + on-chain
- **Passkey Auth** - Lit Protocol PKP with WebAuthn

## Download

See [Releases](https://github.com/your-org/heaven/releases) for `.deb` and `.AppImage` builds.

## What It Does

### DNS Resolution

Routes all DNS through Heaven's server, enabling:

| Domain Type | Example | Status |
|-------------|---------|--------|
| ICANN | `google.com` | ✅ Works |
| Handshake (dotted) | `nathan.woodburn/` | ✅ Works |
| Base L2 | `alice.heaven` | ✅ Works |
| Handshake (single-label) | `shakestation` | ⚠️ DNS works, browsers block |

### Music Scrobbling

1. Detects music via Linux MPRIS (Spotify, Rhythmbox, VLC, etc.)
2. Queues plays locally in SQLite
3. Batches to IPFS daily
4. Commits batch hash on-chain (Base L2)
5. **You never pay gas** - sponsor PKP covers fees

## Development

```bash
# Install dependencies
bun install

# Run in dev mode
bun run tauri dev

# Build release
bun run tauri build
```

Requires Rust toolchain and Tauri CLI.

## Tech Stack

- **Frontend**: SolidJS, Tailwind CSS v4
- **Desktop**: Tauri v2 (Rust)
- **VPN**: WireGuard via wg-quick
- **Auth**: Lit Protocol PKP
- **Storage**: IPFS (Filebase)
- **Chain**: Base L2

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Tauri Client   │────►│  WireGuard VPN   │────►│  VPN Server     │
│                 │     │                  │     │                 │
│ - MPRIS listen  │     │ - 10.13.13.x IP  │     │ - Handshake     │
│ - SQLite queue  │     │ - DNS routing    │     │ - ENS/Base      │
│ - Lit signing   │     │                  │     │ - Tinybird logs │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Known Limitations

1. **Single-label TLDs**: Browsers block hostnames without dots (e.g., `shakestation`). DNS resolves correctly but Chrome/Firefox refuse to navigate.

2. **DANE/TLSA**: Records resolve but browsers don't validate them natively.

## License

MIT
