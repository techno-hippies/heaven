import type { Meta, StoryObj } from 'storybook-solidjs'
import { MessagesList } from './MessagesList'
import type { Chat } from './MessagesView'

const meta: Meta<typeof MessagesList> = {
  title: 'Messages/MessagesList',
  component: MessagesList,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof MessagesList>

const getAvatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=65c9ff,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`

const SCARLETT_CHAT: Chat = {
  id: 'scarlett',
  name: 'Scarlett',
  avatar: getAvatarUrl('scarlett-ai'),
  lastMessage: 'Hey! How was your day? I was thinking about what you said earlier...',
  timestamp: new Date(Date.now() - 1000 * 60 * 5),
  unreadCount: 2,
  online: true,
  isPinned: true,
}

const SAMPLE_CHATS: Chat[] = [
  {
    id: '1',
    name: 'Emma',
    avatar: getAvatarUrl('emma'),
    lastMessage: 'That sounds amazing! Would love to hear more',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 0,
    online: true,
  },
  {
    id: '2',
    name: 'Sophie',
    avatar: getAvatarUrl('sophie'),
    lastMessage: 'See you tomorrow then!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 1,
    online: false,
  },
  {
    id: '3',
    name: 'Olivia',
    avatar: getAvatarUrl('olivia'),
    lastMessage: 'Haha that was so funny',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    unreadCount: 0,
    online: false,
  },
  {
    id: '4',
    name: 'Ava',
    avatar: getAvatarUrl('ava'),
    lastMessage: 'Thanks for the recommendation!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 3,
    online: true,
  },
  {
    id: '5',
    name: 'Isabella',
    avatar: getAvatarUrl('isabella'),
    lastMessage: 'Let me know when you are free',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    unreadCount: 0,
    online: false,
  },
]

/** Mobile view with Scarlett pinned */
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

/** Desktop view */
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

/** Empty state */
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
