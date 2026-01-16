import type { Meta, StoryObj } from 'storybook-solidjs'
import { GenderIdentityPage } from './GenderIdentityPage'

const meta = {
  title: 'Onboarding/01 - Gender Identity',
  component: GenderIdentityPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    step: 1,
    totalSteps: 12,
  },
} satisfies Meta<typeof GenderIdentityPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
