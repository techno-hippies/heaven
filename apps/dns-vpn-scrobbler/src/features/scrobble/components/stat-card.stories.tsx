import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { StatCard } from './stat-card'

const meta: Meta<typeof StatCard> = {
  title: 'Features/Scrobble/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div class="max-w-xs">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof StatCard>

export const Today: Story = {
  args: {
    value: 47,
    label: 'Today',
  },
}

export const Pending: Story = {
  args: {
    value: 2,
    label: 'Pending',
  },
}

export const LargeNumber: Story = {
  args: {
    value: 12847,
    label: 'Scrobbles',
  },
}

export const StatsGrid: Story = {
  render: () => (
    <div class="grid grid-cols-2 gap-4 max-w-md">
      <StatCard value={47} label="Today" />
      <StatCard value={2} label="Pending" />
    </div>
  ),
}
