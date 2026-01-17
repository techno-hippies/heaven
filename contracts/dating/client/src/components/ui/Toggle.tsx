import { type JSX, splitProps, Show, createSignal } from 'solid-js'
import { cn } from '@/lib/utils'

export interface ToggleProps {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
  size?: 'sm' | 'default' | 'lg'
  class?: string
}

export function Toggle(props: ToggleProps) {
  const [local, others] = splitProps(props, [
    'checked',
    'defaultChecked',
    'onChange',
    'disabled',
    'label',
    'description',
    'size',
    'class',
  ])

  const [internalChecked, setInternalChecked] = createSignal(local.defaultChecked ?? false)
  const isChecked = () => local.checked ?? internalChecked()

  const handleClick = () => {
    if (local.disabled) return
    const newValue = !isChecked()
    setInternalChecked(newValue)
    local.onChange?.(newValue)
  }

  const sizes = {
    sm: { track: 'w-8 h-5', thumb: 'w-3.5 h-3.5', translate: 'translate-x-3.5' },
    default: { track: 'w-11 h-6', thumb: 'w-4.5 h-4.5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'w-5.5 h-5.5', translate: 'translate-x-7' },
  }

  const sizeConfig = sizes[local.size ?? 'default']

  return (
    <div
      class={cn(
        'flex items-center gap-3',
        local.disabled && 'opacity-50 cursor-not-allowed',
        local.class
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={isChecked()}
        disabled={local.disabled}
        onClick={handleClick}
        class={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed',
          sizeConfig.track,
          isChecked() ? 'bg-primary' : 'bg-muted'
        )}
      >
        <span
          class={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-md transition-transform duration-200',
            'absolute top-1/2 -translate-y-1/2 left-0.5',
            sizeConfig.thumb,
            isChecked() && sizeConfig.translate
          )}
        />
      </button>
      <Show when={local.label || local.description}>
        <div class="flex flex-col">
          <Show when={local.label}>
            <span class="text-sm font-medium text-foreground">{local.label}</span>
          </Show>
          <Show when={local.description}>
            <span class="text-xs text-muted-foreground">{local.description}</span>
          </Show>
        </div>
      </Show>
    </div>
  )
}

export interface SwitchGroupProps {
  label: string
  description?: string
  children: JSX.Element
}

export function SwitchGroup(props: SwitchGroupProps) {
  return (
    <div class="flex items-center justify-between py-3">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-foreground">{props.label}</span>
        <Show when={props.description}>
          <span class="text-xs text-muted-foreground">{props.description}</span>
        </Show>
      </div>
      {props.children}
    </div>
  )
}
