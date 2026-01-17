/**
 * Survey Schema Registry
 *
 * Central registry of available survey schemas.
 */

import { keccak256, stringToBytes } from 'viem'
import type { SurveySchema } from '../types'
import { personalitySchema } from './personality'
import { testSchema } from './test'

// ============ Schema Registry ============

export const SURVEY_SCHEMAS: Record<string, SurveySchema> = {
  [personalitySchema.id]: personalitySchema,
  [testSchema.id]: testSchema,
}

export function getSchema(schemaId: string): SurveySchema | undefined {
  return SURVEY_SCHEMAS[schemaId]
}

export function listSchemas(): SurveySchema[] {
  return Object.values(SURVEY_SCHEMAS)
}

// ============ Schema ID Derivation ============

/**
 * Derive bytes32 schema ID from human-readable name and version.
 * Format: keccak256(utf8("schemaId:version"))
 */
export function deriveSchemaIdBytes32(schemaId: string, version: number): string {
  return keccak256(stringToBytes(`${schemaId}:${version}`))
}

/**
 * Validate that a schema's schemaIdBytes32 matches derived value.
 */
export function validateSchemaId(schema: SurveySchema): boolean {
  const expected = deriveSchemaIdBytes32(schema.id, schema.version)
  return schema.schemaIdBytes32.toLowerCase() === expected.toLowerCase()
}

// Re-export schemas
export { personalitySchema } from './personality'
export { testSchema } from './test'
