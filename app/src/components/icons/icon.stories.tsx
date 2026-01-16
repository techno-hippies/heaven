import type { Meta, StoryObj } from 'storybook-solidjs'
import { Icon, type IconName } from './index'

const meta: Meta<typeof Icon> = {
  title: 'UI/Icon',
  component: Icon,
  argTypes: {
    name: {
      control: 'select',
      options: ['house', 'chat-circle', 'user', 'heart', 'x', 'check', 'gear', 'bell', 'camera', 'sparkle', 'shield-check', 'globe', 'music-note', 'map-pin', 'star'],
    },
    weight: {
      control: 'select',
      options: ['regular', 'fill', 'bold'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Icon>

export const Default: Story = {
  args: {
    name: 'heart',
    weight: 'regular',
    class: 'text-2xl',
  },
}

export const AllIcons: Story = {
  render: () => {
    const icons: IconName[] = [
      'house', 'chat-circle', 'user', 'heart', 'x', 'check', 'gear',
      'caret-left', 'caret-right', 'paper-plane-right', 'magnifying-glass',
      'bell', 'camera', 'image', 'sparkle', 'shield-check', 'globe', 'link',
      'music-note', 'map-pin', 'star', 'warning', 'info', 'sign-out', 'plus',
      'dots-three', 'copy', 'pencil', 'trash', 'eye', 'eye-slash',
      'circle-notch', 'check-circle', 'x-circle', 'wifi-high', 'wifi-slash',
      'lock-simple', 'user-circle', 'users', 'seal-check'
    ]

    return (
      <div class="grid grid-cols-8 gap-4">
        {icons.map((name) => (
          <div class="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/50">
            <Icon name={name} class="text-2xl text-foreground" />
            <span class="text-xs text-muted-foreground">{name}</span>
          </div>
        ))}
      </div>
    )
  },
}

export const Weights: Story = {
  render: () => (
    <div class="flex gap-8">
      <div class="flex flex-col items-center gap-2">
        <Icon name="heart" weight="regular" class="text-4xl text-primary" />
        <span class="text-sm text-muted-foreground">Regular</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Icon name="heart" weight="fill" class="text-4xl text-primary" />
        <span class="text-sm text-muted-foreground">Fill</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Icon name="heart" weight="bold" class="text-4xl text-primary" />
        <span class="text-sm text-muted-foreground">Bold</span>
      </div>
    </div>
  ),
}

export const NavigationIcons: Story = {
  render: () => (
    <div class="flex gap-6 p-4 bg-card rounded-2xl">
      <div class="flex flex-col items-center gap-1">
        <Icon name="house" weight="fill" class="text-2xl text-primary" />
        <span class="text-xs text-primary">Home</span>
      </div>
      <div class="flex flex-col items-center gap-1">
        <Icon name="chat-circle" class="text-2xl text-muted-foreground" />
        <span class="text-xs text-muted-foreground">Messages</span>
      </div>
      <div class="flex flex-col items-center gap-1">
        <Icon name="user" class="text-2xl text-muted-foreground" />
        <span class="text-xs text-muted-foreground">Profile</span>
      </div>
    </div>
  ),
}

export const ActionIcons: Story = {
  render: () => (
    <div class="flex gap-4">
      <button class="p-4 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
        <Icon name="x" class="text-2xl text-foreground" />
      </button>
      <button class="p-4 rounded-full bg-primary hover:bg-primary/90 transition-all">
        <Icon name="heart" weight="fill" class="text-2xl text-white" />
      </button>
      <button class="p-4 rounded-full bg-amber-400 hover:bg-amber-300 transition-all">
        <Icon name="star" weight="fill" class="text-2xl text-amber-900" />
      </button>
    </div>
  ),
}
