import type { Meta, StoryObj } from 'storybook-solidjs'
import { ProgressBar } from './ProgressBar'

const meta = {
  title: 'Features/Onboarding/Components/ProgressBar',
  component: ProgressBar,
  argTypes: {
    current: { control: { type: 'number', min: 0, max: 10 } },
    total: { control: { type: 'number', min: 1, max: 20 } },
  },
} satisfies Meta<typeof ProgressBar>

export default meta
type Story = StoryObj<typeof meta>

export const Start: Story = {
  args: {
    current: 1,
    total: 10,
  },
}

export const Middle: Story = {
  args: {
    current: 5,
    total: 10,
  },
}

export const AlmostDone: Story = {
  args: {
    current: 9,
    total: 10,
  },
}

export const Complete: Story = {
  args: {
    current: 10,
    total: 10,
  },
}

export const FewSteps: Story = {
  args: {
    current: 2,
    total: 5,
  },
}

export const ManySteps: Story = {
  args: {
    current: 7,
    total: 15,
  },
}
