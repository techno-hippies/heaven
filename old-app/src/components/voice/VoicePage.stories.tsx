import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { VoicePage } from './VoicePage'
import type { VoiceState } from '@/lib/voice'

const meta: Meta<typeof VoicePage> = {
  title: 'Voice/VoicePage',
  component: VoicePage,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'connecting', 'connected', 'error'],
      description: 'Current voice connection state',
    },
    isMuted: {
      control: 'boolean',
      description: 'Whether microphone is muted',
    },
    isBotSpeaking: {
      control: 'boolean',
      description: 'Whether the AI is currently speaking',
    },
    duration: {
      control: 'number',
      description: 'Call duration in seconds',
    },
  },
}

export default meta
type Story = StoryObj<typeof VoicePage>

const mobileDecorator = (Story: any) => (
  <div class="h-screen bg-background">
    <Story />
  </div>
)

const desktopDecorator = (Story: any) => (
  <div class="h-screen bg-background max-w-md mx-auto border-x border-border">
    <Story />
  </div>
)

// =============================================================================
// IDLE STATE - Ready to start call
// =============================================================================

/** Idle state - tap to start call */
export const Idle: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [mobileDecorator],
  args: {
    state: 'idle',
    isMuted: false,
    duration: 0,
    isBotSpeaking: false,
    name: 'Scarlett',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=scarlett-ai',
    onBack: () => console.log('Back'),
    onStartCall: () => console.log('Start call'),
    onEndCall: () => console.log('End call'),
    onToggleMute: () => console.log('Toggle mute'),
  },
}

/** Idle on desktop */
export const IdleDesktop: Story = {
  decorators: [desktopDecorator],
  args: {
    ...Idle.args,
  },
}

// =============================================================================
// CONNECTING STATE
// =============================================================================

/** Connecting to voice service */
export const Connecting: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [mobileDecorator],
  args: {
    state: 'connecting',
    isMuted: false,
    duration: 0,
    isBotSpeaking: false,
    name: 'Scarlett',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=scarlett-ai',
    onBack: () => console.log('Back'),
    onStartCall: () => console.log('Start call'),
    onEndCall: () => console.log('End call'),
    onToggleMute: () => console.log('Toggle mute'),
  },
}

// =============================================================================
// CONNECTED STATE - Active call
// =============================================================================

/** Connected and listening (AI not speaking) */
export const ConnectedListening: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [mobileDecorator],
  args: {
    state: 'connected',
    isMuted: false,
    duration: 45,
    isBotSpeaking: false,
    name: 'Scarlett',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=scarlett-ai',
    onBack: () => console.log('Back'),
    onStartCall: () => console.log('Start call'),
    onEndCall: () => console.log('End call'),
    onToggleMute: () => console.log('Toggle mute'),
  },
}

/** Connected and AI is speaking */
export const ConnectedSpeaking: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [mobileDecorator],
  args: {
    state: 'connected',
    isMuted: false,
    duration: 127,
    isBotSpeaking: true,
    name: 'Scarlett',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=scarlett-ai',
    onBack: () => console.log('Back'),
    onStartCall: () => console.log('Start call'),
    onEndCall: () => console.log('End call'),
    onToggleMute: () => console.log('Toggle mute'),
  },
}

/** Connected with microphone muted */
export const ConnectedMuted: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [mobileDecorator],
  args: {
    state: 'connected',
    isMuted: true,
    duration: 89,
    isBotSpeaking: false,
    name: 'Scarlett',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=scarlett-ai',
    onBack: () => console.log('Back'),
    onStartCall: () => console.log('Start call'),
    onEndCall: () => console.log('End call'),
    onToggleMute: () => console.log('Toggle mute'),
  },
}

/** Long call duration display */
export const LongDuration: Story = {
  decorators: [desktopDecorator],
  args: {
    state: 'connected',
    isMuted: false,
    duration: 3661, // 1 hour 1 minute 1 second
    isBotSpeaking: true,
    name: 'Scarlett',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=scarlett-ai',
    onBack: () => console.log('Back'),
    onStartCall: () => console.log('Start call'),
    onEndCall: () => console.log('End call'),
    onToggleMute: () => console.log('Toggle mute'),
  },
}

// =============================================================================
// ERROR STATE
// =============================================================================

/** Connection error */
export const Error: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [mobileDecorator],
  args: {
    state: 'error',
    isMuted: false,
    duration: 0,
    isBotSpeaking: false,
    name: 'Scarlett',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=scarlett-ai',
    onBack: () => console.log('Back'),
    onStartCall: () => console.log('Retry call'),
    onEndCall: () => console.log('End call'),
    onToggleMute: () => console.log('Toggle mute'),
  },
}

// =============================================================================
// INTERACTIVE DEMO
// =============================================================================

/** Interactive demo with state transitions */
export const Interactive: Story = {
  decorators: [mobileDecorator],
  render: () => {
    const [state, setState] = createSignal<VoiceState>('idle')
    const [isMuted, setIsMuted] = createSignal(false)
    const [duration, setDuration] = createSignal(0)
    const [isSpeaking, setIsSpeaking] = createSignal(false)

    let durationInterval: number | undefined
    let speakingInterval: number | undefined

    const startCall = () => {
      setState('connecting')
      setTimeout(() => {
        setState('connected')
        // Start duration timer
        durationInterval = window.setInterval(() => {
          setDuration((d) => d + 1)
        }, 1000)
        // Toggle speaking randomly
        speakingInterval = window.setInterval(() => {
          setIsSpeaking((s) => !s)
        }, 2000)
      }, 2000)
    }

    const endCall = () => {
      setState('idle')
      setDuration(0)
      setIsMuted(false)
      setIsSpeaking(false)
      if (durationInterval) clearInterval(durationInterval)
      if (speakingInterval) clearInterval(speakingInterval)
    }

    return (
      <VoicePage
        state={state()}
        isMuted={isMuted()}
        duration={duration()}
        isBotSpeaking={isSpeaking()}
        name="Scarlett"
        avatarUrl="https://api.dicebear.com/9.x/avataaars/svg?seed=scarlett-ai"
        onBack={() => console.log('Back')}
        onStartCall={startCall}
        onEndCall={endCall}
        onToggleMute={() => setIsMuted((m) => !m)}
      />
    )
  },
}
