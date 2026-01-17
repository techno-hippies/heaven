import { For, type Component } from 'solid-js'
import { cn } from '@/lib/utils'

export type Visibility = 'public' | 'match' | 'private'

export interface VisibilitySelectProps {
  /** Current visibility */
  value: Visibility
  /** Called when visibility changes */
  onChange?: (value: Visibility) => void
  /** Additional class names */
  class?: string
}

interface VisibilityOption {
  value: Visibility
  label: string
  description: string
}

const OPTIONS: VisibilityOption[] = [
  {
    value: 'public',
    label: 'Public',
    description: 'Shown on your profile',
  },
  {
    value: 'match',
    label: 'Shared with matches',
    description: 'Revealed after you match',
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only used for matching',
  },
]

export const VisibilitySelect: Component<VisibilitySelectProps> = (props) => {
  return (
    <div class={cn('flex flex-col gap-2', props.class)}>
      <For each={OPTIONS}>
        {(option) => {
          const isSelected = () => props.value === option.value
          return (
            <button
              type="button"
              onClick={() => props.onChange?.(option.value)}
              class={cn(
                'flex items-center gap-3 p-4 rounded-2xl text-left cursor-pointer',
                'border transition-colors',
                isSelected()
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/30'
              )}
            >
              {/* Radio dot */}
              <div
                class={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  isSelected()
                    ? 'border-primary'
                    : 'border-muted-foreground/30'
                )}
              >
                {isSelected() && (
                  <div class="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>

              {/* Content */}
              <div class="flex-1 min-w-0">
                <span class="font-medium text-foreground">{option.label}</span>
                <p class="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </button>
          )
        }}
      </For>
    </div>
  )
}

export default VisibilitySelect
