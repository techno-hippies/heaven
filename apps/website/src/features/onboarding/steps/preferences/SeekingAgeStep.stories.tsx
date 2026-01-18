import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { SeekingAgeStep, type SeekingAgeStepData, seekingAgeStepMeta } from './SeekingAgeStep'
import { StepHeader } from '../../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Preferences/SeekingAgeStep',
  component: SeekingAgeStep,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof SeekingAgeStep>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [data, setData] = createSignal<SeekingAgeStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={seekingAgeStepMeta.title} subtitle={seekingAgeStepMeta.subtitle} />
          <SeekingAgeStep
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

export const WithRange: Story = {
  render: () => {
    const [data, setData] = createSignal<SeekingAgeStepData>({
      ageMin: 25,
      ageMax: 35,
      ageStrict: true,
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={seekingAgeStepMeta.title} subtitle={seekingAgeStepMeta.subtitle} />
          <SeekingAgeStep
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

export const NotStrict: Story = {
  render: () => {
    const [data, setData] = createSignal<SeekingAgeStepData>({
      ageMin: 21,
      ageMax: 50,
      ageStrict: false,
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={seekingAgeStepMeta.title} subtitle={seekingAgeStepMeta.subtitle} />
          <SeekingAgeStep
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
