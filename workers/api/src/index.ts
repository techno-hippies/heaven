/**
 * Heaven API Worker
 *
 * Cloudflare Worker handling:
 * - /api/candidates - Get candidate profiles for swiping
 * - /api/likes - Submit likes, detect matches
 * - /api/claim/* - Profile claim flow
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from './types'

import candidates from './routes/candidates'
import likes from './routes/likes'
import claim from './routes/claim'
import names from './routes/names'

const app = new Hono<{ Bindings: Env }>()

// CORS for frontend
app.use('/*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173', 'https://heaven.computer'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

// Health check
app.get('/health', (c) => c.json({ ok: true }))

// Mount routes
app.route('/api/candidates', candidates)
app.route('/api/likes', likes)
app.route('/api/claim', claim)
app.route('/api/names', names)

// 404 fallback
app.notFound((c) => c.json({ error: 'Not found' }, 404))

// Error handler
app.onError((err, c) => {
  console.error('[API Error]', err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
