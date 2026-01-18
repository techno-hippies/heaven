import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { RelationshipStructureAboutMeStep, type RelationshipStructureAboutMeStepData, relationshipStructureAboutMeStepMeta } from './RelationshipStructureAboutMeStep'
import { StepHeader } from '../../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Profile/RelationshipStructureAboutMeStep',
  component: RelationshipStructureAboutMeStep,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof RelationshipStructureAboutMeStep>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [data, setData] = createSignal<RelationshipStructureAboutMeStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={relationshipStructureAboutMeStepMeta.title} subtitle={relationshipStructureAboutMeStepMeta.subtitle} />
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

export const Selected: Story = {
  render: () => {
    const [data, setData] = createSignal<RelationshipStructureAboutMeStepData>({
      relationshipStyle: '1',
      relationshipStyleVisibility: 'match',
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={relationshipStructureAboutMeStepMeta.title} subtitle={relationshipStructureAboutMeStepMeta.subtitle} />
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
