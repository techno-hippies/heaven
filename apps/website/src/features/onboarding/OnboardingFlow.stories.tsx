import type { Meta, StoryObj } from 'storybook-solidjs'
import { OnboardingFlow } from './OnboardingFlow'
import { onboardingStepOrder } from './config'

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
    stepIds: [...onboardingStepOrder],
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

// Phase 1 only - for testing mint flow
export const Phase1Only: Story = {
  args: {
    stepIds: ['name', 'photo', 'gender', 'age', 'interested-in'],
    onComplete: (data) => {
      console.log('Phase 1 complete - minting in background!', data)
      alert('Minting profile in background! Check console for data.')
    },
    onCancel: () => {
      console.log('Onboarding cancelled')
    },
  },
}
