import type { Meta, StoryObj } from 'storybook-solidjs'
import { Badge } from './badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'success', 'online'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div class="flex flex-wrap gap-3">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Verified</Badge>
      <Badge variant="online">Online</Badge>
      <Badge variant="destructive">Blocked</Badge>
    </div>
  ),
}

export const ProfileTags: Story = {
  render: () => (
    <div class="flex flex-wrap gap-2">
      <Badge variant="secondary">Music</Badge>
      <Badge variant="secondary">Anime</Badge>
      <Badge variant="secondary">Coffee</Badge>
      <Badge variant="secondary">Travel</Badge>
      <Badge variant="secondary">Tech</Badge>
    </div>
  ),
}

export const StatusBadges: Story = {
  render: () => (
    <div class="flex flex-wrap gap-3">
      <Badge variant="online">Online Now</Badge>
      <Badge variant="success">Verified</Badge>
      <Badge variant="default">Premium</Badge>
    </div>
  ),
}
