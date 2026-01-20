/**
 * Swipe feature module
 */

// Types
export type { CandidateProfile, CandidatesResponse, LikeResponse } from './types'
export { AGE_BUCKET_LABELS, GENDER_LABELS } from './types'

// API
export { fetchCandidates, submitLike } from './api'

// Components
export { CandidateCard } from './components/CandidateCard'
