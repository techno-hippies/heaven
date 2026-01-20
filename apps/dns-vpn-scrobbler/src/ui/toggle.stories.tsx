import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { Toggle } from './toggle'

const meta: Meta<typeof Toggle> = {
  title: 'UI/Toggle',
  component: Toggle,
}

export default meta
type Story = StoryObj<typeof Toggle>

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = createSignal(false)
    return (
      <div class="flex items-center gap-3">
        <Toggle checked={checked()} onChange={setChecked} />
        <span class="text-foreground">{checked() ? 'On' : 'Off'}</span>
      </div>
    )
  },
}

export const Checked: Story = {
  render: () => {
    const [checked, setChecked] = createSignal(true)
    return <Toggle checked={checked()} onChange={setChecked} />
  },
}

export const WithLabel: Story = {
  render: () => {
    const [notifications, setNotifications] = createSignal(true)
    const [dnsSharing, setDnsSharing] = createSignal(false)
    return (
      <div class="space-y-4">
        <div class="flex items-center justify-between w-64">
          <span class="text-foreground">Push Notifications</span>
          <Toggle checked={notifications()} onChange={setNotifications} />
        </div>
        <div class="flex items-center justify-between w-64">
          <span class="text-foreground">Share DNS Data</span>
          <Toggle checked={dnsSharing()} onChange={setDnsSharing} />
        </div>
      </div>
    )
  },
}
