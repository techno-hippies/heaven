import type { Component } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { DealbreakerToggle } from '@/components/ui/dealbreaker-toggle'
import { RELATIONSHIP_STRUCTURE_LABELS } from '@/components/profile/ProfileBadge'
import { toOptions } from '@/pages/onboarding/steps/utils'
import type { PreferenceStepProps } from '@/pages/onboarding/step-types'

export const PartnerRelationshipStructureStep: Component<PreferenceStepProps> = (props) => (
  <OnboardingStep
    sectionLabel="Preferences"
    title="Preferred relationship style"
    subtitle="What are you open to?"
    step={props.stepNumber}
    totalSteps={props.totalSteps}
    canContinue={!!props.data().wantRelationshipStructure}
    onBack={props.onBack}
    onContinue={props.onContinue}
    onSkip={props.onContinue}
    skipText="Skip"
  >
    <ChoiceSelect
      options={toOptions(RELATIONSHIP_STRUCTURE_LABELS)}
      value={props.data().wantRelationshipStructure ?? ''}
      onChange={(v) => props.updateData('wantRelationshipStructure', v as string)}
    />

    <DealbreakerToggle
      enabled={props.data().wantRelationshipStructureStrict}
      onChange={(v) => props.updateData('wantRelationshipStructureStrict', v)}
      attribute="relationship style"
    />
  </OnboardingStep>
)
