import type { Component } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { RELATIONSHIP_STRUCTURE_LABELS } from '@/components/profile/ProfileBadge'
import { toOptions } from '@/pages/onboarding/steps/utils'
import type { ProfileStepProps } from '@/pages/onboarding/step-types'

export const RelationshipStructureStep: Component<ProfileStepProps> = (props) => (
  <OnboardingStep
    sectionLabel="Profile"
    title="Your relationship style"
    step={props.stepNumber}
    totalSteps={props.totalSteps}
    canContinue={!!props.data().relationshipStructure}
    onBack={props.onBack}
    visibility={props.data().relationshipStructureVisibility}
    onVisibilityChange={(v) => props.updateData('relationshipStructureVisibility', v)}
    onContinue={props.onContinue}
  >
    <ChoiceSelect
      options={toOptions(RELATIONSHIP_STRUCTURE_LABELS)}
      value={props.data().relationshipStructure ?? ''}
      onChange={(v) => props.updateData('relationshipStructure', v as string)}
    />
  </OnboardingStep>
)
