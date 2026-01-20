/**
 * Onboarding Flow Configuration
 *
 * Three phases:
 * 1. On-Chain Profile (ENS + Contract) - minimum to mint and exist
 * 2. Extended Profile (IPFS) - richer profile data, encrypted
 * 3. Match Preferences - filters for candidate generation
 */

// ============ PHASE DEFINITIONS ============

export type OnboardingPhase = 1 | 2 | 3

export interface PhaseConfig {
  phase: OnboardingPhase
  name: string
  description: string
  steps: readonly string[]
}

/** Phase 1: On-Chain Profile (ENS + Contract) */
const PHASE_1_STEPS = [
  'name',
  'photo',
  'gender',
  'age',
  'interested-in',
] as const

/** Phase 2: Extended Profile (IPFS/Filebase) */
const PHASE_2_STEPS = [
  'private-photos',
  'region',
  'also-dating-in',
  'relationship-status-about-me',
  'relationship-structure-about-me',
  'group-play',
  'kids-about-me',
  'family-plans',
  'looking-for',
  'religion',
] as const

/** Phase 3: Match Preferences */
const PHASE_3_STEPS = [
  'seeking-age',
  'relationship-structure-pref',
  'kids-pref',
] as const

export const onboardingPhases: readonly PhaseConfig[] = [
  {
    phase: 1,
    name: 'On-Chain Profile',
    description: 'Register .heaven name + mint encrypted basics to DatingV3',
    steps: PHASE_1_STEPS,
  },
  {
    phase: 2,
    name: 'Extended Profile',
    description: 'Encrypted profile data stored on IPFS/Filebase',
    steps: PHASE_2_STEPS,
  },
  {
    phase: 3,
    name: 'Match Preferences',
    description: 'Filters for candidate set generation',
    steps: PHASE_3_STEPS,
  },
] as const

// ============ STEP ORDER (flat array for backward compat) ============

export const onboardingStepOrder = [
  ...PHASE_1_STEPS,
  ...PHASE_2_STEPS,
  ...PHASE_3_STEPS,
] as const

export type OnboardingStepId = typeof onboardingStepOrder[number]

// ============ PHASE HELPERS ============

/** Get the phase number for a given step ID */
export function getPhaseForStep(stepId: string): OnboardingPhase | null {
  for (const phaseConfig of onboardingPhases) {
    if ((phaseConfig.steps as readonly string[]).includes(stepId)) {
      return phaseConfig.phase
    }
  }
  return null
}

/** Check if a step is the last step in its phase */
export function isLastStepInPhase(stepId: string): boolean {
  for (const phaseConfig of onboardingPhases) {
    const steps = phaseConfig.steps as readonly string[]
    if (steps.includes(stepId)) {
      return steps[steps.length - 1] === stepId
    }
  }
  return false
}

/** Get the phase config for a given phase number */
export function getPhaseConfig(phase: OnboardingPhase): PhaseConfig | undefined {
  return onboardingPhases.find((p) => p.phase === phase)
}
