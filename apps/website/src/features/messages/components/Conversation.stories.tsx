import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { Conversation } from './Conversation'
import { SAMPLE_MESSAGES, SCARLETT_MESSAGES } from '../fixtures'
import type { VoiceState } from '../types'

const meta = {
  title: 'Features/Messages/Conversation',
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
} satisfies Meta<typeof Conversation>

export default meta
type Story = StoryObj<typeof meta>

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

export const AIChatDesktop: Story = {
  decorators: [desktopDecorator],
  args: {
    ...AIChat.args,
  },
}

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

export const HumanChatDesktop: Story = {
  decorators: [desktopDecorator],
  args: {
    ...HumanChat.args,
  },
}

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
        durationInterval = window.setInterval(() => {
          setDuration((d) => d + 1)
        }, 1000)
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
