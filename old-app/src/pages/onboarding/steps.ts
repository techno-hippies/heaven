import type { Component } from 'solid-js'
import type { DealbreakerStepProps, ProfileStepProps } from '@/pages/onboarding/step-types'
import {
  type DealbreakerStepId,
  type ProfileStepId,
} from '@/lib/onboarding/steps'

// Profile steps (about me) - from steps/profile/
import {
  PhotoStep,
  NameStep,
  RegionStep,
  GenderStep,
  RelationshipStatusStep,
  RelationshipStructureStep,
  KidsStep,
  LookingForStep,
  ReligionStep,
  GroupPlayStep,
  ProfilePreviewStep,
} from '@/pages/onboarding/steps/profile'

// Preference steps (what I want in a partner) - from steps/preferences/
import {
  SeekingGendersStep,
  SeekingAgeStep,
  SeekingRegionsStep,
} from '@/pages/onboarding/steps/preferences'

export interface ProfileStepConfig {
  id: ProfileStepId
  component: Component<ProfileStepProps>
}

export interface DealbreakerStepConfig {
  id: DealbreakerStepId
  component: Component<DealbreakerStepProps>
}

// Profile steps in order - matches PROFILE_STEP_IDS
// Order: relationship-status, photo, name, region, gender, looking-for,
//        relationship-structure, kids, religion, group-play, preview
export const PROFILE_STEPS: ProfileStepConfig[] = [
  { id: 'relationship-status', component: RelationshipStatusStep },
  { id: 'photo', component: PhotoStep },
  { id: 'name', component: NameStep },
  { id: 'region', component: RegionStep },
  { id: 'gender', component: GenderStep },
  { id: 'looking-for', component: LookingForStep },
  { id: 'relationship-structure', component: RelationshipStructureStep },
  { id: 'kids', component: KidsStep },
  { id: 'religion', component: ReligionStep },
  { id: 'group-play', component: GroupPlayStep },
  { id: 'preview', component: ProfilePreviewStep },
]

// Dealbreaker/Preference steps in order - matches DEALBREAKER_STEP_IDS
// Order: gender, age, region
export const DEALBREAKER_STEPS: DealbreakerStepConfig[] = [
  { id: 'gender', component: SeekingGendersStep },
  { id: 'age', component: SeekingAgeStep },
  { id: 'region', component: SeekingRegionsStep },
]
