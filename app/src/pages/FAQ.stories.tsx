import type { Meta, StoryObj } from 'storybook-solidjs'
import { FAQ } from './FAQ'

const meta: Meta<typeof FAQ> = {
  title: 'Pages/FAQ',
  component: FAQ,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof FAQ>

export const Default: Story = {}
