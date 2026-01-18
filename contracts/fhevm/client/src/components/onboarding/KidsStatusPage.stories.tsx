import type { Meta, StoryObj } from 'storybook-solidjs'
import { KidsStatusPage } from './KidsStatusPage'

const meta = {
  title: 'Onboarding/09 - Kids Status',
  component: KidsStatusPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    step: 9,
    totalSteps: 12,
  },
} satisfies Meta<typeof KidsStatusPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
