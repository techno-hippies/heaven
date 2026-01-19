import type { Component } from 'solid-js'
import { Match, Switch } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { GENDER_IDENTITY_LABELS } from '@/components/profile/ProfileBadge'
import { toOptions } from '@/pages/onboarding/steps/utils'
import type { PreferenceStepProps } from '@/pages/onboarding/step-types'

export const SeekingGendersStep: Component<PreferenceStepProps> = (props) => {
  const showGenderPicker = () => props.data().seekingGendersGate === 'pick'

  const handleGenderPickerBack = () => {
    props.updateData('seekingGendersGate', undefined)
  }

  const handleGenderGateContinue = () => {
    if (props.data().seekingGendersGate === 'open') {
      props.updateData('seekingGenders', [])
      props.onContinue?.()
    }
  }

  return (
    <Switch>
      <Match when={!showGenderPicker()}>
        <OnboardingStep
          sectionLabel="Preferences"
          title="Are you open to all genders?"
          subtitle="Set only what's non-negotiable."
          step={props.stepNumber}
          totalSteps={props.totalSteps}
          canContinue={!!props.data().seekingGendersGate}
          onContinue={handleGenderGateContinue}
        >
          <div class="flex flex-col gap-2">
            {[
              { value: 'open' as const, label: 'Yes' },
              { value: 'pick' as const, label: 'No' },
            ].map((option) => {
              const isSelected = () => props.data().seekingGendersGate === option.value
              return (
                <button
                  type="button"
                  onClick={() => props.updateData('seekingGendersGate', option.value)}
                  class={`flex items-center gap-3 p-4 rounded-2xl text-left cursor-pointer border transition-colors ${
                    isSelected()
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <div
                    class={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected()
                        ? 'border-primary'
                        : 'border-muted-foreground/30'
                    }`}
                  >
                    {isSelected() && (
                      <div class="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <span class="font-medium text-foreground">{option.label}</span>
                </button>
              )
            })}
          </div>
        </OnboardingStep>
      </Match>

      <Match when={showGenderPicker()}>
        <OnboardingStep
          sectionLabel="Preferences"
          title="Who do you want to see?"
          subtitle="Set only what's non-negotiable."
          step={props.stepNumber}
          totalSteps={props.totalSteps}
          canContinue={(props.data().seekingGenders?.length ?? 0) > 0}
          onBack={handleGenderPickerBack}
          onContinue={props.onContinue}
        >
          <ChoiceSelect
            multiple
            options={toOptions(GENDER_IDENTITY_LABELS)}
            value={props.data().seekingGenders ?? []}
            onChange={(v) => props.updateData('seekingGenders', v as string[])}
          />
        </OnboardingStep>
      </Match>
    </Switch>
  )
}
