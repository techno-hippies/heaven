/**
 * Swipe API client
 *
 * Communicates with workers/api for candidates and likes.
 */

import type { CandidatesResponse, LikeResponse } from './types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

/**
 * Fetch candidate profiles for the viewer
 */
export async function fetchCandidates(viewerAddress: string): Promise<CandidatesResponse> {
  const url = `${API_BASE}/candidates?viewer=${viewerAddress}`

  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `Failed to fetch candidates: ${res.status}`)
  }

  return res.json()
}

/**
 * Submit a like for a candidate
 */
export async function submitLike(
  viewerAddress: string,
  targetType: 'shadow' | 'user',
  targetId: string
): Promise<LikeResponse> {
  const url = `${API_BASE}/likes`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      viewerAddress,
      targetType,
      targetId,
    }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `Failed to submit like: ${res.status}`)
  }

  return res.json()
}
