/**
 * Survey Module
 *
 * Portable, encrypted dating surveys stored on IPFS.
 */

// Types
export * from './types'

// Store
export {
  createSurveyStore,
  loadSurveyDraft,
  saveSurveyDraft,
  clearSurveyDraft,
  listSurveyDrafts,
  type SurveyStore,
} from './store'

// Schemas
export {
  SURVEY_SCHEMAS,
  getSchema,
  listSchemas,
  deriveSchemaIdBytes32,
  validateSchemaId,
  personalitySchema,
  testSchema,
} from './schemas'

// Encryption
export {
  buildMatchOnlyConditions,
  buildPrivateConditions,
  encryptTier,
  decryptTier,
  getDecryptionAuthContext,
} from './encryption'

// Upload
export {
  uploadSurvey,
  fetchSurveyResponse,
  fetchEnvelope,
  fetchFromIPFS,
  type UploadSurveyParams,
  type UploadSurveyResult,
} from './upload'
