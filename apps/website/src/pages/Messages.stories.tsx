import type { Meta, StoryObj } from 'storybook-solidjs'
import { MessagesPage } from './Messages'
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar'

const meta = {
  title: 'Pages/Messages',
  component: MessagesPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MessagesPage>

export default meta
type Story = StoryObj<typeof meta>

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
        <div class="md:pl-72 h-screen">
          <div class="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 h-full">
            <Story />
          </div>
        </div>
      </div>
    ),
  ],
}
