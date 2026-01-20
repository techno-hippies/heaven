# services

Backend services for Higher Power.

| Service | Description | Status |
|---------|-------------|--------|
| [`xmtp-agent/`](xmtp-agent/) | XMTP messaging agent with Honcho memory | WIP |
| [`dns-server/`](dns-server/) | Rust DNS gateway with VPN + analytics | Working |

## xmtp-agent

Privacy-first AI accountability agent via XMTP encrypted messaging.

```bash
cd xmtp-agent
npm install
npm run dev
```

## dns-server

Rust DNS server with WireGuard VPN and Tinybird analytics.

```bash
cd dns-server
cargo build
docker-compose up -d
```
