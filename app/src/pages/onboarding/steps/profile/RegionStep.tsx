import type { Component } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { REGION_BUCKET_LABELS } from '@/components/profile/ProfileBadge'
import { toOptions } from '@/pages/onboarding/steps/utils'
import type { ProfileStepProps } from '@/pages/onboarding/step-types'

export const RegionStep: Component<ProfileStepProps> = (props) => (
  <OnboardingStep
    sectionLabel="Profile"
    title="Where are you?"
    step={props.stepNumber}
    totalSteps={props.totalSteps}
    canContinue={!!props.data().region}
    onBack={props.onBack}
    onContinue={props.onContinue}
  >
    <ChoiceSelect
      options={toOptions(REGION_BUCKET_LABELS)}
      value={props.data().region ?? ''}
      onChange={(v) => props.updateData('region', v as string)}
    />
  </OnboardingStep>
)
