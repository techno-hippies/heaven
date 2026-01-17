import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { RangeSlider } from './RangeSlider'

const meta = {
  title: 'Atoms/RangeSlider',
  component: RangeSlider,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div class="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RangeSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Age: Story = {
  render: () => {
    const [age, setAge] = createSignal(28)
    return (
      <RangeSlider
        value={age()}
        onChange={setAge}
        min={18}
        max={65}
        formatValue={(v) => `${v} years old`}
      />
    )
  },
}

export const KinkLevel: Story = {
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
    const [level, setLevel] = createSignal(3)
    return (
      <RangeSlider
        value={level()}
        onChange={setLevel}
        min={1}
        max={7}
        formatValue={(v) => labels[v] ?? String(v)}
      />
    )
  },
}

export const Simple: Story = {
  render: () => {
    const [value, setValue] = createSignal(50)
    return (
      <RangeSlider
        value={value()}
        onChange={setValue}
        min={0}
        max={100}
      />
    )
  },
}
