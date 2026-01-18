import type { Meta, StoryObj } from 'storybook-solidjs'
import { MessageBubble } from './MessageBubble'

const meta = {
  title: 'Features/Messages/MessageBubble',
  component: MessageBubble,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    sender: {
      control: 'select',
      options: ['user', 'other'],
    },
  },
} satisfies Meta<typeof MessageBubble>

export default meta
type Story = StoryObj<typeof meta>

export const UserMessage: Story = {
  args: {
    content: 'Hey! How about we meet at 7pm?',
    sender: 'user',
    timestamp: new Date(),
  },
}

export const OtherMessage: Story = {
  args: {
    content: "That sounds perfect! I'll see you there.",
    sender: 'other',
    timestamp: new Date(),
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=emma',
    avatarFallback: 'Emma',
    showAvatar: true,
  },
}

export const OtherMessageNoAvatar: Story = {
  args: {
    content: 'Let me check my calendar real quick.',
    sender: 'other',
    timestamp: new Date(),
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=emma',
    avatarFallback: 'Emma',
    showAvatar: false,
  },
}

export const LongMessage: Story = {
  args: {
    content: 'I was thinking about what you said earlier about trying that new restaurant downtown. We should definitely check it out this weekend if you\'re free! I heard they have amazing pasta and the atmosphere is really nice.',
    sender: 'other',
    timestamp: new Date(),
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=scarlett',
    avatarFallback: 'Scarlett',
    showAvatar: true,
  },
}

export const ConversationPreview: Story = {
  render: () => (
    <div class="space-y-2 max-w-lg">
      <MessageBubble
        content="Hey! How are you?"
        sender="other"
        timestamp={new Date(Date.now() - 1000 * 60 * 5)}
        avatarUrl="https://api.dicebear.com/9.x/avataaars/svg?seed=scarlett"
        avatarFallback="Scarlett"
        showAvatar={false}
      />
      <MessageBubble
        content="I was thinking about that movie we talked about"
        sender="other"
        timestamp={new Date(Date.now() - 1000 * 60 * 4)}
        avatarUrl="https://api.dicebear.com/9.x/avataaars/svg?seed=scarlett"
        avatarFallback="Scarlett"
        showAvatar={true}
      />
      <MessageBubble
        content="I'm doing great! Yeah, let's watch it this weekend"
        sender="user"
        timestamp={new Date(Date.now() - 1000 * 60 * 3)}
      />
      <MessageBubble
        content="Perfect! Saturday evening works for me"
        sender="other"
        timestamp={new Date(Date.now() - 1000 * 60 * 2)}
        avatarUrl="https://api.dicebear.com/9.x/avataaars/svg?seed=scarlett"
        avatarFallback="Scarlett"
        showAvatar={true}
      />
    </div>
  ),
}
