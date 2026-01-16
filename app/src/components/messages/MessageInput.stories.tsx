import type { Meta, StoryObj } from 'storybook-solidjs'
import { MessageInput } from './MessageInput'

const meta: Meta<typeof MessageInput> = {
  title: 'Messages/MessageInput',
  component: MessageInput,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof MessageInput>

/** Default input */
export const Default: Story = {
  args: {
    placeholder: 'Type a message...',
    onSend: (msg) => console.log('Send:', msg),
  },
}

/** With custom placeholder */
export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Message Emma...',
    onSend: (msg) => console.log('Send:', msg),
  },
}

/** Disabled state */
export const Disabled: Story = {
  args: {
    placeholder: 'Type a message...',
    disabled: true,
    onSend: (msg) => console.log('Send:', msg),
  },
}

/** Full width in container */
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
