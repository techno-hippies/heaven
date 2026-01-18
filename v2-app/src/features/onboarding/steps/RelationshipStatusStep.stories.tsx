import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { RelationshipStatusAboutMeStep, type RelationshipStatusAboutMeStepData, relationshipStatusAboutMeStepMeta } from './RelationshipStatusAboutMeStep'
import { RelationshipStatusPrefStep, type RelationshipStatusPrefStepData, relationshipStatusPrefStepMeta } from './RelationshipStatusPrefStep'
import { StepHeader } from '../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Steps/RelationshipStatusStep',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Step 1: About Me - "What's your relationship status?" + Visibility */
export const Step1_AboutMe: Story = {
  name: '1. About Me',
  render: () => {
    const [data, setData] = createSignal<RelationshipStatusAboutMeStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={relationshipStatusAboutMeStepMeta.title} />
          <RelationshipStatusAboutMeStep
            data={data()}
            onChange={(updates) => setData({ ...data(), ...updates })}
          />
          <div class="mt-8 p-4 bg-muted rounded-lg">
            <p class="text-xs text-muted-foreground">State:</p>
            <pre class="text-xs">{JSON.stringify(data(), null, 2)}</pre>
          </div>
        </div>
      </div>
    )
  },
}

/** Step 2: Preferences - "Who are you open to dating?" + Strict filter */
export const Step2_Preferences: Story = {
  name: '2. Preferences',
  render: () => {
    const [data, setData] = createSignal<RelationshipStatusPrefStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={relationshipStatusPrefStepMeta.title} subtitle={relationshipStatusPrefStepMeta.subtitle} />
          <RelationshipStatusPrefStep
            data={data()}
            onChange={(updates) => setData({ ...data(), ...updates })}
          />
          <div class="mt-8 p-4 bg-muted rounded-lg">
            <p class="text-xs text-muted-foreground">State:</p>
            <pre class="text-xs">{JSON.stringify(data(), null, 2)}</pre>
          </div>
        </div>
      </div>
    )
  },
}

/** Step 1 with selection */
export const Step1_AboutMe_Selected: Story = {
  name: '1. About Me (Selected)',
  render: () => {
    const [data, setData] = createSignal<RelationshipStatusAboutMeStepData>({
      relationshipStatus: '1',
      relationshipStatusVisibility: 'match',
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={relationshipStatusAboutMeStepMeta.title} />
          <RelationshipStatusAboutMeStep
            data={data()}
            onChange={(updates) => setData({ ...data(), ...updates })}
          />
          <div class="mt-8 p-4 bg-muted rounded-lg">
            <p class="text-xs text-muted-foreground">State:</p>
            <pre class="text-xs">{JSON.stringify(data(), null, 2)}</pre>
          </div>
        </div>
      </div>
    )
  },
}

/** Step 2 with strict filter enabled */
export const Step2_Preferences_Strict: Story = {
  name: '2. Preferences (Strict)',
  render: () => {
    const [data, setData] = createSignal<RelationshipStatusPrefStepData>({
      relationshipStatusPreferences: ['1'],
      relationshipStatusStrict: true,
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={relationshipStatusPrefStepMeta.title} subtitle={relationshipStatusPrefStepMeta.subtitle} />
          <RelationshipStatusPrefStep
            data={data()}
            onChange={(updates) => setData({ ...data(), ...updates })}
          />
          <div class="mt-8 p-4 bg-muted rounded-lg">
            <p class="text-xs text-muted-foreground">State:</p>
            <pre class="text-xs">{JSON.stringify(data(), null, 2)}</pre>
          </div>
        </div>
      </div>
    )
  },
}
