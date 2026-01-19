import type { Component } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { RELIGION_LABELS } from '@/components/profile/ProfileBadge'
import { toOptions } from '@/pages/onboarding/steps/utils'
import type { ProfileStepProps } from '@/pages/onboarding/step-types'

export const ReligionStep: Component<ProfileStepProps> = (props) => (
  <OnboardingStep
    sectionLabel="Profile"
    title="What do you believe?"
    step={props.stepNumber}
    totalSteps={props.totalSteps}
    canContinue={!!props.data().religion}
    onBack={props.onBack}
    visibility={props.data().religionVisibility}
    onVisibilityChange={(v) => props.updateData('religionVisibility', v)}
    onContinue={props.onContinue}
  >
    <ChoiceSelect
      options={toOptions(RELIGION_LABELS)}
      value={props.data().religion ?? ''}
      onChange={(v) => props.updateData('religion', v as string)}
    />
  </OnboardingStep>
)
