import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { RelationshipStatusAboutMeStep, type RelationshipStatusAboutMeStepData, relationshipStatusAboutMeStepMeta } from './RelationshipStatusAboutMeStep'
import { StepHeader } from '../../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Profile/RelationshipStatusAboutMeStep',
  component: RelationshipStatusAboutMeStep,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof RelationshipStatusAboutMeStep>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [data, setData] = createSignal<RelationshipStatusAboutMeStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={relationshipStatusAboutMeStepMeta.title} subtitle={relationshipStatusAboutMeStepMeta.subtitle} />
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

export const Selected: Story = {
  render: () => {
    const [data, setData] = createSignal<RelationshipStatusAboutMeStepData>({
      relationshipStatus: '1',
      relationshipStatusVisibility: 'public',
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={relationshipStatusAboutMeStepMeta.title} subtitle={relationshipStatusAboutMeStepMeta.subtitle} />
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
