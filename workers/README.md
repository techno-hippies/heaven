# Heaven Cloudflare Workers

Serverless endpoints for Heaven infrastructure.

## Workers

### vpn-status

DNS-based canary check for detecting VPN connection status. Works with IPFS-hosted static frontend.

**How it works:**

1. Frontend generates random UUID token
2. Frontend loads `https://<token>.vpncheck.heaven.example/pixel.png` (triggers DNS lookup)
3. If user is on Heaven VPN, our DNS resolver handles the query and the worker logs `{token, seenAt}` to D1
4. Frontend polls `GET /vpn-status?token=<token>`
5. Worker returns `{connected: true/false}`

**Endpoints:**

| Path | Method | Description |
|------|--------|-------------|
| `/<token>.vpncheck.heaven.example/pixel.png` | GET | DNS canary pixel (logs token) |
| `/vpn-status?token=<uuid>` | GET | Check if token was seen |
| `/health` | GET | Health check |

**Setup:**

```bash
cd workers/vpn-status
bun install
bun run db:create        # Create D1 database
bun run db:migrate       # Run schema migrations
bun run dev              # Local development
bun run deploy           # Deploy to Cloudflare
```

**DNS Configuration:**

Configure wildcard DNS for `*.vpncheck.heaven.example` pointing to this worker.

## Frontend Usage

```typescript
async function checkVpnStatus(): Promise<boolean> {
  const token = crypto.randomUUID();

  // Trigger DNS lookup via unique subdomain
  const img = new Image();
  img.src = `https://${token}.vpncheck.heaven.example/pixel.png?ts=${Date.now()}`;

  // Wait briefly for DNS + HTTP round trip
  await new Promise((r) => setTimeout(r, 2000));

  // Check status
  const res = await fetch(
    `https://vpncheck.heaven.example/vpn-status?token=${token}`,
    { cache: "no-store" }
  );
  const { connected } = await res.json();
  return connected;
}
```

### api

Main API for profiles, candidates, likes, and claim flow.

**Endpoints:**

| Path | Method | Description |
|------|--------|-------------|
| `/api/candidates` | GET | Get candidate profiles for swiping |
| `/api/likes` | POST | Submit a like (relayer) |
| `/api/claim/:token` | GET | Lookup shadow profile by claim token |
| `/api/claim/start` | POST | Start claim, get verification code |
| `/api/claim/verify-bio` | POST | Verify bio edit proof |
| `/api/claim/verify-dm` | POST | Verify DM token/code |
| `/api/claim/complete` | POST | Complete claim (after passkey) |
| `/health` | GET | Health check |

**Setup:**

```bash
cd workers/api
bun install
bun run db:init         # Initialize D1 schema
bun run seed            # Seed test data (local)
bun run dev             # Local development (port 8787)
bun run deploy          # Deploy to Cloudflare
```

**Test claim URLs (after seeding):**

```
http://localhost:3000/#/c/test-alex    # 3 likes
http://localhost:3000/#/c/test-jordan  # 1 like
http://localhost:3000/#/c/test-sam     # 0 likes
```

## Future Workers

| Worker | Purpose |
|--------|---------|
| `auth` | Lit Protocol PKP verification |
| `ipfs-gateway` | Custom IPFS gateway with caching |
