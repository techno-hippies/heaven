import type { Meta, StoryObj } from 'storybook-solidjs'
import { MessagesList } from './MessagesList'
import { SCARLETT_CHAT, SAMPLE_CHATS } from '../fixtures'

const meta = {
  title: 'Features/Messages/MessagesList',
  component: MessagesList,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MessagesList>

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
  args: {
    chats: [SCARLETT_CHAT, ...SAMPLE_CHATS],
    onSelectChat: (id) => console.log('Selected:', id),
  },
}

export const Desktop: Story = {
  decorators: [
    (Story) => (
      <div class="h-screen bg-background max-w-2xl mx-auto">
        <Story />
      </div>
    ),
  ],
  args: {
    chats: [SCARLETT_CHAT, ...SAMPLE_CHATS],
    onSelectChat: (id) => console.log('Selected:', id),
  },
}

export const Empty: Story = {
  decorators: [
    (Story) => (
      <div class="h-screen bg-background max-w-2xl mx-auto">
        <Story />
      </div>
    ),
  ],
  args: {
    chats: [],
    onSelectChat: (id) => console.log('Selected:', id),
  },
}
