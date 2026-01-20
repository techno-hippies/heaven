# Heaven API Worker

Cloudflare Worker providing the Heaven Names Registry API and claim/matching endpoints.

## Deployment

```bash
# Create D1 database (one-time)
wrangler d1 create heaven-api

# Run schema migration
wrangler d1 execute heaven-api --remote --file=./schema.sql

# Set secrets
wrangler secret put DNS_SHARED_SECRET

# Deploy
npx wrangler deploy
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ENVIRONMENT` | No | `development` or `production` (affects auth gating) |
| `DNS_SHARED_SECRET` | Yes* | Shared secret for DNS resolver auth (*required in production) |

## Heaven Names Registry API

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/names/available/:label` | GET | Check if a .heaven name is available |
| `/api/names/reverse/:pkp` | GET | Lookup name by PKP address |
| `/api/names/:label` | GET | Get name details |
| `/api/names/register` | POST | Register a new .heaven name |
| `/api/names/renew` | POST | Renew an existing name |
| `/api/names/update` | POST | Update profile CID for a name |

### DNS Resolution Endpoint (Protected)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/names/dns/resolve` | GET | Bearer token | DNS resolution for .heaven names |

**Auth requirement**: The `/dns/resolve` endpoint requires a `Authorization: Bearer <token>` header where `<token>` matches the `DNS_SHARED_SECRET` secret.

In development (`ENVIRONMENT=development`), auth is skipped for local testing.

**Query parameters**:
- `label` - The name to resolve (e.g., `alice`)
- `tld` - The TLD (must be `heaven`)

**Response**:
```json
{
  "tld": "heaven",
  "label": "alice",
  "status": "active" | "expired" | "unregistered" | "reserved",
  "records": {
    "A": ["144.126.205.242"],
    "TXT": ["profile_cid=bafyabc..."],
    "AAAA": []
  },
  "ttl_positive": 300,
  "ttl_negative": 60
}
```

## DNS Server Integration

The DNS server (`services/dns-server`) calls this API to resolve `.heaven` names.

**Secret mapping**:
- Worker: `DNS_SHARED_SECRET` (set via `wrangler secret put`)
- DNS Server: `HEAVEN_DNS_SECRET` (env var, must match Worker's secret)

**Example DNS server config**:
```bash
HEAVEN_API_URL=https://heaven-api.deletion-backup782.workers.dev
HEAVEN_DNS_SECRET=<same-value-as-DNS_SHARED_SECRET>
HEAVEN_GATEWAY_IP=144.126.205.242
```

## Registration Flow

1. Client generates nonce locally (`crypto.getRandomValues`)
2. Client builds canonical message with `heaven-registry:v1` prefix
3. Client signs with PKP using EIP-191 personal_sign
4. Client POSTs to `/api/names/register` with signature

**Signature message format**:
```
heaven-registry:v1
action=register
tld=heaven
label=<label>
pkp=<pkp_address>
nonce=<random_hex>
issued_at=<unix_timestamp>
expires_at=<timestamp+120>
profile_cid=<optional_cid>
```

## D1 Schema

Key tables for names registry:

- `heaven_names` - Label to PKP ownership mapping
- `heaven_reserved` - Policy-reserved names (premium, profanity, trademark)
- `heaven_nonces` - Anti-replay nonces for signatures

See `schema.sql` for full schema.
