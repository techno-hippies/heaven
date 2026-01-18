import type { Meta, StoryObj } from 'storybook-solidjs'
import { BackButton } from './BackButton'

const meta = {
  title: 'Features/Onboarding/Components/BackButton',
  component: BackButton,
  argTypes: {
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof BackButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onClick: () => console.log('Back clicked'),
  },
}

export const Disabled: Story = {
  args: {
    onClick: () => console.log('Back clicked'),
    disabled: true,
  },
}
