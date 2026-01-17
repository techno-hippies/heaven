/**
 * Test Survey Schema
 *
 * 3 questions, one per tier, for validating the upload/decrypt pipeline.
 */

import type { SurveySchema } from '../types'
import { deriveSchemaIdBytes32 } from './index'

const SCHEMA_ID = 'neodate-test'
const VERSION = 1

export const testSchema: SurveySchema = {
  id: SCHEMA_ID,
  version: VERSION,
  schemaIdBytes32: deriveSchemaIdBytes32(SCHEMA_ID, VERSION),
  name: 'Test Survey',
  description: 'Quick test survey with one question per visibility tier.',
  questions: [
    {
      id: 'favorite-color',
      text: "What's your favorite color?",
      type: 'single',
      defaultTier: 'public',
      required: true,
      options: [
        { value: 'red', label: 'Red' },
        { value: 'blue', label: 'Blue' },
        { value: 'green', label: 'Green' },
        { value: 'purple', label: 'Purple' },
      ],
    },
    {
      id: 'secret-talent',
      text: "What's your secret talent?",
      type: 'single',
      defaultTier: 'matchOnly',
      required: true,
      options: [
        { value: 'cooking', label: 'Cooking' },
        { value: 'singing', label: 'Singing' },
        { value: 'dancing', label: 'Dancing' },
        { value: 'coding', label: 'Coding' },
      ],
    },
    {
      id: 'guilty-pleasure',
      text: "What's your guilty pleasure?",
      type: 'single',
      defaultTier: 'private',
      required: true,
      options: [
        { value: 'reality-tv', label: 'Reality TV' },
        { value: 'junk-food', label: 'Junk food' },
        { value: 'naps', label: 'Naps' },
        { value: 'shopping', label: 'Shopping' },
      ],
    },
  ],
}
