import type { Meta, StoryObj } from 'storybook-solidjs'
import { VoicePage } from './VoicePage'
import { SCARLETT_CHAT } from '../fixtures'

const meta = {
  title: 'Features/Messages/VoicePage',
  component: VoicePage,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'connecting', 'connected', 'error'],
    },
    isMuted: {
      control: 'boolean',
    },
    isBotSpeaking: {
      control: 'boolean',
    },
    duration: {
      control: 'number',
    },
  },
  decorators: [
    (Story) => (
      <div class="h-screen w-full max-w-md mx-auto bg-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VoicePage>

export default meta
type Story = StoryObj<typeof meta>

export const Idle: Story = {
  args: {
    state: 'idle',
    isMuted: false,
    duration: 0,
    name: SCARLETT_CHAT.name,
    avatarUrl: SCARLETT_CHAT.avatar,
  },
}

export const Connecting: Story = {
  args: {
    state: 'connecting',
    isMuted: false,
    duration: 0,
    name: SCARLETT_CHAT.name,
    avatarUrl: SCARLETT_CHAT.avatar,
  },
}

export const Connected: Story = {
  args: {
    state: 'connected',
    isMuted: false,
    duration: 45,
    isBotSpeaking: false,
    name: SCARLETT_CHAT.name,
    avatarUrl: SCARLETT_CHAT.avatar,
  },
}

export const ConnectedSpeaking: Story = {
  args: {
    state: 'connected',
    isMuted: false,
    duration: 127,
    isBotSpeaking: true,
    name: SCARLETT_CHAT.name,
    avatarUrl: SCARLETT_CHAT.avatar,
  },
}

export const ConnectedMuted: Story = {
  args: {
    state: 'connected',
    isMuted: true,
    duration: 63,
    isBotSpeaking: false,
    name: SCARLETT_CHAT.name,
    avatarUrl: SCARLETT_CHAT.avatar,
  },
}

export const Error: Story = {
  args: {
    state: 'error',
    isMuted: false,
    duration: 0,
    name: SCARLETT_CHAT.name,
    avatarUrl: SCARLETT_CHAT.avatar,
  },
}
