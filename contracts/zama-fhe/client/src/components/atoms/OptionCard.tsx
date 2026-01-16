import { Component, JSX, Show } from 'solid-js'
import { cn } from '@/lib/utils'

interface OptionCardProps {
  selected: boolean
  onClick: () => void
  children: JSX.Element
  disabled?: boolean
  class?: string
}

export const OptionCard: Component<OptionCardProps> = (props) => {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
      class={cn(
        'w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all text-left',
        'bg-zinc-900 border-zinc-800 hover:bg-zinc-800/70 cursor-pointer active:scale-[0.98]',
        props.selected && 'border-violet-500 bg-violet-500/10',
        props.disabled && 'opacity-50 cursor-not-allowed',
        props.class
      )}
    >
      {/* Radio indicator */}
      <div
        class={cn(
          'w-5 h-5 rounded-full border-2 shrink-0 transition-colors flex items-center justify-center',
          props.selected ? 'border-violet-500 bg-violet-500' : 'border-zinc-600'
        )}
      >
        <Show when={props.selected}>
          <div class="w-2 h-2 rounded-full bg-white" />
        </Show>
      </div>

      {/* Content */}
      <div class="flex-1 min-w-0">{props.children}</div>
    </button>
  )
}

interface OptionCardContentProps {
  title: string
  description?: string
}

export const OptionCardContent: Component<OptionCardContentProps> = (props) => {
  return (
    <div>
      <p class="text-lg font-medium text-white">{props.title}</p>
      <Show when={props.description}>
        <p class="text-base text-zinc-400 mt-1">{props.description}</p>
      </Show>
    </div>
  )
}

export default OptionCard
