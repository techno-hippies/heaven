import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { AppHeader } from './app-header'

const meta: Meta<typeof AppHeader> = {
  title: 'Layout/AppHeader',
  component: AppHeader,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div class="bg-background">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AppHeader>

export const Connected: Story = {
  args: {
    vpnOn: true,
  },
}

export const Disconnected: Story = {
  args: {
    vpnOn: false,
  },
}

export const Connecting: Story = {
  args: {
    vpnOn: false,
    vpnLoading: true,
  },
}

/** All states */
export const AllStates: Story = {
  render: () => (
    <div class="space-y-2 p-2">
      <p class="text-xs text-muted-foreground px-2">Connected:</p>
      <AppHeader vpnOn={true} />
      <p class="text-xs text-muted-foreground px-2 pt-4">Disconnected:</p>
      <AppHeader vpnOn={false} />
      <p class="text-xs text-muted-foreground px-2 pt-4">Connecting:</p>
      <AppHeader vpnOn={false} vpnLoading={true} />
    </div>
  ),
}

/** Interactive - click toggle */
export const Interactive: Story = {
  render: () => {
    const [on, setOn] = createSignal(false)
    const [loading, setLoading] = createSignal(false)

    const handleChange = (value: boolean) => {
      setLoading(true)
      setTimeout(() => {
        setOn(value)
        setLoading(false)
      }, 1500)
    }

    return (
      <AppHeader
        vpnOn={on()}
        vpnLoading={loading()}
        onVpnChange={handleChange}
        onSettings={() => alert('Settings')}
      />
    )
  },
}
