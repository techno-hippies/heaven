/**
 * Swipe feature types
 */

/** Candidate profile from /api/candidates */
export interface CandidateProfile {
  targetType: 'shadow' | 'user'
  targetId: string
  displayName: string
  bio?: string
  ageBucket?: number
  genderIdentity?: number
  location?: string
  avatarUrl: string
  claimedAddress?: string
}

/** Response from GET /api/candidates */
export interface CandidatesResponse {
  candidates: CandidateProfile[]
  meta: {
    candidateSetRoot: string
    nonce: number
    expiry: number
    maxLikes: number
  }
}

/** Response from POST /api/likes */
export interface LikeResponse {
  success: boolean
  txHash?: string
  mutual?: boolean
  peerAddress?: string
  error?: string
}

/** Age bucket labels */
export const AGE_BUCKET_LABELS: Record<number, string> = {
  1: '18-24',
  2: '25-29',
  3: '30-34',
  4: '35-39',
  5: '40-44',
  6: '45-49',
  7: '50+',
}

/** Gender identity labels */
export const GENDER_LABELS: Record<number, string> = {
  1: 'Man',
  2: 'Woman',
  3: 'Trans man',
  4: 'Trans woman',
  5: 'Non-binary',
}
