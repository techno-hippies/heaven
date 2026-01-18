import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { ConfirmationStep, type ConfirmationStepData, confirmationStepMeta } from './ConfirmationStep'
import { StepHeader } from '../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Steps/ConfirmationStep',
  component: ConfirmationStep,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ConfirmationStep>

export default meta
type Story = StoryObj<typeof meta>

export const Complete: Story = {
  render: () => {
    const [data, setData] = createSignal<ConfirmationStepData>({
      originalPhotoUrl: 'https://picsum.photos/400/400',
      processedPhotoUrl: 'https://picsum.photos/400/400',
      selectedStyle: 'michelangelo',
      name: 'alice',
      tld: 'heaven',
      age: '28',
      gender: 'woman',
    })

    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={confirmationStepMeta.title} subtitle={confirmationStepMeta.subtitle} />
          <ConfirmationStep
            data={data()}
            onChange={(updates) => setData({ ...data(), ...updates })}
          />
        </div>
      </div>
    )
  },
}

export const Incomplete: Story = {
  render: () => {
    const [data, setData] = createSignal<ConfirmationStepData>({
      name: 'bob',
      tld: 'heaven',
      age: '32',
    })

    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={confirmationStepMeta.title} subtitle={confirmationStepMeta.subtitle} />
          <ConfirmationStep
            data={data()}
            onChange={(updates) => setData({ ...data(), ...updates })}
          />
        </div>
      </div>
    )
  },
}
