import type { Meta, StoryObj } from 'storybook-solidjs'
import { IconButton } from './icon-button'

const meta: Meta<typeof IconButton> = {
  title: 'UI/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'ghost', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof IconButton>

/** Default primary button */
export const Default: Story = {
  args: {
    icon: 'paper-plane-right',
    weight: 'fill',
    label: 'Send message',
    variant: 'default',
    size: 'md',
  },
}

/** Ghost variant - for headers */
export const Ghost: Story = {
  args: {
    icon: 'caret-left',
    label: 'Go back',
    variant: 'ghost',
    size: 'md',
  },
}

/** Secondary variant */
export const Secondary: Story = {
  args: {
    icon: 'gear',
    label: 'Settings',
    variant: 'secondary',
    size: 'md',
  },
}

/** Outline variant */
export const Outline: Story = {
  args: {
    icon: 'plus',
    label: 'Add',
    variant: 'outline',
    size: 'md',
  },
}

/** Small size */
export const Small: Story = {
  args: {
    icon: 'x',
    label: 'Close',
    variant: 'ghost',
    size: 'sm',
  },
}

/** Large size */
export const Large: Story = {
  args: {
    icon: 'heart',
    weight: 'fill',
    label: 'Like',
    variant: 'default',
    size: 'lg',
  },
}

/** Disabled state */
export const Disabled: Story = {
  args: {
    icon: 'paper-plane-right',
    weight: 'fill',
    label: 'Send message',
    variant: 'default',
    size: 'md',
    disabled: true,
  },
}

/** Common use cases */
export const CommonUseCases: Story = {
  render: () => (
    <div class="flex flex-col gap-6">
      {/* Header navigation */}
      <div class="flex items-center gap-4">
        <span class="text-muted-foreground text-sm w-32">Header nav:</span>
        <IconButton icon="caret-left" label="Go back" variant="ghost" size="md" />
        <IconButton icon="x" label="Close" variant="ghost" size="md" />
        <IconButton icon="timer" label="Settings" variant="ghost" size="md" />
      </div>

      {/* Action buttons */}
      <div class="flex items-center gap-4">
        <span class="text-muted-foreground text-sm w-32">Actions:</span>
        <IconButton icon="paper-plane-right" weight="fill" label="Send" variant="default" size="md" />
        <IconButton icon="heart" weight="fill" label="Like" variant="default" size="lg" />
        <IconButton icon="plus" label="Add" variant="secondary" size="md" />
      </div>

      {/* Size comparison */}
      <div class="flex items-center gap-4">
        <span class="text-muted-foreground text-sm w-32">Sizes:</span>
        <IconButton icon="heart" label="Small" variant="default" size="sm" />
        <IconButton icon="heart" label="Medium" variant="default" size="md" />
        <IconButton icon="heart" label="Large" variant="default" size="lg" />
      </div>
    </div>
  ),
}
