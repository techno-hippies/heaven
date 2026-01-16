import type { Meta, StoryObj } from 'storybook-solidjs'
import { Button } from './Button'

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'muted', 'like', 'pass', 'superlike', 'gradient', 'link'],
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'xl', 'icon', 'icon-sm', 'icon-lg', 'icon-xl'],
    },
    rounded: {
      control: 'select',
      options: ['default', 'full'],
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
}

export const Gradient: Story = {
  args: {
    variant: 'gradient',
    children: 'Get Started',
    size: 'lg',
  },
}

export const Like: Story = {
  args: {
    variant: 'like',
    size: 'icon-xl',
    rounded: 'full',
    children: (
      <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
}

export const Pass: Story = {
  args: {
    variant: 'pass',
    size: 'icon-xl',
    rounded: 'full',
    children: (
      <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
}

export const Superlike: Story = {
  args: {
    variant: 'superlike',
    size: 'icon-lg',
    rounded: 'full',
    children: (
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
}

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div class="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="muted">Muted</Button>
      <Button variant="gradient">Gradient</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div class="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
}

export const SwipeActions: Story = {
  render: () => (
    <div class="flex items-center gap-6">
      <Button variant="pass" size="icon-xl" rounded="full">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Button>
      <Button variant="superlike" size="icon-lg" rounded="full">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </Button>
      <Button variant="like" size="icon-xl" rounded="full">
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </Button>
    </div>
  ),
}
