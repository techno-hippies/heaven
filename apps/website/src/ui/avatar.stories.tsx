import type { Meta, StoryObj } from 'storybook-solidjs'
import { Avatar } from './avatar'

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

export const Default: Story = {
  args: {
    fallback: 'Neo',
  },
}

export const WithImage: Story = {
  args: {
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neo',
    alt: 'Neo',
  },
}

export const Online: Story = {
  args: {
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sakura',
    alt: 'Sakura',
    online: true,
    size: 'xl',
  },
}

export const AllSizes: Story = {
  render: () => (
    <div class="flex items-end gap-4">
      <Avatar size="xs" fallback="XS" />
      <Avatar size="sm" fallback="SM" />
      <Avatar size="md" fallback="MD" />
      <Avatar size="lg" fallback="LG" />
      <Avatar size="xl" fallback="XL" />
      <Avatar size="2xl" fallback="2X" />
      <Avatar size="3xl" fallback="3X" />
    </div>
  ),
}

export const OnlineStatus: Story = {
  render: () => (
    <div class="flex items-center gap-6">
      <Avatar
        size="xl"
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=alice"
        alt="Alice"
        online={true}
      />
      <Avatar
        size="xl"
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=bob"
        alt="Bob"
        online={false}
      />
    </div>
  ),
}
