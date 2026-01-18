import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { RangeSlider } from './range-slider'

const meta = {
  title: 'UI/RangeSlider',
  component: RangeSlider,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof RangeSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [value, setValue] = createSignal<[number, number]>([18, 45])
    return (
      <div class="w-full max-w-md space-y-4">
        <RangeSlider
          min={18}
          max={99}
          value={value()}
          onChange={setValue}
        />
        <p class="text-center text-muted-foreground">
          {value()[0]} - {value()[1]}
        </p>
      </div>
    )
  },
}

export const AgeRange: Story = {
  render: () => {
    const [value, setValue] = createSignal<[number, number]>([25, 35])
    return (
      <div class="w-full max-w-md space-y-4">
        <div class="text-center">
          <p class="text-4xl font-bold text-foreground">
            {value()[0]} - {value()[1]}
          </p>
          <p class="text-sm text-muted-foreground mt-1">years old</p>
        </div>
        <RangeSlider
          min={18}
          max={99}
          value={value()}
          onChange={setValue}
        />
      </div>
    )
  },
}
