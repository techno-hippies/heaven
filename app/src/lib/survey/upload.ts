/**
 * Survey Upload Module
 *
 * Complete flow: encrypt tiers → upload to Filebase → build response JSON.
 */

import type {
  SurveySchema,
  SurveyResponse,
  EncryptedTierContent,
  LitEncryptedEnvelope,
} from './types'
import { encryptTier } from './encryption'

// ============ Config ============

// Survey worker endpoint (CORS proxy to Filebase)
const SURVEY_WORKER_URL = import.meta.env.VITE_SURVEY_WORKER_URL || 'https://survey.neodate.xyz'

// ============ Types ============

export interface UploadSurveyParams {
  schema: SurveySchema
  ownerAddress: string
  publicAnswers: Record<string, unknown>
  matchOnlyAnswers?: Record<string, unknown>
  privateAnswers?: Record<string, unknown>
}

export interface UploadSurveyResult {
  responseCid: string
  encryptionMode: number // 0=none, 1=matchOnly, 2=tiered
  response: SurveyResponse
}

// ============ Upload Flow ============

/**
 * Upload a complete survey response.
 *
 * 1. Encrypts matchOnly/private tiers if present
 * 2. Uploads encrypted envelopes to Filebase
 * 3. Builds and uploads final survey-response.json
 * 4. Returns CID for on-chain registration
 */
export async function uploadSurvey(params: UploadSurveyParams): Promise<UploadSurveyResult> {
  const { schema, ownerAddress, publicAnswers, matchOnlyAnswers, privateAnswers } = params

  const now = Math.floor(Date.now() / 1000)
  let matchOnlyCid: string | undefined
  let privateCid: string | undefined

  // 1. Encrypt and upload matchOnly tier
  if (matchOnlyAnswers && Object.keys(matchOnlyAnswers).length > 0) {
    const content: EncryptedTierContent = {
      schemaId: schema.id,
      schemaIdBytes32: schema.schemaIdBytes32,
      tier: 'matchOnly',
      responses: matchOnlyAnswers,
    }
    const envelope = await encryptTier({ content, ownerAddress })
    matchOnlyCid = await uploadToWorker(envelope)
  }

  // 2. Encrypt and upload private tier
  if (privateAnswers && Object.keys(privateAnswers).length > 0) {
    const content: EncryptedTierContent = {
      schemaId: schema.id,
      schemaIdBytes32: schema.schemaIdBytes32,
      tier: 'private',
      responses: privateAnswers,
    }
    const envelope = await encryptTier({ content, ownerAddress })
    privateCid = await uploadToWorker(envelope)
  }

  // 3. Build survey response
  const response: SurveyResponse = {
    schemaId: schema.id,
    schemaVersion: schema.version,
    schemaIdBytes32: schema.schemaIdBytes32,
    public: publicAnswers,
    createdAt: now,
    updatedAt: now,
  }

  if (matchOnlyCid) {
    response.matchOnly = { cid: matchOnlyCid }
  }
  if (privateCid) {
    response.private = { cid: privateCid }
  }

  // 4. Upload survey response
  const responseCid = await uploadToWorker(response)

  // 5. Determine encryption mode
  let encryptionMode = 0
  if (matchOnlyCid && privateCid) {
    encryptionMode = 2 // tiered
  } else if (matchOnlyCid) {
    encryptionMode = 1 // matchOnly
  }

  return {
    responseCid,
    encryptionMode,
    response,
  }
}

// ============ Worker Communication ============

/**
 * Upload JSON content to Filebase via the survey worker.
 */
async function uploadToWorker(content: unknown): Promise<string> {
  const response = await fetch(`${SURVEY_WORKER_URL}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(content),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Upload failed: ${response.status} - ${error}`)
  }

  const result = await response.json()
  return result.cid
}

/**
 * Fetch content from IPFS via the worker gateway.
 */
export async function fetchFromIPFS<T>(cid: string): Promise<T> {
  const response = await fetch(`${SURVEY_WORKER_URL}/ipfs/${cid}`)

  if (!response.ok) {
    throw new Error(`IPFS fetch failed: ${response.status}`)
  }

  return response.json()
}

/**
 * Fetch a survey response by CID.
 */
export async function fetchSurveyResponse(cid: string): Promise<SurveyResponse> {
  return fetchFromIPFS<SurveyResponse>(cid)
}

/**
 * Fetch an encrypted envelope by CID.
 */
export async function fetchEnvelope(cid: string): Promise<LitEncryptedEnvelope> {
  return fetchFromIPFS<LitEncryptedEnvelope>(cid)
}
