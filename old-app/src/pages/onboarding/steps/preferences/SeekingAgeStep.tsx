import type { Component } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { ChoiceSelect } from '@/components/ui/choice-select'
import type { PreferenceStepProps } from '@/pages/onboarding/step-types'

export const SeekingAgeStep: Component<PreferenceStepProps> = (props) => (
  <OnboardingStep
    sectionLabel="Preferences"
    title="Age range"
    subtitle="Set only what's non-negotiable."
    step={props.stepNumber}
    totalSteps={props.totalSteps}
    canContinue={true}
    onBack={props.onBack}
    onContinue={props.onContinue}
  >
    <div class="space-y-4">
      <div>
        <p class="text-sm text-muted-foreground mb-2">Minimum age</p>
        <ChoiceSelect
          options={[
            { value: '18', label: '18' },
            { value: '21', label: '21' },
            { value: '25', label: '25' },
            { value: '30', label: '30' },
            { value: '35', label: '35' },
            { value: '40', label: '40' },
            { value: '45', label: '45' },
            { value: '50', label: '50+' },
          ]}
          value={props.data().seekingAgeMin ?? ''}
          onChange={(v) => props.updateData('seekingAgeMin', v as string)}
          columns={4}
        />
      </div>
      <div>
        <p class="text-sm text-muted-foreground mb-2">Maximum age</p>
        <ChoiceSelect
          options={[
            { value: '18', label: '18' },
            { value: '21', label: '21' },
            { value: '25', label: '25' },
            { value: '30', label: '30' },
            { value: '35', label: '35' },
            { value: '40', label: '40' },
            { value: '45', label: '45' },
            { value: '50', label: '50+' },
          ]}
          value={props.data().seekingAgeMax ?? ''}
          onChange={(v) => props.updateData('seekingAgeMax', v as string)}
          columns={4}
        />
      </div>
    </div>
  </OnboardingStep>
)
