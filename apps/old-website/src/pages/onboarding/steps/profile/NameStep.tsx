import type { Component } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { InputWithSuffix, InputStatus } from '@/components/ui/input'
import type { ProfileStepProps } from '@/pages/onboarding/step-types'

const STAR_SUFFIX = '.\u2B50'

export const NameStep: Component<ProfileStepProps> = (props) => (
  <OnboardingStep
    sectionLabel="Profile"
    title="Choose your name"
    subtitle={`This will be your ENS identity. You'll get both a .neodate and ${STAR_SUFFIX} domain.`}
    step={props.stepNumber}
    totalSteps={props.totalSteps}
    canContinue={!!props.data().name && props.data().name.length >= 3}
    onBack={props.onBack}
    onContinue={props.onContinue}
  >
    <div class="space-y-4">
      <div>
        <InputWithSuffix
          suffix=".neodate"
          placeholder="yourname"
          value={props.data().name ?? ''}
          onInput={(e) => props.updateData('name', e.currentTarget.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
          state={props.data().name && props.data().name.length >= 3 ? 'valid' : 'default'}
        />
        <InputStatus
          state={props.data().name && props.data().name.length >= 3 ? 'valid' : 'idle'}
          validMessage="Available"
          class="mt-2"
        />
      </div>
      <div>
        <InputWithSuffix
          suffix={STAR_SUFFIX}
          placeholder="yourname"
          value={props.data().starName ?? props.data().name ?? ''}
          onInput={(e) => props.updateData('starName', e.currentTarget.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
          state={props.data().starName || props.data().name ? 'valid' : 'default'}
        />
        <p class="text-sm text-muted-foreground mt-2">
          Your emoji domain mirrors your .neodate name by default
        </p>
      </div>
    </div>
  </OnboardingStep>
)
