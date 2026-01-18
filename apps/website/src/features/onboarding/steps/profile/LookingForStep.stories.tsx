import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { LookingForStep, type LookingForStepData, lookingForStepMeta } from './LookingForStep'
import { StepHeader } from '../../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Profile/LookingForStep',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [data, setData] = createSignal<LookingForStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={lookingForStepMeta.title} />
          <LookingForStep
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
    const [data, setData] = createSignal<LookingForStepData>({
      lookingFor: '2',
      lookingForVisibility: 'public',
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={lookingForStepMeta.title} />
          <LookingForStep
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
