import type { Component } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { GENDER_IDENTITY_LABELS } from '@/components/profile/ProfileBadge'
import { toOptions } from '@/pages/onboarding/steps/utils'
import type { ProfileStepProps } from '@/pages/onboarding/step-types'

export const GenderStep: Component<ProfileStepProps> = (props) => (
  <OnboardingStep
    sectionLabel="Profile"
    title="How do you identify?"
    step={props.stepNumber}
    totalSteps={props.totalSteps}
    canContinue={!!props.data().gender}
    onBack={props.onBack}
    visibility={props.data().genderVisibility}
    onVisibilityChange={(v) => props.updateData('genderVisibility', v)}
    onContinue={props.onContinue}
  >
    <ChoiceSelect
      options={toOptions(GENDER_IDENTITY_LABELS)}
      value={props.data().gender ?? ''}
      onChange={(v) => props.updateData('gender', v as string)}
    />
  </OnboardingStep>
)
