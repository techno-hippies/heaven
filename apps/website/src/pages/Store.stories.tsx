import type { Meta, StoryObj } from 'storybook-solidjs'
import StorePage from './Store'

const meta = {
  title: 'Pages/Store',
  component: StorePage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StorePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
