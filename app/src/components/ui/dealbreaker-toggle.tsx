import { type Component } from 'solid-js'
import { Toggle } from './toggle'
import { Icon } from '@/components/icons'
import { cn } from '@/lib/utils'

export interface DealbreakerToggleProps {
  /** Whether dealbreaker is enabled */
  enabled: boolean
  /** Called when state changes */
  onChange?: (enabled: boolean) => void
  /** Attribute name for helper text (e.g., "gender", "age", "location") */
  attribute?: string
  /** Additional class names */
  class?: string
}

/**
 * Simple toggle for setting dealbreakers.
 *
 * ON: Hard gate - profiles outside selection won't appear
 * OFF: No gating - all profiles shown (wildcard)
 */
export const DealbreakerToggle: Component<DealbreakerToggleProps> = (props) => {
  const description = () =>
    props.enabled
      ? `Hide profiles outside this ${props.attribute ?? 'selection'}`
      : `Show all ${props.attribute ? `regardless of ${props.attribute}` : 'profiles'}`

  return (
    <div
      class={cn(
        'flex items-center justify-between gap-4 p-4 rounded-2xl',
        'border transition-colors',
        props.enabled
          ? 'border-amber-500/50 bg-amber-500/5'
          : 'border-border bg-card',
        props.class
      )}
    >
      <div class="flex items-start gap-3">
        <div
          class={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            props.enabled ? 'bg-amber-500/20 text-amber-500' : 'bg-secondary text-muted-foreground'
          )}
        >
          <Icon name="funnel" weight={props.enabled ? 'fill' : 'regular'} class="w-[18px] h-[18px]" />
        </div>
        <div class="min-w-0">
          <span class="font-medium text-foreground">
            Dealbreaker
          </span>
          <p class="text-sm text-muted-foreground">
            {description()}
          </p>
        </div>
      </div>
      <Toggle
        checked={props.enabled}
        onChange={(checked) => props.onChange?.(checked)}
      />
    </div>
  )
}

export default DealbreakerToggle
