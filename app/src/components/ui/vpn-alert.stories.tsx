import type { Meta, StoryObj } from 'storybook-solidjs'
import { VpnAlert } from './vpn-alert'

const meta: Meta<typeof VpnAlert> = {
  title: 'UI/VpnAlert',
  component: VpnAlert,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof VpnAlert>

export const Default: Story = {
  args: {
    onDownload: (platform) => console.log('Download:', platform),
  },
  render: (args) => (
    <div class="bg-background min-h-screen">
      <VpnAlert {...args} />
      <div class="p-6">
        <p class="text-muted-foreground">Page content goes below the alert...</p>
      </div>
    </div>
  ),
}

export const InContext: Story = {
  render: () => (
    <div class="bg-background min-h-screen">
      <VpnAlert />
      <div class="p-6 space-y-4">
        <h1 class="text-2xl font-bold">Home</h1>
        <p class="text-muted-foreground">
          This shows how the alert looks at the top of a page.
          The alert is not dismissible and prompts users to download
          the DNS VPN for behavioral matching.
        </p>
      </div>
    </div>
  ),
}
