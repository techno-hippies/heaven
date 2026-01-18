import type { Meta, StoryObj } from 'storybook-solidjs'
import { DesktopSidebar } from './DesktopSidebar'

const meta = {
  title: 'Components/Navigation/DesktopSidebar',
  component: DesktopSidebar,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DesktopSidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Disconnected: Story = {
  args: {
    isConnected: false,
    onConnect: () => console.log('Connect clicked'),
  },
}

export const Connected: Story = {
  args: {
    isConnected: true,
    username: '0x1234...5678',
    onConnect: () => console.log('Connect clicked'),
  },
}

export const ConnectedWithAvatar: Story = {
  args: {
    isConnected: true,
    username: 'alice.eth',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    onConnect: () => console.log('Connect clicked'),
  },
}
