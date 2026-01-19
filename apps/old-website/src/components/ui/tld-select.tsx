import { type Component, For } from 'solid-js'
import { cn } from '@/lib/utils'

export interface TldOption {
  /** TLD identifier (e.g., 'neodate', 'star', 'spiral', 'tulip') */
  id: string
  /** Display label (e.g., '.neodate', '.star') */
  label: string
  /** Emoji to display (omit for text-only TLDs like neodate) */
  emoji?: string
  /** Price display (e.g., 'FREE', '$12/yr') */
  price: string
  /** Background color class for the emoji circle */
  emojiBg?: string
}

export const DEFAULT_TLDS: TldOption[] = [
  {
    id: 'neodate',
    label: '.neodate',
    price: 'Free',
    emojiBg: 'bg-foreground/10',
  },
  {
    id: 'star',
    label: '.⭐',
    emoji: '⭐',
    price: '$12/year',
    emojiBg: 'bg-foreground/10',
  },
  {
    id: 'spiral',
    label: '.🌀',
    emoji: '🌀',
    price: '$12/year',
    emojiBg: 'bg-foreground/10',
  },
]

export interface TldSelectProps {
  /** Available TLD options */
  options?: TldOption[]
  /** Currently selected TLD id */
  value: string
  /** Called when selection changes */
  onChange?: (tldId: string) => void
  /** Additional class names */
  class?: string
}

/**
 * TLD selector with emoji chips.
 * Used in onboarding to let users pick their domain TLD.
 */
export const TldSelect: Component<TldSelectProps> = (props) => {
  const options = () => props.options ?? DEFAULT_TLDS

  return (
    <div class={cn('flex gap-2', props.class)}>
      <For each={options()}>
        {(tld) => {
          const isSelected = () => props.value === tld.id

          return (
            <button
              type="button"
              onClick={() => props.onChange?.(tld.id)}
              class={cn(
                'flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2',
                'transition-all duration-200 cursor-pointer',
                isSelected()
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-secondary hover:border-primary/30'
              )}
            >
              {/* Emoji or letter circle */}
              <div
                class={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-xl',
                  tld.emojiBg ?? 'bg-muted'
                )}
              >
                {tld.emoji ? (
                  <span>{tld.emoji}</span>
                ) : (
                  <span class="text-sm font-bold text-primary">neo</span>
                )}
              </div>

              {/* Label */}
              <span class="text-sm font-medium text-foreground">{tld.label}</span>

              {/* Price */}
              <span
                class={cn(
                  'text-xs',
                  tld.price === 'Free' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-muted-foreground'
                )}
              >
                {tld.price}
              </span>
            </button>
          )
        }}
      </For>
    </div>
  )
}

export default TldSelect
