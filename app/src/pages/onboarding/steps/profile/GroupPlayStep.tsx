import type { Component } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { GROUP_PLAY_MODE_LABELS } from '@/components/profile/ProfileBadge'
import { toOptions } from '@/pages/onboarding/steps/utils'
import type { ProfileStepProps } from '@/pages/onboarding/step-types'

export const GroupPlayStep: Component<ProfileStepProps> = (props) => (
  <OnboardingStep
    sectionLabel="Profile"
    title="Into group play?"
    step={props.stepNumber}
    totalSteps={props.totalSteps}
    canContinue={!!props.data().groupPlay}
    onBack={props.onBack}
    visibility={props.data().groupPlayVisibility}
    onVisibilityChange={(v) => props.updateData('groupPlayVisibility', v)}
    onContinue={props.onContinue}
  >
    <ChoiceSelect
      options={toOptions(GROUP_PLAY_MODE_LABELS)}
      value={props.data().groupPlay ?? ''}
      onChange={(v) => props.updateData('groupPlay', v as string)}
    />
  </OnboardingStep>
)
