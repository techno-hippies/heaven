/**
 * ScaleSelect - Rating scale input (1-5) with labels
 */

import { type Component, For } from 'solid-js'
import { cn } from '@/lib/utils'

export interface ScaleSelectProps {
  /** Current value (1-5) */
  value: number | null
  /** Called when selection changes */
  onChange?: (value: number) => void
  /** Range [min, max] - defaults to [1, 5] */
  range?: [number, number]
  /** Labels for [left, right] ends */
  scaleLabels?: [string, string]
  /** Additional class names */
  class?: string
}

export const ScaleSelect: Component<ScaleSelectProps> = (props) => {
  const range = () => props.range || [1, 5]
  const values = () => {
    const [min, max] = range()
    return Array.from({ length: max - min + 1 }, (_, i) => min + i)
  }

  const handleClick = (value: number) => {
    props.onChange?.(value)
  }

  return (
    <div class={cn('space-y-3', props.class)}>
      {/* Scale buttons */}
      <div class="flex items-center justify-between gap-2">
        <For each={values()}>
          {(value) => {
            const selected = () => props.value === value
            return (
              <button
                type="button"
                role="radio"
                aria-checked={selected()}
                aria-label={`${value}`}
                onClick={() => handleClick(value)}
                class={cn(
                  'flex-1 h-12 rounded-xl text-lg font-semibold cursor-pointer border',
                  'transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  'active:scale-95',
                  selected()
                    ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border-border bg-transparent text-foreground hover:bg-secondary/50'
                )}
              >
                {value}
              </button>
            )
          }}
        </For>
      </div>

      {/* Scale labels */}
      {props.scaleLabels && (
        <div class="flex justify-between text-sm text-muted-foreground">
          <span>{props.scaleLabels[0]}</span>
          <span>{props.scaleLabels[1]}</span>
        </div>
      )}
    </div>
  )
}

export default ScaleSelect
