import type { Meta, StoryObj } from 'storybook-solidjs'
import { AgePage } from './AgePage'

const meta = {
  title: 'Onboarding/03 - Age',
  component: AgePage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    step: 3,
    totalSteps: 12,
    verifiedAge: 28,
  },
} satisfies Meta<typeof AgePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
