import { Component, For, createMemo } from 'solid-js'
import { cn } from '@/lib/utils'
import { OptionPill } from './OptionPill'

interface Option {
  value: number | string
  label: string
}

interface PillGroupProps {
  options: Option[]
  /** Single value for single-select mode */
  value?: number | string
  /** Array of values for multi-select mode */
  values?: (number | string)[]
  /** Single-select callback */
  onChange?: (value: number | string) => void
  /** Multi-select callback */
  onChangeMulti?: (values: (number | string)[]) => void
  /** Enable multi-select mode */
  multi?: boolean
  /** Pill size */
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  class?: string
}

export const PillGroup: Component<PillGroupProps> = (props) => {
  const isSelected = (optionValue: number | string) => {
    if (props.multi) {
      return props.values?.includes(optionValue) ?? false
    }
    return props.value === optionValue
  }

  const handleClick = (optionValue: number | string) => {
    if (props.disabled) return

    if (props.multi && props.onChangeMulti) {
      const current = props.values ?? []
      if (current.includes(optionValue)) {
        props.onChangeMulti(current.filter((v) => v !== optionValue))
      } else {
        props.onChangeMulti([...current, optionValue])
      }
    } else if (props.onChange) {
      props.onChange(optionValue)
    }
  }

  return (
    <div class={cn('flex flex-wrap gap-2', props.class)}>
      <For each={props.options}>
        {(option) => (
          <OptionPill
            label={option.label}
            selected={isSelected(option.value)}
            onClick={() => handleClick(option.value)}
            size={props.size}
            disabled={props.disabled}
          />
        )}
      </For>
    </div>
  )
}

export default PillGroup
