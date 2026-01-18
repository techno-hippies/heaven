import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { RegionStep, type RegionStepData, regionStepMeta } from './RegionStep'
import { StepHeader } from '../../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Profile/RegionStep',
  component: RegionStep,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof RegionStep>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [data, setData] = createSignal<RegionStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={regionStepMeta.title} subtitle={regionStepMeta.subtitle} />
          <RegionStep
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

export const WithLocation: Story = {
  render: () => {
    const [data, setData] = createSignal<RegionStepData>({
      location: {
        provider: 'photon',
        osm_type: 'relation',
        osm_id: 1682248,
        label: 'Zurich, Switzerland',
        lat: 47.3744489,
        lng: 8.5410422,
        country_code: 'ch',
      },
      locationVisibility: 'public',
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={regionStepMeta.title} subtitle={regionStepMeta.subtitle} />
          <RegionStep
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
