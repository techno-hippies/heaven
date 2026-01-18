import type { Meta, StoryObj } from 'storybook-solidjs'
import { Spinner } from './spinner'

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const ExtraSmall: Story = {
  args: {
    size: 'xs',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    size: 'md',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
  },
}

export const AllSizes: Story = {
  render: () => (
    <div class="flex items-center gap-8">
      <div class="flex flex-col items-center gap-2">
        <Spinner size="xs" />
        <span class="text-xs text-muted-foreground">xs</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Spinner size="sm" />
        <span class="text-xs text-muted-foreground">sm</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Spinner size="md" />
        <span class="text-xs text-muted-foreground">md</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Spinner size="lg" />
        <span class="text-xs text-muted-foreground">lg</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Spinner size="xl" />
        <span class="text-xs text-muted-foreground">xl</span>
      </div>
    </div>
  ),
}
