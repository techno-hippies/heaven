import type { Meta, StoryObj } from 'storybook-solidjs'
import { NotificationBadge } from './notification-badge'

const meta: Meta<typeof NotificationBadge> = {
  title: 'UI/NotificationBadge',
  component: NotificationBadge,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof NotificationBadge>

export const Default: Story = {
  args: {
    count: 3,
  },
}

export const LargeCount: Story = {
  args: {
    count: 150,
    max: 99,
  },
}

export const Small: Story = {
  args: {
    count: 5,
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    count: 12,
    size: 'md',
  },
}

export const Large: Story = {
  args: {
    count: 8,
    size: 'lg',
  },
}

export const Secondary: Story = {
  args: {
    count: 3,
    variant: 'secondary',
  },
}

export const Destructive: Story = {
  args: {
    count: 1,
    variant: 'destructive',
  },
}

export const AllSizes: Story = {
  render: () => (
    <div class="flex items-center gap-4">
      <NotificationBadge count={5} size="sm" />
      <NotificationBadge count={12} size="md" />
      <NotificationBadge count={99} size="lg" />
    </div>
  ),
}
