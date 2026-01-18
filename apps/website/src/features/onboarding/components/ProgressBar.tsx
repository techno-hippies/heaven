import type { Component } from 'solid-js'
import { For } from 'solid-js'
import { cn } from '@/lib/utils'

export interface ProgressBarProps {
  current: number
  total: number
  class?: string
}

export const ProgressBar: Component<ProgressBarProps> = (props) => {
  const steps = () => Array.from({ length: props.total }, (_, i) => i + 1)

  return (
    <div class={cn('flex gap-2 w-full', props.class)}>
      <For each={steps()}>
        {(step) => (
          <div
            class={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              step <= props.current ? 'bg-primary' : 'bg-muted'
            )}
          />
        )}
      </For>
    </div>
  )
}
