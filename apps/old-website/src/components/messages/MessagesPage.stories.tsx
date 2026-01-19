import type { Meta, StoryObj } from 'storybook-solidjs'
import { MessagesPage } from './MessagesPage'
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar'

const meta: Meta<typeof MessagesPage> = {
  title: 'Messages/MessagesPage',
  component: MessagesPage,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof MessagesPage>

/** Mobile view - full width */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <div class="h-screen bg-background">
        <Story />
      </div>
    ),
  ],
}

/** Desktop view with actual sidebar */
export const Desktop: Story = {
  decorators: [
    (Story) => (
      <div class="h-screen bg-background">
        <DesktopSidebar
          activeTab="messages"
          onTabChange={() => {}}
          isConnected={true}
          username="@neo.eth"
          avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=neo"
        />
        {/* Main content area - offset by sidebar */}
        <div class="md:pl-72 h-screen">
          <div class="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 h-full">
            <Story />
          </div>
        </div>
      </div>
    ),
  ],
}
