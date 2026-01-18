/**
 * Onboarding Flow Configuration
 * 
 * Define step order here. To reorder steps, just rearrange this array.
 * To add/remove steps, add/remove IDs (steps must exist in registry).
 * 
 * Steps are referenced by ID, not position, so reordering is safe.
 */

export const onboardingStepOrder = [
  // Core profile (saved to contracts)
  'name',
  'photo',
  'gender',
  'age',
  'interested-in',
  'confirmation',
  // Preferences (saved to IPFS)
  'relationship-status',
  'looking-for',
  'relationship-structure',
  'kids',
] as const

export type OnboardingStepId = typeof onboardingStepOrder[number]
