import { For, type Component, createMemo } from 'solid-js'
import { cn } from '@/lib/utils'

export interface ChoiceOption {
  value: string
  label: string
}

export interface ChoiceSelectProps {
  /** Available options */
  options: ChoiceOption[]
  /** Selected value(s) */
  value: string | string[]
  /** Called when selection changes */
  onChange?: (value: string | string[]) => void
  /** Allow multiple selection */
  multiple?: boolean
  /** Optional label above choices */
  label?: string
  /** Number of columns (default: 1 = stacked) */
  columns?: 1 | 2 | 3 | 4
  /** Additional class names */
  class?: string
}

export const ChoiceSelect: Component<ChoiceSelectProps> = (props) => {
  const selectedValue = createMemo(() => props.value)

  const isSelected = (optionValue: string) => {
    const value = selectedValue()
    if (props.multiple) {
      return Array.isArray(value) && value.includes(optionValue)
    }
    return value === optionValue
  }

  const handleClick = (optionValue: string) => {
    const value = selectedValue()
    if (props.multiple) {
      const currentValue = Array.isArray(value) ? value : []
      if (currentValue.includes(optionValue)) {
        props.onChange?.(currentValue.filter((v) => v !== optionValue))
      } else {
        props.onChange?.([...currentValue, optionValue])
      }
    } else {
      props.onChange?.(value === optionValue ? '' : optionValue)
    }
  }

  const gridClass = () => {
    switch (props.columns) {
      case 2: return 'grid grid-cols-2 gap-2'
      case 3: return 'grid grid-cols-3 gap-2'
      case 4: return 'grid grid-cols-4 gap-2'
      default: return 'flex flex-wrap gap-2'
    }
  }

  return (
    <div class={cn('space-y-3', props.class)}>
      {props.label && (
        <label class="block text-base font-medium text-foreground">
          {props.label}
        </label>
      )}
      <div
        role={props.multiple ? 'group' : 'radiogroup'}
        class={gridClass()}
      >
        <For each={props.options}>
          {(option) => {
            const selected = () => isSelected(option.value)
            return (
              <button
                type="button"
                role={props.multiple ? 'checkbox' : 'radio'}
                aria-checked={selected()}
                onClick={() => handleClick(option.value)}
                class={cn(
                  'inline-flex items-center justify-center h-11 px-5 rounded-full text-base font-medium cursor-pointer border',
                  'transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  'active:scale-95',
                  selected()
                    ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border-border bg-transparent text-foreground hover:bg-secondary/50'
                )}
              >
                {option.label}
              </button>
            )
          }}
        </For>
      </div>
    </div>
  )
}

export default ChoiceSelect
