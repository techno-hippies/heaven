import type { Component } from 'solid-js'
import { Slider } from '@kobalte/core/slider'
import { cn } from '@/lib/utils'

export interface RangeSliderProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  step?: number
  class?: string
}

export const RangeSlider: Component<RangeSliderProps> = (props) => {
  const handleChange = (value: number[]) => {
    if (value.length >= 2) {
      props.onChange([value[0], value[1]])
    }
  }

  return (
    <Slider
      class={cn('relative flex items-center select-none touch-none w-full', props.class)}
      value={props.value}
      onChange={handleChange}
      minValue={props.min}
      maxValue={props.max}
      step={props.step ?? 1}
    >
      <Slider.Track class="relative h-2 w-full grow rounded-full bg-muted">
        <Slider.Fill class="absolute h-full rounded-full bg-primary" />
        <Slider.Thumb
          class="block h-5 w-5 rounded-full border-2 border-primary bg-background shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent top-1/2 -translate-y-1/2"
        >
          <Slider.Input />
        </Slider.Thumb>
        <Slider.Thumb
          class="block h-5 w-5 rounded-full border-2 border-primary bg-background shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent top-1/2 -translate-y-1/2"
        >
          <Slider.Input />
        </Slider.Thumb>
      </Slider.Track>
    </Slider>
  )
}
