// Profile steps - all "about me" fields with visibility toggle
// Order matches the component registry in pages/onboarding/steps.ts
export const PROFILE_STEP_IDS = [
  'relationship-status',
  'photo',
  'name',
  'region',
  'gender',
  'looking-for',
  'relationship-structure',
  'kids',
  'religion',
  'group-play',
  'preview',
] as const

// Preference steps - all "what I want in a partner" fields
// (renamed from dealbreakers for clarity, but keeping IDs for compatibility)
export const PREFERENCE_STEP_IDS = [
  'gender',
  'age',
  'region',
] as const

// Legacy alias
export const DEALBREAKER_STEP_IDS = PREFERENCE_STEP_IDS

export type ProfileStepId = (typeof PROFILE_STEP_IDS)[number]
export type PreferenceStepId = (typeof PREFERENCE_STEP_IDS)[number]
// Legacy alias
export type DealbreakerStepId = PreferenceStepId

export const PROFILE_TOTAL_STEPS = PROFILE_STEP_IDS.length
export const PREFERENCE_TOTAL_STEPS = PREFERENCE_STEP_IDS.length
// Legacy alias
export const DEALBREAKER_TOTAL_STEPS = PREFERENCE_TOTAL_STEPS

export const getProfileStepIndex = (id: ProfileStepId): number =>
  PROFILE_STEP_IDS.indexOf(id)

export const getPreferenceStepIndex = (id: PreferenceStepId): number =>
  PREFERENCE_STEP_IDS.indexOf(id)

// Legacy alias
export const getDealbreakerStepIndex = getPreferenceStepIndex

export const getProfileStepNumber = (id: ProfileStepId): number =>
  Math.max(0, getProfileStepIndex(id)) + 1

export const getPreferenceStepNumber = (id: PreferenceStepId): number =>
  Math.max(0, getPreferenceStepIndex(id)) + 1

// Legacy alias
export const getDealbreakerStepNumber = getPreferenceStepNumber

export const getNextProfileStepId = (id: ProfileStepId): ProfileStepId => {
  const index = getProfileStepIndex(id)
  const nextIndex = Math.min(index + 1, PROFILE_STEP_IDS.length - 1)
  return PROFILE_STEP_IDS[nextIndex]
}

export const getPrevProfileStepId = (id: ProfileStepId): ProfileStepId => {
  const index = getProfileStepIndex(id)
  const prevIndex = Math.max(index - 1, 0)
  return PROFILE_STEP_IDS[prevIndex]
}

export const getNextPreferenceStepId = (id: PreferenceStepId): PreferenceStepId => {
  const index = getPreferenceStepIndex(id)
  const nextIndex = Math.min(index + 1, PREFERENCE_STEP_IDS.length - 1)
  return PREFERENCE_STEP_IDS[nextIndex]
}

export const getPrevPreferenceStepId = (id: PreferenceStepId): PreferenceStepId => {
  const index = getPreferenceStepIndex(id)
  const prevIndex = Math.max(index - 1, 0)
  return PREFERENCE_STEP_IDS[prevIndex]
}

// Legacy aliases
export const getNextDealbreakerStepId = getNextPreferenceStepId
export const getPrevDealbreakerStepId = getPrevPreferenceStepId
