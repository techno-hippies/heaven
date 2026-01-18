import type { Meta, StoryObj } from 'storybook-solidjs'
import { KinkLevelPage } from './KinkLevelPage'

const meta = {
  title: 'Onboarding/12 - Kink Level',
  component: KinkLevelPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    step: 12,
    totalSteps: 12,
  },
} satisfies Meta<typeof KinkLevelPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
