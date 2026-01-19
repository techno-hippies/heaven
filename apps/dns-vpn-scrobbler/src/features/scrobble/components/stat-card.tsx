import type { Component } from 'solid-js'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  value: number | string
  label: string
  class?: string
}

export const StatCard: Component<StatCardProps> = (props) => {
  const formattedValue = () => {
    if (typeof props.value === 'number') {
      return props.value.toLocaleString()
    }
    return props.value
  }

  return (
    <div class={cn('bg-card border border-border rounded-2xl p-5', props.class)}>
      <p class="text-3xl font-bold text-foreground tabular-nums">{formattedValue()}</p>
      <p class="text-muted-foreground mt-1">{props.label}</p>
    </div>
  )
}
