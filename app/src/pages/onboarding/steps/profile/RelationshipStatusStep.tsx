import type { Component } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { RELATIONSHIP_STATUS_LABELS } from '@/components/profile/ProfileBadge'
import { toOptions } from '@/pages/onboarding/steps/utils'
import type { ProfileStepProps } from '@/pages/onboarding/step-types'

export const RelationshipStatusStep: Component<ProfileStepProps> = (props) => (
  <OnboardingStep
    sectionLabel="Profile"
    title="What's your relationship status?"
    step={props.stepNumber}
    totalSteps={props.totalSteps}
    canContinue={!!props.data().relationshipStatus}
    visibility={props.data().relationshipStatusVisibility}
    onVisibilityChange={(v) => props.updateData('relationshipStatusVisibility', v)}
    onBack={props.onBack}
    onContinue={props.onContinue}
  >
    <ChoiceSelect
      options={toOptions(RELATIONSHIP_STATUS_LABELS)}
      value={props.data().relationshipStatus ?? ''}
      onChange={(v) => props.updateData('relationshipStatus', v as string)}
    />
  </OnboardingStep>
)
