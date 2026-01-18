import type { Meta, StoryObj } from 'storybook-solidjs'
import { GenderPreferencePage } from './GenderPreferencePage'

const meta = {
  title: 'Onboarding/02 - Gender Preference',
  component: GenderPreferencePage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    step: 2,
    totalSteps: 12,
  },
} satisfies Meta<typeof GenderPreferencePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
