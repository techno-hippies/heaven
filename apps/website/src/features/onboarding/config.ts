/**
 * Onboarding Flow Configuration
 *
 * Three phases:
 * 1. On-Chain Profile (ENS + Contract) - minimum to mint and exist
 * 2. Extended Profile (IPFS) - richer profile data, encrypted
 * 3. Match Preferences - filters for candidate generation
 */

export const onboardingStepOrder = [
  // ============ PHASE 1: ON-CHAIN PROFILE (ENS + Contract) ============
  // Minimum required to mint profile to contract
  // Stores: ENS name/avatar, encAge, encGenderId, encDesiredMask
  'name',
  'photo',
  'gender',
  'age',
  'interested-in',
  // → MINT PROFILE (background, optimistic)

  // ============ PHASE 2: EXTENDED PROFILE (IPFS/Filebase) ============
  // Encrypted off-chain, revealed on match or per visibility settings
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

  // ============ PHASE 3: MATCH PREFERENCES ============
  // Filters for candidate set generation
  'seeking-age',
  'relationship-structure-pref',
  'kids-pref',
] as const

export type OnboardingStepId = typeof onboardingStepOrder[number]
