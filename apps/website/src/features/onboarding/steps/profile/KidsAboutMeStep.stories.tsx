import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { KidsAboutMeStep, type KidsAboutMeStepData, kidsAboutMeStepMeta } from './KidsAboutMeStep'
import { StepHeader } from '../../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Profile/KidsAboutMeStep',
  component: KidsAboutMeStep,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof KidsAboutMeStep>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [data, setData] = createSignal<KidsAboutMeStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={kidsAboutMeStepMeta.title} subtitle={kidsAboutMeStepMeta.subtitle} />
          <KidsAboutMeStep
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
    const [data, setData] = createSignal<KidsAboutMeStepData>({
      kidsStatus: '2',
      kidsVisibility: 'match',
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={kidsAboutMeStepMeta.title} subtitle={kidsAboutMeStepMeta.subtitle} />
          <KidsAboutMeStep
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
