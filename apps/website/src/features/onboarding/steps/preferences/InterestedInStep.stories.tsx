import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { InterestedInStep, type InterestedInStepData, interestedInStepMeta, toDesiredMask } from './InterestedInStep'
import { StepHeader } from '../../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Preferences/InterestedInStep',
  component: InterestedInStep,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof InterestedInStep>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [data, setData] = createSignal<InterestedInStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader
            title={interestedInStepMeta.title}
            subtitle={interestedInStepMeta.subtitle}
          />
          <InterestedInStep
            data={data()}
            onChange={(updates) => setData({ ...data(), ...updates })}
          />
          <div class="mt-8 p-4 bg-muted rounded-lg">
            <p class="text-xs text-muted-foreground">State:</p>
            <pre class="text-xs">{JSON.stringify(data(), null, 2)}</pre>
            <p class="text-xs text-muted-foreground mt-2">
              Bitmask: 0x{toDesiredMask(data().interestedIn || []).toString(16).padStart(4, '0')}
            </p>
          </div>
        </div>
      </div>
    )
  },
}

export const WithSelections: Story = {
  render: () => {
    const [data, setData] = createSignal<InterestedInStepData>({
      interestedIn: ['1', '2'], // Men and Women
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader
            title={interestedInStepMeta.title}
            subtitle={interestedInStepMeta.subtitle}
          />
          <InterestedInStep
            data={data()}
            onChange={(updates) => setData({ ...data(), ...updates })}
          />
          <div class="mt-8 p-4 bg-muted rounded-lg">
            <p class="text-xs text-muted-foreground">State:</p>
            <pre class="text-xs">{JSON.stringify(data(), null, 2)}</pre>
            <p class="text-xs text-muted-foreground mt-2">
              Bitmask: 0x{toDesiredMask(data().interestedIn || []).toString(16).padStart(4, '0')}
            </p>
          </div>
        </div>
      </div>
    )
  },
}

export const AllSelected: Story = {
  render: () => {
    const [data, setData] = createSignal<InterestedInStepData>({
      interestedIn: ['1', '2', '3', '4', '5'],
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader
            title={interestedInStepMeta.title}
            subtitle={interestedInStepMeta.subtitle}
          />
          <InterestedInStep
            data={data()}
            onChange={(updates) => setData({ ...data(), ...updates })}
          />
          <div class="mt-8 p-4 bg-muted rounded-lg">
            <p class="text-xs text-muted-foreground">State:</p>
            <pre class="text-xs">{JSON.stringify(data(), null, 2)}</pre>
            <p class="text-xs text-muted-foreground mt-2">
              Bitmask: 0x{toDesiredMask(data().interestedIn || []).toString(16).padStart(4, '0')} (MASK_EVERYONE)
            </p>
          </div>
        </div>
      </div>
    )
  },
}
