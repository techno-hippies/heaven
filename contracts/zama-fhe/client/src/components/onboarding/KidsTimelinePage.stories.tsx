import type { Meta, StoryObj } from 'storybook-solidjs'
import { KidsTimelinePage } from './KidsTimelinePage'

const meta = {
  title: 'Onboarding/10 - Kids Timeline',
  component: KidsTimelinePage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    step: 10,
    totalSteps: 12,
  },
} satisfies Meta<typeof KidsTimelinePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
