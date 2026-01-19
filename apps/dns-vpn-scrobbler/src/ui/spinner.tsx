import type { Component } from 'solid-js'
import { cn } from '@/lib/utils'

export interface SpinnerProps {
  /** Size of spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** Additional class names */
  class?: string
}

const sizeClasses = {
  xs: 'w-3 h-3 border-[1.5px]',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
} as const

/**
 * Reusable loading spinner.
 */
export const Spinner: Component<SpinnerProps> = (props) => {
  const size = () => props.size ?? 'md'

  return (
    <div
      class={cn(
        sizeClasses[size()],
        'border-primary border-t-transparent rounded-full animate-spin',
        props.class
      )}
      role="status"
      aria-label="Loading"
    />
  )
}
