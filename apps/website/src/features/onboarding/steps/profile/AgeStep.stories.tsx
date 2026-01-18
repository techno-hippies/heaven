import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { AgeStep, type AgeStepData, ageStepMeta } from './AgeStep'
import { StepHeader } from '../../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Profile/AgeStep',
  component: AgeStep,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof AgeStep>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  render: () => {
    const [data, setData] = createSignal<AgeStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={ageStepMeta.title} subtitle={ageStepMeta.subtitle} />
          <AgeStep
            data={data()}
            onChange={(updates) => setData({ ...data(), ...updates })}
          />
        </div>
      </div>
    )
  },
}

export const WithAge: Story = {
  render: () => {
    const [data, setData] = createSignal<AgeStepData>({ age: '28' })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={ageStepMeta.title} subtitle={ageStepMeta.subtitle} />
          <AgeStep
            data={data()}
            onChange={(updates) => setData({ ...data(), ...updates })}
          />
        </div>
      </div>
    )
  },
}
