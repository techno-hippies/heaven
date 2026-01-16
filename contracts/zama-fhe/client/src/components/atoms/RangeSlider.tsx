import { Component, createSignal, createEffect } from 'solid-js'
import { cn } from '@/lib/utils'

interface RangeSliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  formatValue?: (value: number) => string
  disabled?: boolean
  class?: string
}

export const RangeSlider: Component<RangeSliderProps> = (props) => {
  const [localValue, setLocalValue] = createSignal(props.value)

  createEffect(() => {
    setLocalValue(props.value)
  })

  const format = (v: number) => props.formatValue?.(v) ?? String(v)

  const percent = () => ((localValue() - props.min) / (props.max - props.min)) * 100

  const handleInput = (e: Event) => {
    const value = parseInt((e.target as HTMLInputElement).value)
    setLocalValue(value)
  }

  const handleChange = (e: Event) => {
    const value = parseInt((e.target as HTMLInputElement).value)
    props.onChange(value)
  }

  return (
    <div class={cn('flex flex-col gap-4', props.class)}>
      <div class="flex items-center justify-center">
        <span class="text-3xl font-bold text-white">{format(localValue())}</span>
      </div>

      <div class="relative h-14 flex items-center">
        {/* Track background */}
        <div class="absolute w-full h-3 rounded-full bg-zinc-800" />

        {/* Active track */}
        <div
          class="absolute h-3 rounded-full bg-violet-500"
          style={{ width: `${percent()}%` }}
        />

        {/* Input */}
        <input
          type="range"
          min={props.min}
          max={props.max}
          step={props.step ?? 1}
          value={localValue()}
          onInput={handleInput}
          onChange={handleChange}
          disabled={props.disabled}
          class={cn(
            'absolute w-full h-14 appearance-none bg-transparent cursor-pointer',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-black/30',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-violet-500',
            props.disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      </div>

      <div class="flex justify-between text-base text-zinc-500">
        <span>{format(props.min)}</span>
        <span>{format(props.max)}</span>
      </div>
    </div>
  )
}

export default RangeSlider
