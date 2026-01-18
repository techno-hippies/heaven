import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { PolicyChip, type Policy } from './PolicyChip'

const meta = {
  title: 'Atoms/PolicyChip',
  component: PolicyChip,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div class="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PolicyChip>

export default meta
type Story = StoryObj<typeof meta>

export const AllStates: Story = {
  render: () => (
    <div class="flex flex-col gap-4">
      <div class="flex gap-2">
        <PolicyChip policy="NONE" selected={true} onClick={() => {}} />
        <PolicyChip policy="DEALBREAKER" selected={false} onClick={() => {}} />
        <PolicyChip policy="CRITERIA" selected={false} onClick={() => {}} />
      </div>
      <div class="flex gap-2">
        <PolicyChip policy="NONE" selected={false} onClick={() => {}} />
        <PolicyChip policy="DEALBREAKER" selected={true} onClick={() => {}} />
        <PolicyChip policy="CRITERIA" selected={false} onClick={() => {}} />
      </div>
      <div class="flex gap-2">
        <PolicyChip policy="NONE" selected={false} onClick={() => {}} />
        <PolicyChip policy="DEALBREAKER" selected={false} onClick={() => {}} />
        <PolicyChip policy="CRITERIA" selected={true} onClick={() => {}} />
      </div>
    </div>
  ),
}

export const Interactive: Story = {
  render: () => {
    const [policy, setPolicy] = createSignal<Policy>('NONE')
    return (
      <div class="flex flex-col gap-4">
        <div class="flex gap-2">
          <PolicyChip
            policy="NONE"
            selected={policy() === 'NONE'}
            onClick={() => setPolicy('NONE')}
          />
          <PolicyChip
            policy="DEALBREAKER"
            selected={policy() === 'DEALBREAKER'}
            onClick={() => setPolicy('DEALBREAKER')}
          />
          <PolicyChip
            policy="CRITERIA"
            selected={policy() === 'CRITERIA'}
            onClick={() => setPolicy('CRITERIA')}
          />
        </div>
        <p class="text-sm text-zinc-400">Selected: {policy()}</p>
      </div>
    )
  },
}
