import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { DualRange } from './DualRange'

const meta = {
  title: 'Atoms/DualRange',
  component: DualRange,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div class="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DualRange>

export default meta
type Story = StoryObj<typeof meta>

export const AgeRange: Story = {
  render: () => {
    const [min, setMin] = createSignal(25)
    const [max, setMax] = createSignal(35)
    return (
      <DualRange
        minValue={min()}
        maxValue={max()}
        onChange={(newMin, newMax) => {
          setMin(newMin)
          setMax(newMax)
        }}
        min={18}
        max={65}
        formatValue={(v) => String(v)}
      />
    )
  },
}

export const KinkRange: Story = {
  render: () => {
    const labels: Record<number, string> = {
      1: 'Vanilla',
      2: 'Mostly vanilla',
      3: 'Open-minded',
      4: 'Adventurous',
      5: 'Kinky',
      6: 'Very kinky',
      7: 'Lifestyle',
    }
    const [min, setMin] = createSignal(2)
    const [max, setMax] = createSignal(5)
    return (
      <div class="flex flex-col gap-4">
        <DualRange
          minValue={min()}
          maxValue={max()}
          onChange={(newMin, newMax) => {
            setMin(newMin)
            setMax(newMax)
          }}
          min={1}
          max={7}
          formatValue={(v) => labels[v] ?? String(v)}
        />
        <p class="text-base text-zinc-400 text-center">
          Accepting: {labels[min()]} to {labels[max()]}
        </p>
      </div>
    )
  },
}

export const Wide: Story = {
  render: () => {
    const [min, setMin] = createSignal(18)
    const [max, setMax] = createSignal(99)
    return (
      <DualRange
        minValue={min()}
        maxValue={max()}
        onChange={(newMin, newMax) => {
          setMin(newMin)
          setMax(newMax)
        }}
        min={18}
        max={99}
      />
    )
  },
}
