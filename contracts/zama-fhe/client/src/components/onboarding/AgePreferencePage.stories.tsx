import type { Meta, StoryObj } from 'storybook-solidjs'
import { AgePreferencePage } from './AgePreferencePage'

const meta = {
  title: 'Onboarding/04 - Age Preference',
  component: AgePreferencePage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    step: 4,
    totalSteps: 12,
  },
} satisfies Meta<typeof AgePreferencePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
