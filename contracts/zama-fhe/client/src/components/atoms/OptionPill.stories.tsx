import type { Meta, StoryObj } from 'storybook-solidjs'
import { OptionPill } from './OptionPill'

const meta = {
  title: 'Atoms/OptionPill',
  component: OptionPill,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof OptionPill>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Never',
  },
}

export const Selected: Story = {
  args: {
    label: 'Sometimes',
    selected: true,
  },
}

export const Small: Story = {
  args: {
    label: 'Rarely',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    label: 'Regularly',
    size: 'lg',
    selected: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
  },
}

export const AllSizes: Story = {
  render: () => (
    <div class="flex items-center gap-3">
      <OptionPill label="Small" size="sm" />
      <OptionPill label="Medium" size="md" />
      <OptionPill label="Large" size="lg" />
    </div>
  ),
}
