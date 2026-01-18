import type { Component } from 'solid-js'
import { Icon } from '@/icons'
import { cn } from '@/lib/utils'

export interface BackButtonProps {
  onClick: () => void
  disabled?: boolean
  class?: string
}

export const BackButton: Component<BackButtonProps> = (props) => {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      aria-label="Back"
      class={cn(
        'inline-flex items-center justify-center w-10 h-10 rounded-full',
        'text-foreground hover:bg-muted transition-colors',
        'disabled:opacity-40 disabled:pointer-events-none',
        'cursor-pointer select-none',
        props.class
      )}
    >
      <Icon name="caret-left" class="text-2xl" />
    </button>
  )
}
