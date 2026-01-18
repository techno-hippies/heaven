import type { Meta, StoryObj } from 'storybook-solidjs'
import { MobileFooter } from './MobileFooter'
import { DesktopSidebar } from './DesktopSidebar'

const meta: Meta = {
  title: 'Navigation',
}

export default meta

export const MobileFooterStory: StoryObj = {
  name: 'Mobile Footer',
  render: () => {
    return (
      <div class="h-screen bg-background">
        <div class="p-4">
          <p class="text-foreground">Mobile footer navigation</p>
        </div>
        <MobileFooter />
      </div>
    )
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export const DesktopSidebarStory: StoryObj = {
  name: 'Desktop Sidebar (Disconnected)',
  render: () => {
    return (
      <div class="h-screen bg-background">
        <DesktopSidebar
          isConnected={false}
          onConnect={() => console.log('Connect clicked')}
        />
        <div class="md:ml-72 p-6">
          <p class="text-foreground">Not connected - shows Connect button</p>
        </div>
      </div>
    )
  },
}

export const DesktopSidebarConnected: StoryObj = {
  name: 'Desktop Sidebar (Connected with Username)',
  render: () => {
    return (
      <div class="h-screen bg-background">
        <DesktopSidebar
          isConnected={true}
          username="@neo.eth"
          avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=neo"
        />
        <div class="md:ml-72 p-6">
          <p class="text-foreground">Connected with username</p>
        </div>
      </div>
    )
  },
}

export const DesktopSidebarConnectedNoUsername: StoryObj = {
  name: 'Desktop Sidebar (Connected, No Username)',
  render: () => {
    return (
      <div class="h-screen bg-background">
        <DesktopSidebar
          isConnected={true}
          username="0x1234...5678"
        />
        <div class="md:ml-72 p-6">
          <p class="text-foreground">Connected with truncated address (no username set yet)</p>
        </div>
      </div>
    )
  },
}
