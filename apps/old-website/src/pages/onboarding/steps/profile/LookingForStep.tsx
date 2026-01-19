import type { Component } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { LOOKING_FOR_LABELS } from '@/components/profile/ProfileBadge'
import { toOptions } from '@/pages/onboarding/steps/utils'
import type { ProfileStepProps } from '@/pages/onboarding/step-types'

export const LookingForStep: Component<ProfileStepProps> = (props) => (
  <OnboardingStep
    sectionLabel="Profile"
    title="What are you looking for?"
    step={props.stepNumber}
    totalSteps={props.totalSteps}
    canContinue={!!props.data().lookingFor}
    onBack={props.onBack}
    visibility={props.data().lookingForVisibility}
    onVisibilityChange={(v) => props.updateData('lookingForVisibility', v)}
    onContinue={props.onContinue}
  >
    <ChoiceSelect
      options={toOptions(LOOKING_FOR_LABELS)}
      value={props.data().lookingFor ?? ''}
      onChange={(v) => props.updateData('lookingFor', v as string)}
    />
  </OnboardingStep>
)
