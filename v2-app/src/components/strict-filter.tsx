import type { Component } from 'solid-js'
import { Toggle } from '@/ui/toggle'

export interface StrictFilterProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

/**
 * Strict filter toggle for preference steps.
 * When enabled, the preference becomes a hard filter (only show matching profiles).
 * When disabled, it's a soft signal for ranking.
 */
export const StrictFilter: Component<StrictFilterProps> = (props) => {
  return (
    <div class="flex items-center justify-between py-2">
      <div class="space-y-0.5">
        <p class="text-base font-medium text-foreground">Dealbreaker</p>
        <p class="text-sm text-muted-foreground">Only show people who match this</p>
      </div>
      <Toggle checked={props.enabled} onChange={props.onChange} />
    </div>
  )
}
