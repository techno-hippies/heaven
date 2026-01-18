import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { StrictFilter } from './strict-filter'

const meta = {
  title: 'Components/StrictFilter',
  component: StrictFilter,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof StrictFilter>

export default meta
type Story = StoryObj<typeof meta>

export const Off: Story = {
  render: () => {
    const [enabled, setEnabled] = createSignal(false)
    return (
      <div class="w-full max-w-md">
        <StrictFilter enabled={enabled()} onChange={setEnabled} />
      </div>
    )
  },
}

export const On: Story = {
  render: () => {
    const [enabled, setEnabled] = createSignal(true)
    return (
      <div class="w-full max-w-md">
        <StrictFilter enabled={enabled()} onChange={setEnabled} />
      </div>
    )
  },
}

export const InContext: Story = {
  render: () => {
    const [enabled, setEnabled] = createSignal(false)
    return (
      <div class="w-full max-w-md space-y-4">
        <div class="flex flex-wrap gap-2">
          <button class="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm">
            Want children
          </button>
          <button class="px-4 py-2 rounded-full border border-border text-sm">
            Open to children
          </button>
        </div>
        <StrictFilter enabled={enabled()} onChange={setEnabled} />
      </div>
    )
  },
}
