import type { Meta, StoryObj } from 'storybook-solidjs'
import { MessageInput } from './MessageInput'

const meta = {
  title: 'Features/Messages/MessageInput',
  component: MessageInput,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof MessageInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Type a message...',
    onSend: (msg) => console.log('Send:', msg),
  },
}

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Message Emma...',
    onSend: (msg) => console.log('Send:', msg),
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Type a message...',
    disabled: true,
    onSend: (msg) => console.log('Send:', msg),
  },
}

export const FullWidth: Story = {
  decorators: [
    (Story) => (
      <div class="max-w-lg border border-border rounded-lg p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    placeholder: 'Message Scarlett...',
    onSend: (msg) => console.log('Send:', msg),
  },
}
