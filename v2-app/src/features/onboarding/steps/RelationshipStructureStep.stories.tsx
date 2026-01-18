import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { RelationshipStructureAboutMeStep, type RelationshipStructureAboutMeStepData, relationshipStructureAboutMeStepMeta } from './RelationshipStructureAboutMeStep'
import { RelationshipStructurePrefStep, type RelationshipStructurePrefStepData, relationshipStructurePrefStepMeta } from './RelationshipStructurePrefStep'
import { StepHeader } from '../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Steps/RelationshipStructureStep',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Step 1: About Me - "Your relationship style" + Visibility */
export const Step1_AboutMe: Story = {
  name: '1. About Me',
  render: () => {
    const [data, setData] = createSignal<RelationshipStructureAboutMeStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={relationshipStructureAboutMeStepMeta.title} />
          <RelationshipStructureAboutMeStep
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

/** Step 2: Preferences - "Preferred relationship style" + Strict filter */
export const Step2_Preferences: Story = {
  name: '2. Preferences',
  render: () => {
    const [data, setData] = createSignal<RelationshipStructurePrefStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={relationshipStructurePrefStepMeta.title} subtitle={relationshipStructurePrefStepMeta.subtitle} />
          <RelationshipStructurePrefStep
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
    const [data, setData] = createSignal<RelationshipStructureAboutMeStepData>({
      relationshipStyle: '1',
      relationshipStyleVisibility: 'match',
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={relationshipStructureAboutMeStepMeta.title} />
          <RelationshipStructureAboutMeStep
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
    const [data, setData] = createSignal<RelationshipStructurePrefStepData>({
      relationshipStylePreferences: ['1'],
      relationshipStyleStrict: true,
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={relationshipStructurePrefStepMeta.title} subtitle={relationshipStructurePrefStepMeta.subtitle} />
          <RelationshipStructurePrefStep
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
