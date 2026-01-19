/**
 * Survey System Types
 *
 * Matches SURVEY_SPEC.md format for portable, encrypted dating surveys.
 */

import type { Visibility } from '@/components/ui/visibility-select'

// ============ Schema Types ============

export type QuestionType = 'single' | 'multi' | 'scale' | 'text'

export interface QuestionOption {
  value: string
  label: string
}

export interface SurveyQuestion {
  id: string
  text: string
  type: QuestionType
  /** Default visibility tier for this question */
  defaultTier: SurveyTier
  /** For single/multi choice */
  options?: QuestionOption[]
  /** For scale type */
  range?: [number, number]
  /** Labels for scale endpoints */
  scaleLabels?: [string, string]
  /** Whether the question is required */
  required?: boolean
}

export interface SurveySchema {
  id: string
  version: number
  /** bytes32 = keccak256(utf8("id:version")) */
  schemaIdBytes32: string
  name: string
  description: string
  questions: SurveyQuestion[]
  author?: string
  publishedAt?: number
}

// ============ Response Types ============

/** Visibility tier for survey answers */
export type SurveyTier = 'public' | 'matchOnly' | 'private'

/** Single answer with its tier override */
export interface SurveyAnswer {
  questionId: string
  value: string | string[] | number | null
  /** Override default tier for this answer */
  tier?: SurveyTier
}

/** Draft survey in progress (stored in IDB) */
export interface SurveyDraft {
  schemaId: string
  schemaVersion: number
  answers: Record<string, SurveyAnswer>
  currentQuestionIndex: number
  startedAt: number
  updatedAt: number
}

// ============ IPFS Response Types (SURVEY_SPEC.md) ============

/** Top-level survey response stored on IPFS */
export interface SurveyResponse {
  schemaId: string
  schemaVersion: number
  schemaIdBytes32: string

  /** Public tier - inline, readable by anyone */
  public: Record<string, unknown>

  /** Encrypted tier references (CIDs of LitEncryptedEnvelope) */
  matchOnly?: { cid: string }
  private?: { cid: string }

  createdAt: number
  updatedAt: number
}

/** Lit-encrypted envelope stored on IPFS */
export interface LitEncryptedEnvelope {
  v: 1
  ciphertext: string
  dataToEncryptHash: string

  /** Exactly one of these will be set */
  evmContractConditions?: object[]
  accessControlConditions?: object[]
  unifiedAccessControlConditions?: object[]

  chain: string
}

/** Content inside encrypted tier (pre-encryption) */
export interface EncryptedTierContent {
  schemaId: string
  schemaIdBytes32: string
  tier: 'matchOnly' | 'private'
  responses: Record<string, unknown>
}

// ============ Registry Types ============

/** On-chain encryption mode */
export type EncryptionMode = 0 | 1 | 2
export const ENC_NONE = 0 as const
export const ENC_MATCH_ONLY = 1 as const
export const ENC_TIERED = 2 as const

/** Survey entry from on-chain registry */
export interface SurveyRegistryEntry {
  wallet: string
  schemaId: string
  responseCid: string
  encryptionMode: EncryptionMode
  updatedAt: number
}

// ============ Upload Types ============

/** Response from survey worker upload endpoint */
export interface UploadResponse {
  cid: string
  size: number
  name: string
}

// ============ Helpers ============

/** Map visibility to survey tier */
export function visibilityToTier(visibility: Visibility): SurveyTier {
  switch (visibility) {
    case 'public':
      return 'public'
    case 'match':
      return 'matchOnly'
    case 'private':
      return 'private'
  }
}

/** Map survey tier to visibility */
export function tierToVisibility(tier: SurveyTier): Visibility {
  switch (tier) {
    case 'public':
      return 'public'
    case 'matchOnly':
      return 'match'
    case 'private':
      return 'private'
  }
}
