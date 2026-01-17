import type { Component } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { KIDS_LABELS } from '@/components/profile/ProfileBadge'
import { toOptions } from '@/pages/onboarding/steps/utils'
import type { ProfileStepProps } from '@/pages/onboarding/step-types'

export const KidsStep: Component<ProfileStepProps> = (props) => (
  <OnboardingStep
    sectionLabel="Profile"
    title="Do you have kids?"
    step={props.stepNumber}
    totalSteps={props.totalSteps}
    canContinue={!!props.data().kids}
    onBack={props.onBack}
    visibility={props.data().kidsVisibility}
    onVisibilityChange={(v) => props.updateData('kidsVisibility', v)}
    onContinue={props.onContinue}
  >
    <ChoiceSelect
      options={toOptions(KIDS_LABELS)}
      value={props.data().kids ?? ''}
      onChange={(v) => props.updateData('kids', v as string)}
    />
  </OnboardingStep>
)
