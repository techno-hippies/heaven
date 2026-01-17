import type { Component } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { REGION_BUCKET_LABELS } from '@/components/profile/ProfileBadge'
import type { DealbreakerStepProps } from '@/pages/onboarding/step-types'

const SEEKING_REGION_OPTIONS = Object.entries(REGION_BUCKET_LABELS)
  .filter(([key]) => key !== '9')
  .map(([value, label]) => ({ value, label }))

export const DealbreakersRegionStep: Component<DealbreakerStepProps> = (props) => (
  <OnboardingStep
    sectionLabel="Dealbreakers"
    title="Where should they be?"
    subtitle="Set only what's non-negotiable."
    step={props.stepNumber}
    totalSteps={props.totalSteps}
    canContinue={true}
    onBack={props.onBack}
    onContinue={props.onContinue}
    continueText="Start browsing"
  >
    <ChoiceSelect
      multiple
      options={SEEKING_REGION_OPTIONS}
      value={props.data().seekingRegions ?? []}
      onChange={(v) => props.updateData('seekingRegions', v as string[])}
    />
  </OnboardingStep>
)
