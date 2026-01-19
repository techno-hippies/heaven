import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Button } from './button'
import { Icon } from '@/icons'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'icon-sm'],
    },
    disabled: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Sync Now',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Settings',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Cancel',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'View All',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Sign Out',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
}

export const WithIcon: Story = {
  render: () => (
    <Button>
      <Icon name="cloud-arrow-up" class="w-4 h-4" />
      Sync Now
    </Button>
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div class="flex flex-wrap gap-3">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
}
