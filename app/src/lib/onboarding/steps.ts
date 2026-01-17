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

export const DEALBREAKER_STEP_IDS = [
  'gender',
  'age',
  'region',
] as const

export type ProfileStepId = typeof PROFILE_STEP_IDS[number]
export type DealbreakerStepId = typeof DEALBREAKER_STEP_IDS[number]

export const PROFILE_TOTAL_STEPS = PROFILE_STEP_IDS.length
export const DEALBREAKER_TOTAL_STEPS = DEALBREAKER_STEP_IDS.length

export const getProfileStepIndex = (id: ProfileStepId): number =>
  PROFILE_STEP_IDS.indexOf(id)

export const getDealbreakerStepIndex = (id: DealbreakerStepId): number =>
  DEALBREAKER_STEP_IDS.indexOf(id)

export const getProfileStepNumber = (id: ProfileStepId): number =>
  Math.max(0, getProfileStepIndex(id)) + 1

export const getDealbreakerStepNumber = (id: DealbreakerStepId): number =>
  Math.max(0, getDealbreakerStepIndex(id)) + 1

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

export const getNextDealbreakerStepId = (id: DealbreakerStepId): DealbreakerStepId => {
  const index = getDealbreakerStepIndex(id)
  const nextIndex = Math.min(index + 1, DEALBREAKER_STEP_IDS.length - 1)
  return DEALBREAKER_STEP_IDS[nextIndex]
}

export const getPrevDealbreakerStepId = (id: DealbreakerStepId): DealbreakerStepId => {
  const index = getDealbreakerStepIndex(id)
  const prevIndex = Math.max(index - 1, 0)
  return DEALBREAKER_STEP_IDS[prevIndex]
}
