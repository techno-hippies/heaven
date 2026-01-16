import type { Meta, StoryObj } from 'storybook-solidjs'
import { LifestylePage } from './LifestylePage'

const meta = {
  title: 'Onboarding/11 - Lifestyle',
  component: LifestylePage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    step: 11,
    totalSteps: 12,
  },
} satisfies Meta<typeof LifestylePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
