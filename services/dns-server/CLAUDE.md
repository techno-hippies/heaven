# dns-server - Known Issues & TODOs

## Security Issues

### High Priority

1. ~~**Auth effectively disabled**~~ - **FIXED**: SIWE + JWT auth implemented
   - `POST /auth/challenge` - generates nonce and SIWE message (stored in memory with 5min TTL)
   - `POST /auth/verify` - verifies SIWE signature, creates/gets user, issues JWT (7 day expiry)
   - `POST /devices` - requires Bearer JWT, extracts user_id from claims
   - `GET /devices/:id/wg-config` - requires Bearer JWT, verifies device ownership
   - Files: `src/auth/mod.rs`, `src/api/mod.rs`

2. **Network wiring issue** - ~~dns-server must bind :53 inside the WireGuard network namespace to preserve client IPs~~
   - **FIXED**: CoreDNS configured to use port 5353 via custom Corefile, freeing :53 and :8080 for dns-server
   - Uses `network_mode: "service:wireguard"` and `DNS_LISTEN=0.0.0.0:53`
   - Note: `wg-config/coredns/Corefile` must contain `.:5353 { ... }` to avoid port conflicts

### Medium Priority

3. **Tinybird ingestion drops events** - ~~Queue is drained before sending~~
   - **FIXED**: 3 retries with exponential backoff, requeue on failure, 10K event cap (drops oldest)
   - **FIXED**: Accurate sent counts (excludes serialization failures), empty-body short-circuit
   - File: `src/ingest/mod.rs`

4. **VPN IP allocation race condition** - ~~Uses `MAX + 1` without locking/transactions~~
   - **FIXED**: Now uses `pg_advisory_xact_lock` + transaction + subnet-scoped query
   - File: `src/api/mod.rs:167`

5. **User cache not warmed at startup** - ~~Existing devices map to "unknown" until re-register~~
   - **FIXED**: Cache hydrated from DB on startup using `host(vpn_ip)` to strip CIDR mask
   - Files: `src/main.rs:39`, `src/users/mod.rs:48`

6. ~~**WireGuard peer provisioning**~~ - **FIXED**: Peers are added to WireGuard when devices are created
  - Uses `wg set wg0 peer <pubkey> allowed-ips <ip>/32` (shares network namespace with wireguard container)
  - **Also adds route**: `ip route add <vpn_ip> dev wg0` (required for response routing!)
  - Persists config by updating `/config/wg_confs/wg0.conf` (shared volume)
  - `dns-server` has `NET_ADMIN` and mounts `./wg-config:/config`
  - Dockerfile includes `wireguard-tools` package
  - File: `src/api/mod.rs:441-489`

### Low Priority

7. **Upstream DNS UDP-only** - Doesn't validate response source/ID, truncation/spoofing possible
   - File: `src/dns/upstream.rs:10`
   - TODO: Add response validation, consider TCP fallback

8. **WireGuard config placeholder** - ~~Response ignores stored `wg_pubkey`~~
   - **FIXED**: Now uses `WG_SERVER_PUBKEY` and `WG_SERVER_ENDPOINT` env vars
   - File: `src/api/mod.rs:324`

## Required Environment Variables

```bash
# Required
TINYBIRD_TOKEN=p.xxx          # Tinybird admin token (US East)
HMAC_SECRET=xxx               # Secret for domain hashing (32+ chars)
JWT_SECRET=xxx                # Secret for JWT tokens (32+ chars)
DATABASE_URL=postgres://...   # PostgreSQL connection (auto-configured in compose)

# WireGuard config generation
WG_SERVER_PUBKEY=xxx          # Get from: cat wg-config/server/publickey
SERVER_IP=144.126.205.242     # Public IP of VPN server

# Optional (have defaults)
VPN_SUBNET=10.13.13.0/24      # Must match WireGuard INTERNAL_SUBNET
AUTH_DOMAIN=hp-dns-gw.local   # Domain for SIWE messages
TINYBIRD_ENDPOINT=https://api.us-east.tinybird.co
```

## Key Hygiene (Defer Until Onboarding)

- Peer configs contain private keys. Keep them off-repo and generate them only on the server.
- If a peer config was ever written locally, rotate that peer before onboarding users.
- `.gitignore` should exclude `*.conf`, `peer_*.conf`, and `wg-config/peer_*`.

## Testing Gaps

- No tests for auth flow
- No tests for IP allocation
- No tests for upstream forwarding behavior
- No tests for Tinybird error handling

## Auth Flow

```
Client                              Server
  │                                    │
  │ 1. POST /auth/challenge            │
  │    { address: "0x..." }            │
  │ ──────────────────────────────────>│
  │                                    │
  │    { nonce, message }              │
  │ <──────────────────────────────────│
  │                                    │
  │ 2. Sign message with Lit PKP       │
  │    (EIP-191 personal_sign)         │
  │                                    │
  │ 3. POST /auth/verify               │
  │    { message, signature }          │
  │ ──────────────────────────────────>│
  │                                    │ Verify SIWE sig
  │                                    │ Create/get user
  │    { user_id, token, wallet }      │ Issue JWT
  │ <──────────────────────────────────│
  │                                    │
  │ 4. POST /devices                   │
  │    Authorization: Bearer <jwt>     │
  │    { device_name, wg_pubkey }      │
  │ ──────────────────────────────────>│
  │                                    │ Extract user from JWT
  │                                    │ Allocate VPN IP
  │                                    │ Add peer to WireGuard
  │    { device_id, vpn_ip,            │
  │      wg_provisioned }              │
  │ <──────────────────────────────────│
  │                                    │
  │ 5. GET /devices/:id/wg-config      │
  │    Authorization: Bearer <jwt>     │
  │ ──────────────────────────────────>│
  │                                    │ Verify device ownership
  │    { config: "[Interface]..." }    │
  │ <──────────────────────────────────│
```

## Architecture Notes

### Current Stack (on 144.126.205.242)
```
┌─────────────────────────────────────────────────────┐
│ hp-wireguard (linuxserver/wireguard)                │
│   - Port 51820/udp (WireGuard)                      │
│   - Port 8080 (API passthrough)                     │
│   - wg0 interface: 10.13.13.1                       │
│   - INTERNAL_SUBNET: 10.13.13.0/24                  │
│   - CoreDNS on port 5353 (ports 53/8080 free)       │
├─────────────────────────────────────────────────────┤
│ dns-server (network_mode: service:wireguard)        │
│   - DNS on 0.0.0.0:53 (direct bind)                 │
│   - API on 0.0.0.0:8080                             │
│   - Upstream: resolver:53                           │
│   - SIWE + JWT auth                                 │
│   - WireGuard peer provisioning                     │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│ hp-resolver (jamesstevens/handshake-volume-resolver)│
│   - ICANN + Handshake + .eth DNS                    │
│   - "Prefer ICANN" mode                             │
│   - Port 53 (internal only, 172.20.0.10)            │
├─────────────────────────────────────────────────────┤
│ hp-hsd (handshakeorg/hsd)                           │
│   - Full Handshake node                             │
│   - Authoritative port 5349                         │
│   - Syncs blockchain (~3GB)                         │
│   - **Must use --no-sig0** (see HSD SIG0 Fix below) │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│ hp-postgres (postgres:16-alpine)                    │
│   - Port 5432 (localhost only)                      │
│   - Database: hp, User: hp                          │
└─────────────────────────────────────────────────────┘
```

### Data Flow
1. VPN client connects → WireGuard assigns IP (10.13.13.x)
2. Client DNS query → dns-server on 10.13.13.1:53
3. dns-server: categorize domain → log event → forward to resolver
4. Resolver handles ICANN/Handshake/ETH domains transparently
5. Events batched and sent to Tinybird every 5s

### Tinybird Pipeline (WORKING)
- **Datasource**: `dns_events` - stores all DNS queries
- **Materialized View**: `user_category_daily_mv` - daily category counts per user
- **Endpoints**: `trends`, `vector`, `context` - API pipes for analytics
- Workspace: `nd1` (US East)

### Client IP Mapping (WORKING)
CoreDNS configured to use port 5353, freeing :53 for dns-server. VPN client queries show actual VPN IPs (10.13.13.x) and map to registered wallets.

### HSD SIG0 Fix (REQUIRED)
**Problem**: HSD (Handshake daemon) by default adds SIG0 signatures to DNS responses. When these responses are forwarded through `root_proxy` to BIND (in hp-resolver), BIND fails with "bad label type" errors because it doesn't understand SIG0 records in the answer section.

**Symptom**: Handshake TLDs return SERVFAIL, logs show:
```
root_proxy: error for shakestation: bad label type
```

**Fix**: Add `--no-sig0` flag to HSD in docker-compose.yml:
```yaml
hp-hsd:
  command: ["--ns-host=0.0.0.0", "--ns-port=5349", "--no-wallet", "--no-sig0"]
```

**Verification**:
```bash
dig @172.20.0.10 shakestation A +short  # Should return IP, not SERVFAIL
```

### User Blocking Rules (WORKING)
- **Database**: `user_rules` table stores blocked domains per user
- **API**: `POST /rules` with `{ domains: string[] }` - replaces user's blocked domains
- **API**: `GET /rules` - returns user's current blocked domains
- **Cache**: Rules cached in-memory, refreshed on update
- **Blocking**: Blocked domains return `0.0.0.0` (A) or `::` (AAAA)
- File: `src/rules/mod.rs`

### Extension Integration (WORKING)
The browser extension syncs blocked domains to dns-server automatically:
- Extension module: `apps/extension/src/lib/dns-vpn/index.ts`
- Auth: Uses Lit PKP to sign SIWE challenge, gets JWT
- JWT stored in `chrome.storage.local` (7-day expiry, refreshes at 6 days)
- Sync triggers: `saveSiteRule()`, `deleteSiteRule()`, `importSiteRules()`
- Blocked = `timeLimitMinutes === 0` in SiteRule

### Client VPN Config
**Important**: Use DNS-only config (AllowedIPs = DNS server only). Server auto-detects platform from `device_name` and generates the appropriate config.

#### Linux (Tauri Desktop App)
Linux uses PostUp/PreDown scripts because wg-quick's `DNS=` conflicts with systemd-resolved. **DNS must be set on the VPN interface** so systemd-resolved routes queries correctly (not the default interface, as the DNS server is only reachable via VPN).

Additionally, enables `ResolveUnicastSingleLabel=yes` for Handshake TLDs (single-label names like `shakestation`).

```ini
[Interface]
PrivateKey = <client_private_key>
Address = 10.13.13.X/32
PostUp = /usr/bin/mkdir -p /etc/systemd/resolved.conf.d && /usr/bin/printf '[Resolve]\nResolveUnicastSingleLabel=yes\n' > /etc/systemd/resolved.conf.d/hp-single-label.conf && /usr/bin/systemctl restart systemd-resolved; /usr/bin/resolvectl dns %i 10.13.13.1; /usr/bin/resolvectl domain %i "~."; /usr/bin/resolvectl flush-caches
PreDown = /usr/bin/rm -f /etc/systemd/resolved.conf.d/hp-single-label.conf; /usr/bin/resolvectl revert %i || true; /usr/bin/systemctl restart systemd-resolved || true

[Peer]
PublicKey = <server_public_key>
AllowedIPs = 10.13.13.1/32
Endpoint = 144.126.205.242:51820
PersistentKeepalive = 25
```
- PostUp: Enable single-label resolution, set DNS on VPN interface (`%i`), set routing domain `~.`
- PreDown: Clean up single-label config, revert VPN interface DNS
- Uses absolute paths for wg-quick compatibility
- File: `src/api/mod.rs:984-997`

**Why VPN interface, not default interface?**
systemd-resolved binds DNS queries to the interface that owns the DNS server. Since 10.13.13.1 is only reachable via the VPN interface, DNS must be configured there. If set on WiFi/Ethernet, queries fail because systemd-resolved tries to reach 10.13.13.1 via the wrong interface.

#### Android (Native WireGuard App)
Android uses the standard `DNS=` approach (no systemd-resolved conflicts):
```ini
[Interface]
PrivateKey = <client_private_key>
Address = 10.13.13.X/32
DNS = 10.13.13.1

[Peer]
PublicKey = <server_public_key>
AllowedIPs = 10.13.13.1/32
Endpoint = 144.126.205.242:51820
PersistentKeepalive = 25
```
- Detected by: `device_name.contains("android")` (case-insensitive)
- File: `src/api/mod.rs:943-957`

#### Why DNS-Only Routing?
- `AllowedIPs = 10.13.13.1/32` routes ONLY DNS through VPN
- Regular HTTP/HTTPS bypasses VPN, uses normal internet
- `AllowedIPs = 0.0.0.0/0` breaks internet (no NAT for HTTP traffic)

### Handshake TLD Support (PARTIAL - Jan 2025)

Handshake DNS resolution works, but browser limitations prevent full usage.

**What works:**
- DNS resolution of all Handshake TLDs → returns correct A records
- Dotted Handshake domains in browsers (e.g., `nathan.woodburn/`, `d/`)
- TLSA/DANE records resolve correctly
- Single-label name resolution via `ResolveUnicastSingleLabel=yes`
- Command-line tools (curl, dig) work with all TLDs

**What doesn't work: Single-label TLDs in browsers**
- `shakestation` DNS resolves correctly (tcpdump confirms response received)
- Browsers show `ERR_NAME_NOT_RESOLVED` despite DNS success
- Root cause: Chrome/Firefox/Brave block single-label hostnames at application layer
- This is browser security policy, NOT a DNS issue

**What doesn't work: HTTPS/DANE**
- Certificate Authorities only issue certs for ICANN TLDs
- TLSA records resolve but browsers don't validate them
- Result: HTTPS requires accepting self-signed cert warnings

**Testing verification:**
```bash
# DNS works (both resolve correctly)
dig @10.13.13.1 shakestation +short    # → 3.93.226.92
dig @10.13.13.1 nathan.woodburn +short # → returns IP

# TLSA works
dig @10.13.13.1 _443._tcp.shakestation TLSA +short  # → TLSA record

# Browser test
# nathan.woodburn/ → Works (has dot, browser treats as domain)
# shakestation/    → ERR_NAME_NOT_RESOLVED (no dot, browser blocks)
```

**Potential solutions (not implemented):**
- Browser extension to force single-label navigation
- Local proxy (PAC file) to rewrite requests
- letsdane proxy for DANE/TLSA validation
- Custom CA for HNS domains (requires user trust)

**Current recommendation:** Use dotted Handshake domains (subdomains) or access via curl/CLI.

### .heaven TLD Resolution (IMPLEMENTED)

The dns-server now intercepts queries for `.heaven` TLD and resolves them via the Heaven Names API.

**Environment Variables:**
```bash
HEAVEN_API_URL=https://api.heaven.xyz   # Heaven Worker API base URL
HEAVEN_DNS_SECRET=xxx                    # Bearer token (must match Worker's DNS_SHARED_SECRET)
HEAVEN_GATEWAY_IP=144.126.205.242        # Gateway IP for A records (optional, this is default)
```

**Behavior:**
| Query | Result |
|-------|--------|
| `foo.heaven` (active) | NOERROR with A + TXT records |
| `foo.heaven` (expired/unregistered) | NXDOMAIN with SOA |
| `foo.bar.heaven` (multi-level) | NXDOMAIN |
| `heaven` (apex) | NOERROR with gateway A record |
| API error | SERVFAIL (fail closed) |

**Features:**
- Positive caching (300s) and negative caching (60s) from API response
- Request coalescing to prevent stampedes
- EDNS preservation for larger UDP responses
- Proper DNS flags (AA=false, RA=true, RD preserved)

**Files:** `src/dns/heaven.rs`, `src/config.rs`

### Not Yet Implemented
- Interest vector calculation
- User matching algorithm
- Client IP preservation (ECS)
- Auto-start WireGuard on container restart (needs `wg-quick up wg0` after restart)
