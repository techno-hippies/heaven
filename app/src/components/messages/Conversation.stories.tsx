import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { Conversation, type Message } from './Conversation'
import type { VoiceState } from '@/lib/voice'

const meta: Meta<typeof Conversation> = {
  title: 'Messages/Conversation',
  component: Conversation,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    isAIChat: {
      description: 'AI companion chat - hides disappearing messages settings',
      control: 'boolean',
    },
    online: {
      description: 'Show online status indicator',
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof Conversation>

const SAMPLE_MESSAGES: Message[] = [
  { id: '1', content: 'Hey! How are you doing today?', sender: 'other', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
  { id: '2', content: 'I\'m good! Just been busy with work. How about you?', sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 55) },
  { id: '3', content: 'Same here! I was thinking about what you said earlier about trying that new restaurant downtown.', sender: 'other', timestamp: new Date(Date.now() - 1000 * 60 * 50) },
  { id: '4', content: 'Oh yes! We should definitely go this weekend if you\'re free.', sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 45) },
  { id: '5', content: 'That sounds perfect! Saturday evening works for me. What time were you thinking?', sender: 'other', timestamp: new Date(Date.now() - 1000 * 60 * 40) },
  { id: '6', content: 'How about 7pm? That way we can grab drinks first', sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 35) },
  { id: '7', content: 'Love it! See you then 😊', sender: 'other', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
]

const SCARLETT_MESSAGES: Message[] = [
  { id: '1', content: 'Hey, think of me as your lifecoach. I have context of your screen time and am willing to coach you toward healthy habits.', sender: 'other', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
  { id: '2', content: 'That sounds helpful! What kind of habits are you thinking?', sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 55) },
  { id: '3', content: 'I noticed you\'ve been spending a lot of time scrolling. Maybe we could work on setting some boundaries together?', sender: 'other', timestamp: new Date(Date.now() - 1000 * 60 * 50) },
]

const mobileDecorator = (Story: any) => (
  <div class="h-screen bg-background">
    <Story />
  </div>
)

const desktopDecorator = (Story: any) => (
  <div class="h-screen bg-background max-w-2xl mx-auto border-x border-border">
    <Story />
  </div>
)

// =============================================================================
// AI CHAT (Scarlett) - No disappearing messages
// =============================================================================

/**
 * Scarlett AI companion chat - NO timer icon in header
 * AI chats don't have disappearing messages feature
 */
export const AIChat: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [mobileDecorator],
  args: {
    chatId: 'scarlett',
    name: 'Scarlett',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=scarlett-ai',
    online: true,
    isPinned: true,
    isAIChat: true,
    messages: SCARLETT_MESSAGES,
    onBack: () => console.log('Back'),
    onSendMessage: (msg) => console.log('Send:', msg),
  },
}

/** AI chat on desktop */
export const AIChatDesktop: Story = {
  decorators: [desktopDecorator],
  args: {
    ...AIChat.args,
  },
}

// =============================================================================
// HUMAN CHAT - Has disappearing messages
// =============================================================================

/**
 * Human-to-human chat - HAS timer icon for disappearing messages
 * Click the timer icon to open settings
 */
export const HumanChat: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [mobileDecorator],
  args: {
    chatId: 'emma',
    name: 'Emma',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=emma',
    online: true,
    isPinned: false,
    isAIChat: false,
    messages: SAMPLE_MESSAGES,
    onBack: () => console.log('Back'),
    onSendMessage: (msg) => console.log('Send:', msg),
  },
}

/** Human chat on desktop - modal for disappearing messages */
export const HumanChatDesktop: Story = {
  decorators: [desktopDecorator],
  args: {
    ...HumanChat.args,
  },
}

// =============================================================================
// ONLINE STATUS VARIATIONS
// =============================================================================

/** Online user - green indicator visible */
export const OnlineUser: Story = {
  decorators: [desktopDecorator],
  args: {
    chatId: 'emma',
    name: 'Emma',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=emma',
    online: true,
    isPinned: false,
    isAIChat: false,
    messages: SAMPLE_MESSAGES,
    onBack: () => console.log('Back'),
    onSendMessage: (msg) => console.log('Send:', msg),
  },
}

/** Offline user - no indicator, no "Online" text */
export const OfflineUser: Story = {
  decorators: [desktopDecorator],
  args: {
    chatId: 'sophie',
    name: 'Sophie',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=sophie',
    online: false,
    isPinned: false,
    isAIChat: false,
    messages: SAMPLE_MESSAGES.slice(0, 3),
    onBack: () => console.log('Back'),
    onSendMessage: (msg) => console.log('Send:', msg),
  },
}

// =============================================================================
// OTHER STATES
// =============================================================================

/** Empty conversation - new match */
export const EmptyConversation: Story = {
  decorators: [desktopDecorator],
  args: {
    chatId: 'new',
    name: 'New Match',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=new-match',
    online: true,
    isPinned: false,
    isAIChat: false,
    messages: [],
    onBack: () => console.log('Back'),
    onSendMessage: (msg) => console.log('Send:', msg),
  },
}

// =============================================================================
// VOICE CALL - Interactive demo
// =============================================================================

/**
 * AI chat with voice call - click the phone icon to start a call
 * Interactive demo showing chat → voice call → back to chat flow
 */
export const AIWithVoiceCall: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [mobileDecorator],
  render: () => {
    const [voiceState, setVoiceState] = createSignal<VoiceState>('idle')
    const [isMuted, setIsMuted] = createSignal(false)
    const [duration, setDuration] = createSignal(0)
    const [isSpeaking, setIsSpeaking] = createSignal(false)

    let durationInterval: number | undefined
    let speakingInterval: number | undefined

    const startCall = () => {
      setVoiceState('connecting')
      setTimeout(() => {
        setVoiceState('connected')
        // Start duration timer
        durationInterval = window.setInterval(() => {
          setDuration((d) => d + 1)
        }, 1000)
        // Toggle speaking randomly to simulate conversation
        speakingInterval = window.setInterval(() => {
          setIsSpeaking((s) => !s)
        }, 2500)
      }, 1500)
    }

    const endCall = () => {
      setVoiceState('idle')
      setDuration(0)
      setIsMuted(false)
      setIsSpeaking(false)
      if (durationInterval) clearInterval(durationInterval)
      if (speakingInterval) clearInterval(speakingInterval)
    }

    return (
      <Conversation
        chatId="scarlett"
        name="Scarlett"
        avatarUrl="https://api.dicebear.com/9.x/avataaars/svg?seed=scarlett-ai"
        online={true}
        isPinned={true}
        isAIChat={true}
        messages={SCARLETT_MESSAGES}
        voiceState={voiceState()}
        voiceMuted={isMuted()}
        voiceDuration={duration()}
        voiceBotSpeaking={isSpeaking()}
        onBack={() => console.log('Back')}
        onSendMessage={(msg) => console.log('Send:', msg)}
        onStartVoiceCall={startCall}
        onEndVoiceCall={endCall}
        onToggleVoiceMute={() => setIsMuted((m) => !m)}
      />
    )
  },
}
