import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { ChatIdentitySelect, type ChatIdentity } from './ChatIdentitySelect'

const meta: Meta<typeof ChatIdentitySelect> = {
  title: 'Settings/ChatIdentitySelect',
  component: ChatIdentitySelect,
  decorators: [
    (Story) => (
      <div class="max-w-md p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ChatIdentitySelect>

/** All Ethereum Apps selected - default for EOA users */
export const AllEthereumApps: Story = {
  args: {
    value: 'eoa',
  },
}

/** Neodate Only selected */
export const NeodateOnly: Story = {
  args: {
    value: 'pkp',
  },
}

/** Disabled state */
export const Disabled: Story = {
  args: {
    value: 'pkp',
    disabled: true,
  },
}

/** Interactive - simulates user changing preference */
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = createSignal<ChatIdentity>('eoa')
    return (
      <div class="space-y-4">
        <ChatIdentitySelect value={value()} onChange={setValue} />
        <p class="text-sm text-muted-foreground">
          Current: {value() === 'pkp' ? 'Only Neodate' : 'All Ethereum Apps'}
        </p>
      </div>
    )
  },
}

/** In context - as it would appear in Settings page */
export const InSettingsContext: Story = {
  render: () => {
    const [value, setValue] = createSignal<ChatIdentity>('eoa')
    return (
      <div class="space-y-8">
        <div>
          <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
            Privacy & Advanced
          </h2>
          <ChatIdentitySelect value={value()} onChange={setValue} />
        </div>
      </div>
    )
  },
}
