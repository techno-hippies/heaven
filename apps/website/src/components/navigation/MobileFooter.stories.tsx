import type { Meta, StoryObj } from 'storybook-solidjs'
import { MobileFooter } from './MobileFooter'

const meta = {
  title: 'Components/Navigation/MobileFooter',
  component: MobileFooter,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
} satisfies Meta<typeof MobileFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
