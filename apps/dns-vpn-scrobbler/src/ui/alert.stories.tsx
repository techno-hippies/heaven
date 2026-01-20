import type { Meta, StoryObj } from 'storybook-solidjs'
import { Alert } from './alert'

const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['error', 'warning', 'info'],
    },
    onDismiss: { action: 'dismissed' },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Authentication failed',
    message: 'Something went wrong. Please try again.',
  },
}

export const ErrorNoDismiss: Story = {
  args: {
    variant: 'error',
    title: 'Authentication failed',
    message: 'Something went wrong. Please try again.',
    onDismiss: undefined,
  },
}

export const ErrorMessageOnly: Story = {
  args: {
    variant: 'error',
    message: 'Passkey not found. Make sure you registered on this device.',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Connection unstable',
    message: 'Your connection may be interrupted.',
  },
}

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Syncing scrobbles',
    message: 'Your recent tracks are being uploaded.',
  },
}

export const LongMessage: Story = {
  args: {
    variant: 'error',
    title: 'Authentication failed',
    message: 'The passkey you used is not registered with this account. Please try a different passkey or sign in with your wallet instead.',
  },
}
