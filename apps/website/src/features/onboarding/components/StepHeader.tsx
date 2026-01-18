import type { Component } from 'solid-js'
import { Show, For } from 'solid-js'
import { ProgressBar } from './ProgressBar'
import { cn } from '@/lib/utils'

export interface StepHeaderProps {
  title: string
  subtitle?: string | string[]
  current?: number
  total?: number
  required?: boolean
  class?: string
}

export const StepHeader: Component<StepHeaderProps> = (props) => {
  return (
    <div class={cn('space-y-6', props.class)}>
      {/* Progress bar */}
      <Show when={props.current !== undefined && props.total !== undefined}>
        <ProgressBar current={props.current!} total={props.total!} />
      </Show>

      {/* Title and subtitle */}
      <div class="space-y-2">
        <h1 class="text-3xl md:text-4xl font-bold text-foreground">
          {props.title}
          {props.required && <span class="text-destructive ml-1">*</span>}
        </h1>
        <Show when={props.subtitle}>
          {Array.isArray(props.subtitle) ? (
            <ul class="text-lg text-muted-foreground space-y-1 list-disc list-inside">
              <For each={props.subtitle}>
                {(item) => <li>{item}</li>}
              </For>
            </ul>
          ) : (
            <p class="text-lg text-muted-foreground">{props.subtitle}</p>
          )}
        </Show>
      </div>
    </div>
  )
}
