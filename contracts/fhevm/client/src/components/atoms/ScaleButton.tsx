import { Component, JSX } from 'solid-js'
import { cn } from '@/lib/utils'

interface ScaleButtonProps {
  selected: boolean
  onClick: () => void
  children: JSX.Element
  disabled?: boolean
  class?: string
}

export const ScaleButton: Component<ScaleButtonProps> = (props) => {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
      class={cn(
        'flex-1 h-16 rounded-xl flex items-center justify-center text-xl font-semibold transition-all',
        'cursor-pointer active:scale-95',
        props.selected
          ? 'bg-violet-500 text-white'
          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-300',
        props.disabled && 'opacity-50 cursor-not-allowed',
        props.class
      )}
    >
      {props.children}
    </button>
  )
}

export default ScaleButton
