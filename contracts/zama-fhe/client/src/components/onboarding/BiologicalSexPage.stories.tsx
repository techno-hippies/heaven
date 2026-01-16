import type { Meta, StoryObj } from 'storybook-solidjs'
import { BiologicalSexPage } from './BiologicalSexPage'

const meta = {
  title: 'Onboarding/05 - Biological Sex',
  component: BiologicalSexPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    step: 5,
    totalSteps: 12,
    verifiedSex: 0,
  },
} satisfies Meta<typeof BiologicalSexPage>

export default meta
type Story = StoryObj<typeof meta>

export const Male: Story = {}

export const Female: Story = {
  args: {
    verifiedSex: 1,
  },
}
