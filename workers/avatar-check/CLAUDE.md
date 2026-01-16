# Avatar Check Worker

Cloudflare Worker for avatar upload moderation. Rejects real faces and NSFW content.

## Endpoint

```
POST https://neodate-avatar-check.deletion-backup782.workers.dev/check
```

## Request

Multipart form data with `image` field:

```bash
curl -X POST "https://neodate-avatar-check.deletion-backup782.workers.dev/check" \
  -F "image=@avatar.png;type=image/png"
```

## Response

```typescript
interface CheckResponse {
  allowed: boolean
  avatarKey?: string  // R2 key if allowed
  reason?: 'nsfw' | 'real_face' | 'too_large' | 'invalid_type' | 'moderation_error'
  message?: string    // User-friendly message
}
```

### Examples

```json
// Allowed
{"allowed": true, "avatarKey": "avatars/abc-123-def"}

// Rejected - real face
{"allowed": false, "reason": "real_face", "message": "Upload an illustration or avatar, not a photo of a real person"}

// Rejected - NSFW
{"allowed": false, "reason": "nsfw", "message": "Image flagged as inappropriate content"}
```

## Validation

| Check | Limit |
|-------|-------|
| File size | Max 5MB |
| File type | JPEG, PNG, WebP, GIF |
| Real face | Rejected (photos of real people) |
| NSFW | Rejected (nudity, sexual content) |

## Architecture

```
Client                    Worker                         External
───────                   ──────                         ────────

POST /check ─────────►  Validate size/type
  (image)                     │
                              ▼
                         base64 encode
                              │
                              ▼
                         OpenRouter ──────────────────► Qwen VL 32B
                         (classify)  ◄──────────────────  "safe clean"
                              │
                              ▼
                         If allowed:
                         R2.put() ─────────────────────► neodate-avatars
                              │
                              ▼
◄─────────────────────  { allowed, avatarKey }
```

## Moderation Prompt

Single VLM call returns two words:

```
First word: "face" (real human face) or "safe" (illustration/anime/etc)
Second word: "nsfw" (explicit) or "clean" (safe)
```

Model: `qwen/qwen3-vl-32b-instruct` via OpenRouter

## Commands

```bash
# Development
bun run dev

# Deploy
bun run deploy

# Set API key
npx wrangler secret put OPENROUTER_API_KEY

# View logs
bun run tail
```

## Secrets

| Secret | Description |
|--------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key for VLM calls |

## Bindings

| Binding | Resource | Description |
|---------|----------|-------------|
| `AVATARS` | R2 bucket `neodate-avatars` | Approved avatar storage |

## Cost

~$0.001 per check (Qwen VL via OpenRouter)
