import type { Component } from 'solid-js'
import { Slider as KobalteSlider } from '@kobalte/core/slider'
import { cn } from '@/lib/utils'

export interface SliderProps {
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  step?: number
  disabled?: boolean
  class?: string
}

export const Slider: Component<SliderProps> = (props) => {
  const handleChange = (value: number[]) => {
    if (value.length >= 1) {
      props.onChange(value[0])
    }
  }

  return (
    <KobalteSlider
      class={cn(
        'relative flex items-center select-none touch-none w-full',
        props.disabled && 'opacity-50',
        props.class
      )}
      value={[props.value]}
      onChange={handleChange}
      minValue={props.min}
      maxValue={props.max}
      step={props.step ?? 1}
      disabled={props.disabled}
    >
      <KobalteSlider.Track class="relative h-2 w-full grow rounded-full bg-muted">
        <KobalteSlider.Fill class="absolute h-full rounded-full bg-primary" />
        <KobalteSlider.Thumb
          class="block h-5 w-5 rounded-full border-2 border-primary bg-background shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent top-1/2 -translate-y-1/2"
        >
          <KobalteSlider.Input />
        </KobalteSlider.Thumb>
      </KobalteSlider.Track>
    </KobalteSlider>
  )
}
