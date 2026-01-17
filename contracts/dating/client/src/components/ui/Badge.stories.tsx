import type { Meta, StoryObj } from 'storybook-solidjs'
import { Badge, VerifiedBadge } from './Badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'success', 'warning', 'destructive', 'muted', 'outline', 'verified', 'premium'],
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Badge',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'New Match',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Online',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Unread',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Blocked',
  },
}

export const WithIcon: Story = {
  args: {
    variant: 'verified',
    icon: <span>✓</span>,
    children: 'Verified',
  },
}

export const Premium: Story = {
  args: {
    variant: 'premium',
    icon: <span>⭐</span>,
    children: 'Premium',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div class="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="muted">Muted</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="verified">Verified</Badge>
      <Badge variant="premium">Premium</Badge>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div class="flex items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="default">Default</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
}

export const VerifiedBadges: Story = {
  render: () => (
    <div class="flex flex-wrap gap-2">
      <VerifiedBadge level="basic" />
      <VerifiedBadge level="photo" />
      <VerifiedBadge level="id" />
    </div>
  ),
}

export const ProfileBadges: Story = {
  render: () => (
    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <Badge variant="muted">25</Badge>
        <Badge variant="muted">San Francisco</Badge>
        <Badge variant="verified" icon={<span>✓</span>}>Verified</Badge>
      </div>
      <div class="flex flex-wrap gap-2">
        <Badge variant="default">Looking for serious</Badge>
        <Badge variant="secondary">Monogamous</Badge>
        <Badge variant="muted">Non-smoker</Badge>
      </div>
    </div>
  ),
}
