import { For, Show, type JSX } from 'solid-js'
import { cn } from '@/lib/utils'

export interface RadioCardOption<T extends string = string> {
  value: T
  label: string
  description: string
  /** Optional icon element */
  icon?: JSX.Element
  /** Disable this option */
  disabled?: boolean
}

export interface RadioCardSelectProps<T extends string = string> {
  /** Available options */
  options: RadioCardOption<T>[]
  /** Current selected value */
  value: T
  /** Called when selection changes */
  onChange?: (value: T) => void
  /** Optional label above the options */
  label?: string
  /** Optional helper text/content below the label */
  helperText?: string | JSX.Element
  /** Warning/info message shown below options */
  warning?: string
  /** Additional class names */
  class?: string
  /** Disable all options */
  disabled?: boolean
}

export function RadioCardSelect<T extends string = string>(
  props: RadioCardSelectProps<T>
): JSX.Element {
  return (
    <div class={cn('space-y-3', props.class)}>
      <Show when={props.label || props.helperText}>
        <div class="space-y-1">
          <Show when={props.label}>
            <label class="block text-base font-medium text-foreground">
              {props.label}
            </label>
          </Show>
          <Show when={props.helperText}>
            <div class="text-sm text-muted-foreground">{props.helperText}</div>
          </Show>
        </div>
      </Show>

      <div class="flex flex-col gap-2" role="radiogroup">
        <For each={props.options}>
          {(option) => {
            const isSelected = () => props.value === option.value
            const isDisabled = () => props.disabled || option.disabled

            return (
              <button
                type="button"
                role="radio"
                aria-checked={isSelected()}
                aria-disabled={isDisabled()}
                disabled={isDisabled()}
                onClick={() => !isDisabled() && props.onChange?.(option.value)}
                class={cn(
                  'flex items-start gap-3 p-4 rounded-2xl text-left cursor-pointer',
                  'border transition-colors',
                  isSelected()
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/30',
                  isDisabled() && 'opacity-50 cursor-not-allowed hover:border-border'
                )}
              >
                {/* Radio dot */}
                <div
                  class={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                    isSelected() ? 'border-primary' : 'border-muted-foreground/30'
                  )}
                >
                  <Show when={isSelected()}>
                    <div class="w-2.5 h-2.5 rounded-full bg-primary" />
                  </Show>
                </div>

                {/* Content */}
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <Show when={option.icon}>{option.icon}</Show>
                    <span class="font-medium text-foreground">{option.label}</span>
                  </div>
                  <p class="text-sm text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                </div>
              </button>
            )
          }}
        </For>
      </div>

      <Show when={props.warning}>
        <div class="flex gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20">
          <span class="text-warning flex-shrink-0">⚠️</span>
          <p class="text-sm text-warning">{props.warning}</p>
        </div>
      </Show>
    </div>
  )
}

export default RadioCardSelect
