# Higher Power DNS Server

Rust DNS gateway with WireGuard VPN, domain blocking, and Tinybird analytics.

> **Status**: Working. Deployed to production VPN server.

## Features

- DNS interception with domain categorization
- Per-user blocking rules (synced from extension)
- WireGuard peer provisioning
- Tinybird event ingestion
- SIWE + JWT authentication

## Quick Start

```bash
# Build
cargo build --release

# Run with Docker
docker-compose up -d
```

## Environment Variables

See `.env.example` for required configuration.

## Architecture

See [`CLAUDE.md`](CLAUDE.md) for detailed architecture, auth flow, and deployment notes.

## Stack

- Rust (DNS server)
- PostgreSQL (users, devices, rules)
- WireGuard (VPN)
- Tinybird (analytics)
- Docker Compose (deployment)
