import type { Meta, StoryObj } from 'storybook-solidjs'
import { Welcome } from './Welcome'

const meta: Meta<typeof Welcome> = {
  title: 'Pages/Welcome',
  component: Welcome,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof Welcome>

export const Default: Story = {
  args: {
    onDownloadVpn: () => console.log('Download VPN clicked'),
  },
}
