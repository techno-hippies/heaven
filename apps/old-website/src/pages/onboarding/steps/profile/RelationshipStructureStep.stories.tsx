import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { DealbreakerToggle } from '@/components/ui/dealbreaker-toggle'
import { type Visibility } from '@/components/ui/visibility-select'
import { RELATIONSHIP_STRUCTURE_LABELS, KIDS_LABELS } from '@/components/profile/ProfileBadge'

const toOptions = (labels: Record<number, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))

const TOTAL_STEPS = 13

// =============================================================================
// RELATIONSHIP STRUCTURE - Two-step flow
// =============================================================================

const relationshipMeta: Meta = {
  title: 'Features/Onboarding Steps/RelationshipStructureStep',
  parameters: {
    layout: 'fullscreen',
  },
}

export default relationshipMeta
type Story = StoryObj

/** Step 1: About me - "Your relationship style" + Visibility */
export const Step1_AboutMe: Story = {
  name: '1. About Me',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [visibility, setVisibility] = createSignal<Visibility>('match')

    return (
      <OnboardingStep
        sectionLabel="Profile"
        title="Your relationship style"
        step={7}
        totalSteps={TOTAL_STEPS}
        canContinue={!!value()}
        visibility={visibility()}
        onVisibilityChange={setVisibility}
        onBack={() => alert('Back!')}
        onContinue={() => alert(`Next! Value: ${value()}, Visibility: ${visibility()}`)}
      >
        <ChoiceSelect
          options={toOptions(RELATIONSHIP_STRUCTURE_LABELS)}
          value={value() ?? ''}
          onChange={setValue}
        />
      </OnboardingStep>
    )
  },
}

/** Step 2: Preferences - "Preferred relationship style" + Strict filter */
export const Step2_Preferences: Story = {
  name: '2. Preferences',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [strict, setStrict] = createSignal(false)

    return (
      <OnboardingStep
        sectionLabel="Preferences"
        title="Preferred relationship style"
        subtitle="What are you open to?"
        step={8}
        totalSteps={TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back!')}
        onContinue={() => alert(`Next! Value: ${value()}, Strict: ${strict()}`)}
        onSkip={() => alert('Skipped')}
        skipText="Skip"
      >
        <ChoiceSelect
          options={toOptions(RELATIONSHIP_STRUCTURE_LABELS)}
          value={value() ?? ''}
          onChange={setValue}
        />

        <DealbreakerToggle
          enabled={strict()}
          onChange={setStrict}
          attribute="relationship style"
        />
      </OnboardingStep>
    )
  },
}
