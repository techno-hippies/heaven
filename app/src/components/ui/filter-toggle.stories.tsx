import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { FilterToggle } from './filter-toggle'

const meta: Meta<typeof FilterToggle> = {
  title: 'UI/FilterToggle',
  component: FilterToggle,
}

export default meta
type Story = StoryObj<typeof FilterToggle>

/** Default state - filter OFF (signal only) */
export const FilterOff: Story = {
  render: () => {
    const [enabled, setEnabled] = createSignal(false)
    return (
      <div class="max-w-md">
        <FilterToggle enabled={enabled()} onChange={setEnabled} />
        <p class="mt-4 text-sm text-muted-foreground">
          State: {enabled() ? 'Filter ON (dealbreaker)' : 'Filter OFF (signal)'}
        </p>
      </div>
    )
  },
}

/** Filter ON state (dealbreaker) */
export const FilterOn: Story = {
  render: () => {
    const [enabled, setEnabled] = createSignal(true)
    return (
      <div class="max-w-md">
        <FilterToggle enabled={enabled()} onChange={setEnabled} />
      </div>
    )
  },
}

/** Custom labels */
export const CustomLabels: Story = {
  render: () => {
    const [enabled, setEnabled] = createSignal(false)
    return (
      <div class="max-w-md">
        <FilterToggle
          enabled={enabled()}
          onChange={setEnabled}
          label="Must match"
          description={
            enabled()
              ? "This is a dealbreaker - they must match"
              : "This is a preference, not a requirement"
          }
        />
      </div>
    )
  },
}
