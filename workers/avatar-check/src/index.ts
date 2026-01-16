/**
 * Avatar Check Worker
 *
 * POST /check - Upload image for moderation + storage
 *   - Validates image (size, type)
 *   - Calls OpenRouter VLM to check for real faces + NSFW
 *   - If allowed, stores in R2 and returns avatarKey
 *   - If rejected, returns reason
 */

interface Env {
  AVATARS: R2Bucket
  OPENROUTER_API_KEY: string
}

interface ModerationResult {
  hasRealisticFace: boolean
  isNSFW: boolean
  raw: string
}

type RejectionReason = 'nsfw' | 'real_face' | 'too_large' | 'invalid_type' | 'moderation_error'

interface CheckResponse {
  allowed: boolean
  avatarKey?: string
  reason?: RejectionReason
  message?: string
}

const REJECTION_MESSAGES: Record<RejectionReason, string> = {
  nsfw: 'Image flagged as inappropriate content',
  real_face: 'Upload an illustration or avatar, not a photo of a real person',
  too_large: 'Image must be under 5MB',
  invalid_type: 'Image must be JPEG, PNG, WebP, or GIF',
  moderation_error: 'Could not verify image, please try again',
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    if (request.method !== 'POST') {
      return Response.json(
        { error: 'Method not allowed' },
        { status: 405, headers: CORS_HEADERS }
      )
    }

    const url = new URL(request.url)

    if (url.pathname === '/check') {
      return handleCheck(request, env)
    }

    return Response.json(
      { error: 'Not found' },
      { status: 404, headers: CORS_HEADERS }
    )
  },
}

async function handleCheck(request: Request, env: Env): Promise<Response> {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return jsonResponse({ allowed: false, reason: 'invalid_type', message: 'No image provided' })
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return jsonResponse({
        allowed: false,
        reason: 'invalid_type',
        message: REJECTION_MESSAGES.invalid_type,
      })
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      return jsonResponse({
        allowed: false,
        reason: 'too_large',
        message: REJECTION_MESSAGES.too_large,
      })
    }

    // Convert to base64 for OpenRouter
    const bytes = await file.arrayBuffer()
    const base64 = arrayBufferToBase64(bytes)
    const dataUrl = `data:${file.type};base64,${base64}`

    // Run moderation
    const moderation = await moderateImage(env.OPENROUTER_API_KEY, dataUrl)

    if (moderation.isNSFW) {
      return jsonResponse({
        allowed: false,
        reason: 'nsfw',
        message: REJECTION_MESSAGES.nsfw,
      })
    }

    if (moderation.hasRealisticFace) {
      return jsonResponse({
        allowed: false,
        reason: 'real_face',
        message: REJECTION_MESSAGES.real_face,
      })
    }

    // Allowed - store in R2
    const avatarKey = `avatars/${crypto.randomUUID()}`
    await env.AVATARS.put(avatarKey, bytes, {
      httpMetadata: { contentType: file.type },
    })

    return jsonResponse({ allowed: true, avatarKey })
  } catch (error) {
    console.error('[AvatarCheck] Error:', error)
    return jsonResponse({
      allowed: false,
      reason: 'moderation_error',
      message: REJECTION_MESSAGES.moderation_error,
    })
  }
}

async function moderateImage(apiKey: string, dataUrl: string): Promise<ModerationResult> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://neodate.app',
      'X-Title': 'Neodate',
    },
    body: JSON.stringify({
      model: 'qwen/qwen3-vl-32b-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `/no_think
Classify this image. Output ONLY two words separated by a space, nothing else.

First word:
- "face" if it shows a realistic, photographed human face of an identifiable individual
- "safe" otherwise (cartoons, illustrations, AI art, anime, animals, objects, no face)

Second word:
- "nsfw" if it contains nudity, sexual content, hentai, or explicit material
- "clean" otherwise

Examples: "safe clean", "face clean", "safe nsfw", "face nsfw"`,
            },
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      max_tokens: 10,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const raw = data.choices?.[0]?.message?.content?.trim().toLowerCase() ?? ''

  // Parse "face clean", "safe nsfw", etc.
  const parts = raw.split(/\s+/)
  const faceResult = parts[0] ?? ''
  const nsfwResult = parts[1] ?? ''

  return {
    hasRealisticFace: faceResult === 'face',
    isNSFW: nsfwResult === 'nsfw',
    raw,
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function jsonResponse(data: CheckResponse): Response {
  return Response.json(data, { headers: CORS_HEADERS })
}
