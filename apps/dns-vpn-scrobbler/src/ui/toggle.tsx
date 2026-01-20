import { splitProps, type Component, type JSX } from 'solid-js'
import { cn } from '@/lib/utils'

export interface ToggleProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  onChange?: (checked: boolean) => void
}

export const Toggle: Component<ToggleProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'checked', 'onChange'])

  return (
    <button
      type="button"
      role="switch"
      aria-checked={local.checked}
      class={cn(
        'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        local.checked ? 'bg-primary' : 'bg-secondary',
        local.class
      )}
      onClick={() => local.onChange?.(!local.checked)}
      {...others}
    >
      <span
        class={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
          local.checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  )
}
