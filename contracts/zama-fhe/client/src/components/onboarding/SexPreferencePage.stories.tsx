import type { Meta, StoryObj } from 'storybook-solidjs'
import { SexPreferencePage } from './SexPreferencePage'

const meta: Meta<typeof SexPreferencePage> = {
  title: 'Onboarding/06 - Sex Preference',
  component: SexPreferencePage,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onContinue: { action: 'continue' },
  },
}

export default meta
type Story = StoryObj<typeof SexPreferencePage>

export const Default: Story = {
  args: {
    step: 6,
    totalSteps: 12,
  },
}
