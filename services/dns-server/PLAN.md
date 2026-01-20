# DNS VPN Dating Stack

> Interest-based dating via anonymized DNS traffic analysis

## Overview

A VPN gateway that logs per-wallet DNS queries, categorizes browsing interests, and matches users based on shared interests rather than vanity metrics.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VPN NODE (your server)                      │
│                                                                     │
│  Users ──▶ WireGuard ──▶ hp-dns-gw ──▶ handshake-volume-resolver   │
│  (wallet)   :51820        :53            :5353                      │
│                            │                     │                  │
│                            │                     ▼                  │
│                            │               ┌─────────┐              │
│                            │               │   hsd   │              │
│                            │               │ (HNS)   │              │
│                            │               └─────────┘              │
│                            ▼                                        │
│                     ┌─────────────┐                                 │
│                     │  Tinybird   │◀── NDJSON events                │
│                     │  (analytics)│                                 │
│                     └──────┬──────┘                                 │
│                            │                                        │
│                            ▼                                        │
│                     ┌─────────────┐                                 │
│                     │  Matching   │                                 │
│                     │  Service    │                                 │
│                     └─────────────┘                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Components

| Component | Tech | Purpose |
|-----------|------|---------|
| VPN | WireGuard | Full-tunnel, all traffic through node |
| DNS Gateway | hp-dns-gw (Rust) | Log queries, categorize, forward |
| Upstream Resolver | handshake-volume-resolver | ICANN + Handshake + ETH |
| HNS Node | hsd | Handshake blockchain |
| User DB | Postgres | Wallets, devices, WG peers |
| Analytics | Tinybird | Event ingestion, aggregation, APIs |
| Matching | Custom service | ANN search on interest vectors |

## Identity Model

```
wallet_address (0x...)
    └── user_id (UUID)
         └── device_id (UUID)
              └── wg_pubkey + vpn_ip (10.8.0.x)
```

**Auth flow:**
1. `POST /auth/challenge` → nonce
2. Client signs nonce with wallet
3. `POST /auth/verify` → user_id + API token
4. `POST /devices` → WG config with assigned VPN IP

**DNS attribution:**
- Source VPN IP → device_id → user_id → wallet_address
- Static IP per device makes correlation trivial

## Data Flow

### 1. DNS Query Path

```
Client query (10.8.0.5:random → 10.8.0.1:53)
    │
    ▼
hp-dns-gw receives query
    │
    ├── Parse qname, qtype
    ├── Lookup user by src_ip (10.8.0.5 → user_id)
    ├── Normalize: qname → registrable_domain (eTLD+1)
    ├── Categorize: domain → category_id
    ├── Emit event to Tinybird
    │
    ▼
Forward to handshake-volume-resolver:5353
    │
    ▼
Return response to client
```

### 2. Event Schema (Tinybird)

```json
{
  "ts": "2026-01-12T15:30:00Z",
  "wallet_id": "0x1234...abcd",
  "device_id": "uuid",
  "etld1": "spotify.com",
  "domain_hmac": "a1b2c3...",
  "qtype": "A",
  "action": "allow",
  "category_id": 3,
  "latency_ms": 12
}
```

**Privacy choices:**
- `etld1`: Keep short-term (7 days), useful for debugging
- `domain_hmac`: HMAC(secret, etld1) for long-term storage
- Never store full qname (subdomains leak too much)

### 3. Tinybird Aggregations

**Materialized View: `user_category_daily`**
```sql
SELECT
  wallet_id,
  toDate(ts) as day,
  category_id,
  count() as cnt,
  countIf(action = 'block') as blocked_cnt
FROM dns_events
GROUP BY wallet_id, day, category_id
```

**Materialized View: `user_interest_vector`**
```sql
SELECT
  wallet_id,
  day,
  groupArray(category_id) as categories,
  groupArray(cnt) as counts,
  sum(cnt) as total_queries
FROM user_category_daily
GROUP BY wallet_id, day
```

### 4. Tinybird API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /v0/pipes/context.json?wallet_id=...` | Last 24h category mix |
| `GET /v0/pipes/vector.json?wallet_id=...` | Interest vector for matching |
| `GET /v0/pipes/trends.json?wallet_id=...` | 7-day trends |

## Matching Algorithm

### Interest Vector

Each user has a daily interest vector:
```
[gaming: 0.3, music: 0.25, fitness: 0.15, tech: 0.12, ...]
```

Normalized by total queries, weighted by TF-IDF across population.

### Candidate Generation

```python
def find_matches(wallet_id, k=10):
    # Get user's vector from Tinybird
    vec = tinybird.get("/vector", wallet_id=wallet_id)

    # ANN search (FAISS/pgvector)
    candidates = ann_index.search(vec, k=k*2)

    # Filter: exclude self, apply constraints
    matches = [c for c in candidates if c.wallet_id != wallet_id]

    return matches[:k]
```

### What users see

```
"You matched with 0x5678...efgh"
"Shared interests: music, gaming, outdoors"
```

Never expose: "You both visited reddit.com/r/climbing"

## Categories

Dating-relevant interest categories:

```
 1. gaming
 2. fitness
 3. music
 4. movies
 5. anime
 6. cooking
 7. travel
 8. outdoors
 9. tech
10. programming
11. finance
12. fashion
13. art
14. reading
15. podcasts
16. sports
17. pets
18. diy
19. photography
20. news
```

**Excluded from matching** (sensitive):
- health / medical
- adult
- religion
- politics

## hp-dns-gw Structure

```
hp-dns-gw/
├── Cargo.toml
├── src/
│   ├── main.rs
│   ├── config.rs
│   ├── dns/
│   │   ├── mod.rs
│   │   ├── server.rs      # UDP/TCP on :53
│   │   ├── handler.rs     # Query processing
│   │   └── upstream.rs    # Forward to resolver
│   ├── users/
│   │   ├── mod.rs
│   │   ├── auth.rs        # Wallet sig verification
│   │   └── devices.rs     # WG peer management
│   ├── categorize/
│   │   ├── mod.rs
│   │   ├── etld.rs        # eTLD+1 extraction
│   │   └── lookup.rs      # Domain → category
│   ├── ingest/
│   │   ├── mod.rs
│   │   └── tinybird.rs    # Batch event sender
│   └── api/
│       ├── mod.rs
│       └── routes.rs      # HTTP API (axum)
```

## Deployment

### docker-compose.yml

```yaml
services:
  wireguard:
    image: linuxserver/wireguard
    cap_add: [NET_ADMIN, SYS_MODULE]
    environment:
      SERVERPORT: 51820
      INTERNAL_SUBNET: 10.8.0.0/24
    volumes:
      - ./wg-config:/config
    ports:
      - "51820:51820/udp"
    sysctls:
      - net.ipv4.conf.all.src_valid_mark=1

  hp-dns-gw:
    build: ./hp-dns-gw
    network_mode: host
    environment:
      UPSTREAM_DNS: "127.0.0.1:5353"
      DATABASE_URL: "postgres://hp:hp@localhost:5432/hp"
      TINYBIRD_TOKEN: "${TINYBIRD_TOKEN}"
      TINYBIRD_ENDPOINT: "https://api.tinybird.co"
    depends_on: [resolver, postgres]

  resolver:
    image: jamesstevens/handshake-volume-resolver
    environment:
      HSD_MASTERS: "hsd:5349"
    ports:
      - "127.0.0.1:5353:53/udp"
      - "127.0.0.1:5353:53/tcp"
    depends_on: [hsd]

  hsd:
    image: handshakeorg/hsd:latest
    command: ["--ns-host=0.0.0.0", "--ns-port=5349"]
    volumes:
      - hsd-data:/root/.hsd

  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: hp
      POSTGRES_PASSWORD: hp
      POSTGRES_DB: hp
    volumes:
      - pg-data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"

volumes:
  hsd-data:
  pg-data:
```

### Firewall (force DNS through gateway)

```bash
# Block direct DNS bypass from WireGuard clients
iptables -A FORWARD -i wg0 -p udp --dport 53 ! -d 10.8.0.1 -j DROP
iptables -A FORWARD -i wg0 -p tcp --dport 53 ! -d 10.8.0.1 -j DROP
iptables -A FORWARD -i wg0 -p tcp --dport 853 -j DROP  # DoT

# Block known DoH
for ip in 1.1.1.1 8.8.8.8 9.9.9.9; do
    iptables -A FORWARD -i wg0 -d $ip -p tcp --dport 443 -j DROP
done
```

## Client Integration

### Android
- WireGuard app with "Always-on VPN" + "Block without VPN"
- Your app manages WG config + wallet auth

### Desktop
- Tauri app imports WG config
- Or embedded wireguard-go

### Browser Extension
- UI only: rules, matching, chat
- No local DNS needed (VPN handles it)

## Privacy Summary

| Data | Retention | Used for |
|------|-----------|----------|
| Full qname | Never stored | - |
| eTLD+1 (plaintext) | 7 days | Debugging, categorization |
| domain_hmac | Indefinite | Niche interest signals |
| category_id | Indefinite | Interest vectors, matching |
| wallet_address | Indefinite | Identity |

**Matching only sees:** category vectors + hashed domains, never plaintext browsing history.

## Build Order

1. **hp-dns-gw** - DNS server + Tinybird ingestion
2. **docker-compose** - Local dev environment
3. **Tinybird schema** - Data source + pipes
4. **User API** - Wallet auth, WG config
5. **Matching service** - Vector computation + ANN
6. **Client apps** - Android WG, desktop, extension updates

## Open Questions

1. **Run own hsd?** ~50GB disk, full sovereignty vs public HNS resolvers
2. **Matching constraints?** Age/location (if collected) or pure interest-based?
3. **Match reveal UX?** Mutual match required? Rate limiting?
4. **Monetization?** Premium features? Subscription?
