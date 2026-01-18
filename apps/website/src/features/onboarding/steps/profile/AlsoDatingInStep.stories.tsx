import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { AlsoDatingInStep, type AlsoDatingInStepData, alsoDatingInStepMeta } from './AlsoDatingInStep'
import { StepHeader } from '../../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Profile/AlsoDatingInStep',
  component: AlsoDatingInStep,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof AlsoDatingInStep>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [data, setData] = createSignal<AlsoDatingInStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={alsoDatingInStepMeta.title} subtitle={alsoDatingInStepMeta.subtitle} />
          <AlsoDatingInStep
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

export const WithLocations: Story = {
  render: () => {
    const [data, setData] = createSignal<AlsoDatingInStepData>({
      additionalLocations: [
        { provider: 'photon', osm_type: 'N', osm_id: 175905, label: 'New York, USA', lat: 40.7128, lng: -74.006 },
        { provider: 'photon', osm_type: 'N', osm_id: 175906, label: 'Miami, USA', lat: 25.7617, lng: -80.1918 },
      ],
      additionalLocationsVisibility: 'match',
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={alsoDatingInStepMeta.title} subtitle={alsoDatingInStepMeta.subtitle} />
          <AlsoDatingInStep
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
