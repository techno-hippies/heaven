import type { D1Database } from '@cloudflare/workers-types'

export interface Env {
  DB: D1Database
  ENVIRONMENT: string
  DNS_SHARED_SECRET?: string  // Required for /api/names/dns/resolve
}

// Database row types
export interface UserRow {
  address: string
  created_at: number
  last_active_at: number | null
  directory_tier: 'handoff' | 'claimed' | 'verified'
}

export interface ShadowProfileRow {
  id: string
  source: string
  source_url: string | null
  display_name: string | null
  bio: string | null
  age_bucket: number | null
  gender_identity: number | null
  location: string | null
  photos_json: string | null
  anime_cid: string | null
  survey_cid: string | null
  featured_rank: number
  created_at: number
  updated_at: number
  claimed_address: string | null
  claimed_at: number | null
}

export interface LikeRow {
  id: number
  liker_address: string
  target_type: 'user' | 'shadow'
  target_id: string
  created_at: number
}

export interface MatchRow {
  id: number
  user1: string
  user2: string
  created_at: number
}

// API types
export interface CandidateProfile {
  targetType: 'shadow' | 'user'
  targetId: string
  displayName: string
  bio: string | null
  ageBucket: number | null
  genderIdentity: number | null
  location: string | null
  avatarUrl: string | null
  claimedAddress: string | null
}

export interface CandidatesResponse {
  candidates: CandidateProfile[]
  meta: {
    candidateSetRoot: string  // Merkle root placeholder for V0.5
    nonce: number
    expiry: number
    maxLikes: number
  }
}

export interface LikeRequest {
  viewerAddress: string
  targetType: 'shadow' | 'user'
  targetId: string
}

export interface LikeResponse {
  success: boolean
  mutual: boolean
  peerAddress?: string
  matchId?: number
  error?: string
}

export interface MatchProfile {
  peerAddress: string
  displayName: string | null
  avatarUrl: string | null
  matchedAt: number
}

export interface MatchesResponse {
  matches: MatchProfile[]
}

// ============================================================================
// Heaven Names Registry Types
// ============================================================================

export interface HeavenNameRow {
  label: string
  label_display: string | null
  pkp_address: string
  status: 'active' | 'expired'
  registered_at: number
  expires_at: number
  grace_ends_at: number
  profile_cid: string | null
  created_at: number
  updated_at: number
}

export interface HeavenReservedRow {
  label: string
  reason: string | null
  created_at: number
}

export interface HeavenNonceRow {
  nonce: string
  pkp_address: string
  used_at: number | null
  expires_at: number
  created_at: number
}
