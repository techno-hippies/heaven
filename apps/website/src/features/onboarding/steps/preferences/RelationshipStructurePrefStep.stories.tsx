import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { RelationshipStructurePrefStep, type RelationshipStructurePrefStepData, relationshipStructurePrefStepMeta } from './RelationshipStructurePrefStep'
import { StepHeader } from '../../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Preferences/RelationshipStructurePrefStep',
  component: RelationshipStructurePrefStep,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof RelationshipStructurePrefStep>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [data, setData] = createSignal<RelationshipStructurePrefStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={relationshipStructurePrefStepMeta.title} />
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

export const MonoSelected: Story = {
  render: () => {
    const [data, setData] = createSignal<RelationshipStructurePrefStepData>({
      relationshipStructurePref: ['mono'],
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={relationshipStructurePrefStepMeta.title} />
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

export const BothSelected: Story = {
  render: () => {
    const [data, setData] = createSignal<RelationshipStructurePrefStepData>({
      relationshipStructurePref: ['mono', 'non-mono'],
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={relationshipStructurePrefStepMeta.title} />
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
