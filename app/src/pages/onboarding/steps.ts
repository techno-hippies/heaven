import type { Component } from 'solid-js'
import type { DealbreakerStepProps, ProfileStepProps } from '@/pages/onboarding/step-types'
import {
  DEALBREAKER_STEP_IDS,
  PROFILE_STEP_IDS,
  type DealbreakerStepId,
  type ProfileStepId,
} from '@/lib/onboarding/steps'
import { RelationshipStatusStep } from '@/pages/onboarding/steps/profile/RelationshipStatusStep'
import { PhotoStep } from '@/pages/onboarding/steps/profile/PhotoStep'
import { NameStep } from '@/pages/onboarding/steps/profile/NameStep'
import { RegionStep } from '@/pages/onboarding/steps/profile/RegionStep'
import { GenderStep } from '@/pages/onboarding/steps/profile/GenderStep'
import { LookingForStep } from '@/pages/onboarding/steps/profile/LookingForStep'
import { RelationshipStructureStep } from '@/pages/onboarding/steps/profile/RelationshipStructureStep'
import { KidsStep } from '@/pages/onboarding/steps/profile/KidsStep'
import { ReligionStep } from '@/pages/onboarding/steps/profile/ReligionStep'
import { GroupPlayStep } from '@/pages/onboarding/steps/profile/GroupPlayStep'
import { ProfilePreviewStep } from '@/pages/onboarding/steps/profile/ProfilePreviewStep'
import { DealbreakersGenderStep } from '@/pages/onboarding/steps/dealbreakers/DealbreakersGenderStep'
import { DealbreakersAgeStep } from '@/pages/onboarding/steps/dealbreakers/DealbreakersAgeStep'
import { DealbreakersRegionStep } from '@/pages/onboarding/steps/dealbreakers/DealbreakersRegionStep'

export interface ProfileStepConfig {
  id: ProfileStepId
  component: Component<ProfileStepProps>
}

export interface DealbreakerStepConfig {
  id: DealbreakerStepId
  component: Component<DealbreakerStepProps>
}

export const PROFILE_STEPS: ProfileStepConfig[] = [
  { id: PROFILE_STEP_IDS[0], component: RelationshipStatusStep },
  { id: PROFILE_STEP_IDS[1], component: PhotoStep },
  { id: PROFILE_STEP_IDS[2], component: NameStep },
  { id: PROFILE_STEP_IDS[3], component: RegionStep },
  { id: PROFILE_STEP_IDS[4], component: GenderStep },
  { id: PROFILE_STEP_IDS[5], component: LookingForStep },
  { id: PROFILE_STEP_IDS[6], component: RelationshipStructureStep },
  { id: PROFILE_STEP_IDS[7], component: KidsStep },
  { id: PROFILE_STEP_IDS[8], component: ReligionStep },
  { id: PROFILE_STEP_IDS[9], component: GroupPlayStep },
  { id: PROFILE_STEP_IDS[10], component: ProfilePreviewStep },
]

export const DEALBREAKER_STEPS: DealbreakerStepConfig[] = [
  { id: DEALBREAKER_STEP_IDS[0], component: DealbreakersGenderStep },
  { id: DEALBREAKER_STEP_IDS[1], component: DealbreakersAgeStep },
  { id: DEALBREAKER_STEP_IDS[2], component: DealbreakersRegionStep },
]
