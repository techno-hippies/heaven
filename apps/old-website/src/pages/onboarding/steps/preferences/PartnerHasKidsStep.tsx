import type { Component } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { DealbreakerToggle } from '@/components/ui/dealbreaker-toggle'
import { KIDS_LABELS } from '@/components/profile/ProfileBadge'
import { toOptions } from '@/pages/onboarding/steps/utils'
import type { PreferenceStepProps } from '@/pages/onboarding/step-types'

export const PartnerHasKidsStep: Component<PreferenceStepProps> = (props) => (
  <OnboardingStep
    sectionLabel="Preferences"
    title="Do you want children?"
    subtitle="What are you open to?"
    step={props.stepNumber}
    totalSteps={props.totalSteps}
    canContinue={!!props.data().wantKids}
    onBack={props.onBack}
    onContinue={props.onContinue}
    onSkip={props.onContinue}
    skipText="Skip"
  >
    <ChoiceSelect
      options={toOptions(KIDS_LABELS)}
      value={props.data().wantKids ?? ''}
      onChange={(v) => props.updateData('wantKids', v as string)}
    />

    <DealbreakerToggle
      enabled={props.data().wantKidsStrict}
      onChange={(v) => props.updateData('wantKidsStrict', v)}
      attribute="family plans"
    />
  </OnboardingStep>
)
