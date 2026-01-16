import { Component } from 'solid-js'
import { cn } from '@/lib/utils'

interface OptionPillProps {
  label: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  class?: string
}

export const OptionPill: Component<OptionPillProps> = (props) => {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
      class={cn(
        'rounded-full border font-medium transition-all',
        'focus:outline-none focus:ring-2 focus:ring-violet-500/50',
        // Size variants
        props.size === 'sm' && 'px-3 py-1 text-xs',
        props.size === 'lg' && 'px-5 py-2.5 text-base',
        (!props.size || props.size === 'md') && 'px-4 py-2 text-sm',
        // State variants
        props.selected
          ? 'border-violet-500 bg-violet-500/20 text-white'
          : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300',
        props.disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {props.label}
    </button>
  )
}

export default OptionPill
