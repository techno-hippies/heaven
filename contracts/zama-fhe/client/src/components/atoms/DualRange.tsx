import { Component, createSignal, createEffect } from 'solid-js'
import { cn } from '@/lib/utils'

interface DualRangeProps {
  minValue: number
  maxValue: number
  onChange: (min: number, max: number) => void
  min: number
  max: number
  step?: number
  formatValue?: (value: number) => string
  disabled?: boolean
  class?: string
}

export const DualRange: Component<DualRangeProps> = (props) => {
  const [localMin, setLocalMin] = createSignal(props.minValue)
  const [localMax, setLocalMax] = createSignal(props.maxValue)

  createEffect(() => {
    setLocalMin(props.minValue)
    setLocalMax(props.maxValue)
  })

  const format = (v: number) => props.formatValue?.(v) ?? String(v)

  const minPercent = () => ((localMin() - props.min) / (props.max - props.min)) * 100
  const maxPercent = () => ((localMax() - props.min) / (props.max - props.min)) * 100

  const handleMinInput = (e: Event) => {
    const value = parseInt((e.target as HTMLInputElement).value)
    const newMin = Math.min(value, localMax() - 1)
    setLocalMin(newMin)
  }

  const handleMaxInput = (e: Event) => {
    const value = parseInt((e.target as HTMLInputElement).value)
    const newMax = Math.max(value, localMin() + 1)
    setLocalMax(newMax)
  }

  const handleChange = () => {
    props.onChange(localMin(), localMax())
  }

  return (
    <div class={cn('flex flex-col gap-4', props.class)}>
      <div class="flex items-center justify-center gap-4">
        <span class="text-2xl font-bold text-white">{format(localMin())}</span>
        <span class="text-xl text-zinc-600">to</span>
        <span class="text-2xl font-bold text-white">{format(localMax())}</span>
      </div>

      <div class="relative h-14 flex items-center">
        {/* Track background */}
        <div class="absolute w-full h-3 rounded-full bg-zinc-800" />

        {/* Active range */}
        <div
          class="absolute h-3 bg-violet-500 rounded-full"
          style={{
            left: `${minPercent()}%`,
            width: `${maxPercent() - minPercent()}%`,
          }}
        />

        {/* Min slider */}
        <input
          type="range"
          min={props.min}
          max={props.max}
          step={props.step ?? 1}
          value={localMin()}
          onInput={handleMinInput}
          onChange={handleChange}
          disabled={props.disabled}
          class={cn(
            'absolute w-full h-14 appearance-none bg-transparent cursor-pointer',
            'pointer-events-none',
            '[&::-webkit-slider-thumb]:pointer-events-auto',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-black/30',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-violet-500',
            '[&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10',
            props.disabled && 'opacity-50'
          )}
        />

        {/* Max slider */}
        <input
          type="range"
          min={props.min}
          max={props.max}
          step={props.step ?? 1}
          value={localMax()}
          onInput={handleMaxInput}
          onChange={handleChange}
          disabled={props.disabled}
          class={cn(
            'absolute w-full h-14 appearance-none bg-transparent cursor-pointer',
            'pointer-events-none',
            '[&::-webkit-slider-thumb]:pointer-events-auto',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-black/30',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-500',
            '[&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10',
            props.disabled && 'opacity-50'
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

export default DualRange
