import { type Component } from 'solid-js'
import { Toggle } from './toggle'
import { Icon } from '@/components/icons'
import { cn } from '@/lib/utils'

export interface FilterToggleProps {
  /** Whether filtering is enabled */
  enabled: boolean
  /** Called when filter state changes */
  onChange?: (enabled: boolean) => void
  /** Label override (default: "Use as filter") */
  label?: string
  /** Description override */
  description?: string
  /** Additional class names */
  class?: string
}

/**
 * Toggle for enabling/disabling preference filtering.
 *
 * When OFF (default for most fields):
 *   - Your preference is stored as a "signal"
 *   - It's revealed on match but doesn't gate matching
 *   - Maps to: policy = 'NONE', prefMask = WILDCARD_MASK
 *
 * When ON:
 *   - Your preference becomes a "dealbreaker"
 *   - Only people matching your preference will be shown
 *   - Maps to: policy = 'CRITERIA' or 'DEALBREAKER', prefMask = specific bits
 */
export const FilterToggle: Component<FilterToggleProps> = (props) => {
  return (
    <div
      class={cn(
        'flex items-center justify-between gap-4 p-4 rounded-2xl',
        'border transition-colors',
        props.enabled
          ? 'border-primary/50 bg-primary/5'
          : 'border-border bg-card',
        props.class
      )}
    >
      <div class="flex items-start gap-3">
        <div
          class={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            props.enabled ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
          )}
        >
          <Icon name="funnel" weight={props.enabled ? 'fill' : 'regular'} class="w-[18px] h-[18px]" />
        </div>
        <div class="min-w-0">
          <span class="font-medium text-foreground">
            {props.label ?? 'Use as filter'}
          </span>
          <p class="text-sm text-muted-foreground">
            {props.description ?? (
              props.enabled
                ? 'Hide profiles that don\'t match'
                : 'Show all profiles'
            )}
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

export default FilterToggle
