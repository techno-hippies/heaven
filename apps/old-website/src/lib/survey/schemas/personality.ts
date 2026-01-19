/**
 * Personality & Values Survey Schema
 *
 * First survey covering attachment style, love languages, personality traits,
 * and relationship values.
 */

import type { SurveySchema } from '../types'
import { deriveSchemaIdBytes32 } from './index'

const SCHEMA_ID = 'neodate-personality'
const VERSION = 1

export const personalitySchema: SurveySchema = {
  id: SCHEMA_ID,
  version: VERSION,
  schemaIdBytes32: deriveSchemaIdBytes32(SCHEMA_ID, VERSION),
  name: 'Personality & Values',
  description: 'Help us understand your personality and what you value in relationships.',
  questions: [
    // ============ Personality ============
    {
      id: 'attachment-style',
      text: "What's your attachment style?",
      type: 'single',
      defaultTier: 'matchOnly',
      required: true,
      options: [
        { value: 'secure', label: 'Secure' },
        { value: 'anxious', label: 'Anxious' },
        { value: 'avoidant', label: 'Avoidant' },
        { value: 'disorganized', label: 'Fearful-avoidant' },
        { value: 'unsure', label: 'Not sure' },
      ],
    },
    {
      id: 'introvert-extrovert',
      text: 'How introverted or extroverted are you?',
      type: 'scale',
      defaultTier: 'public',
      required: true,
      range: [1, 5],
      scaleLabels: ['Very introverted', 'Very extroverted'],
    },
    {
      id: 'conflict-style',
      text: 'How do you typically handle conflict?',
      type: 'single',
      defaultTier: 'matchOnly',
      required: true,
      options: [
        { value: 'discuss', label: 'Talk it through immediately' },
        { value: 'cool-off', label: 'Need time to cool off first' },
        { value: 'avoid', label: 'Tend to avoid confrontation' },
        { value: 'write', label: 'Prefer to write it out' },
      ],
    },

    // ============ Love Languages ============
    {
      id: 'love-languages',
      text: 'What are your love languages?',
      type: 'multi',
      defaultTier: 'public',
      required: true,
      options: [
        { value: 'words', label: 'Words of affirmation' },
        { value: 'acts', label: 'Acts of service' },
        { value: 'gifts', label: 'Receiving gifts' },
        { value: 'time', label: 'Quality time' },
        { value: 'touch', label: 'Physical touch' },
      ],
    },
    {
      id: 'affection-level',
      text: 'How affectionate are you in relationships?',
      type: 'scale',
      defaultTier: 'public',
      required: true,
      range: [1, 5],
      scaleLabels: ['Reserved', 'Very affectionate'],
    },

    // ============ Lifestyle ============
    {
      id: 'social-energy',
      text: 'How do you recharge?',
      type: 'single',
      defaultTier: 'public',
      required: true,
      options: [
        { value: 'alone', label: 'Time alone' },
        { value: 'partner', label: 'Quiet time with partner' },
        { value: 'small-group', label: 'Small gatherings' },
        { value: 'social', label: 'Big social events' },
      ],
    },
    {
      id: 'adventure-level',
      text: 'How spontaneous vs. planned are you?',
      type: 'scale',
      defaultTier: 'public',
      required: true,
      range: [1, 5],
      scaleLabels: ['Love routines', 'Very spontaneous'],
    },
    {
      id: 'interests',
      text: 'What do you enjoy doing together?',
      type: 'multi',
      defaultTier: 'public',
      required: false,
      options: [
        { value: 'outdoors', label: 'Outdoor activities' },
        { value: 'travel', label: 'Travel' },
        { value: 'movies', label: 'Movies & TV' },
        { value: 'music', label: 'Music & concerts' },
        { value: 'food', label: 'Food & dining' },
        { value: 'fitness', label: 'Fitness & sports' },
        { value: 'games', label: 'Games & puzzles' },
        { value: 'reading', label: 'Reading' },
        { value: 'art', label: 'Art & museums' },
        { value: 'home', label: 'Staying in' },
      ],
    },

    // ============ Relationship Values ============
    {
      id: 'communication-frequency',
      text: 'How often do you like to communicate when apart?',
      type: 'single',
      defaultTier: 'matchOnly',
      required: true,
      options: [
        { value: 'constant', label: 'Throughout the day' },
        { value: 'regular', label: 'A few times a day' },
        { value: 'daily', label: 'Once a day' },
        { value: 'casual', label: 'Every few days' },
      ],
    },
    {
      id: 'independence-level',
      text: 'How much independence do you need?',
      type: 'scale',
      defaultTier: 'matchOnly',
      required: true,
      range: [1, 5],
      scaleLabels: ['Do everything together', 'Very independent'],
    },
    {
      id: 'deal-with-stress',
      text: 'When stressed, what do you need from a partner?',
      type: 'single',
      defaultTier: 'matchOnly',
      required: true,
      options: [
        { value: 'space', label: 'Space to process alone' },
        { value: 'talk', label: 'Someone to talk it through' },
        { value: 'distract', label: 'Help getting distracted' },
        { value: 'physical', label: 'Physical comfort' },
        { value: 'practical', label: 'Practical help' },
      ],
    },
    {
      id: 'relationship-pace',
      text: 'What pace do you prefer for relationships?',
      type: 'single',
      defaultTier: 'matchOnly',
      required: true,
      options: [
        { value: 'slow', label: 'Take it slow' },
        { value: 'moderate', label: 'Moderate pace' },
        { value: 'fast', label: 'Move quickly when it feels right' },
        { value: 'flexible', label: 'Depends on the connection' },
      ],
    },
  ],
}
