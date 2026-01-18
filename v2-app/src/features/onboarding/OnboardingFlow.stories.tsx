import type { Meta, StoryObj } from 'storybook-solidjs'
import { OnboardingFlow } from './OnboardingFlow'

const meta = {
  title: 'Features/Onboarding/OnboardingFlow',
  component: OnboardingFlow,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof OnboardingFlow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    stepIds: ['name', 'photo', 'age', 'gender', 'confirmation'],
    onComplete: (data) => {
      console.log('Onboarding complete!', data)
      alert('Profile created! Check console for data.')
    },
    onCancel: () => {
      console.log('Onboarding cancelled')
      alert('Onboarding cancelled')
    },
  },
}
