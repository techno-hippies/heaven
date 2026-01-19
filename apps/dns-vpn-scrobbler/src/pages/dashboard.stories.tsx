import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Dashboard } from './dashboard'

const meta: Meta<typeof Dashboard> = {
  title: 'Pages/Dashboard',
  component: Dashboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof Dashboard>

export const Default: Story = {
  args: {},
}
