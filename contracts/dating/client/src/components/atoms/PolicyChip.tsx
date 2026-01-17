import { Component, JSX } from 'solid-js'
import { cn } from '@/lib/utils'
import { MinusCircle, Lock, Sparkle } from 'phosphor-solid'

export type Policy = 'NONE' | 'DEALBREAKER' | 'CRITERIA'

interface PolicyChipProps {
  policy: Policy
  selected: boolean
  onClick: () => void
  disabled?: boolean
  class?: string
}

const POLICY_CONFIG: Record<Policy, { label: string; selectedClass: string; icon: () => JSX.Element }> = {
  NONE: {
    label: "Don't filter",
    selectedClass: 'border-zinc-500 bg-zinc-500/20 text-zinc-300',
    icon: () => <MinusCircle size={24} weight="bold" />,
  },
  DEALBREAKER: {
    label: 'Must have',
    selectedClass: 'border-rose-500 bg-rose-500/20 text-rose-300',
    icon: () => <Lock size={24} weight="bold" />,
  },
  CRITERIA: {
    label: 'Prefer',
    selectedClass: 'border-violet-500 bg-violet-500/20 text-violet-300',
    icon: () => <Sparkle size={24} weight="bold" />,
  },
}

export const PolicyChip: Component<PolicyChipProps> = (props) => {
  const config = () => POLICY_CONFIG[props.policy]

  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
      class={cn(
        'flex-1 flex flex-col items-center gap-2 px-4 py-4 rounded-xl border font-medium transition-all',
        'cursor-pointer active:scale-[0.98]',
        props.selected
          ? config().selectedClass
          : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:bg-zinc-800/70 hover:text-zinc-400',
        props.disabled && 'opacity-50 cursor-not-allowed',
        props.class
      )}
    >
      {config().icon()}
      <span class="text-base">{config().label}</span>
    </button>
  )
}

export default PolicyChip
