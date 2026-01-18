/**
 * NotificationBadge - Reusable badge for unread counts
 */

import { Show, type Component } from 'solid-js'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const notificationBadgeVariants = cva(
  'inline-flex items-center justify-center rounded-full font-semibold flex-shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
      },
      size: {
        sm: 'min-w-5 h-5 px-1.5 text-[14px]',
        md: 'min-w-6 h-6 px-2 text-[16px]',
        lg: 'min-w-7 h-7 px-2.5 text-[18px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface NotificationBadgeProps extends VariantProps<typeof notificationBadgeVariants> {
  count: number
  max?: number
  class?: string
}

export const NotificationBadge: Component<NotificationBadgeProps> = (props) => {
  const max = () => props.max ?? 99
  const displayCount = () => props.count > max() ? `${max()}+` : props.count

  return (
    <Show when={props.count > 0}>
      <span class={cn(notificationBadgeVariants({ variant: props.variant, size: props.size }), props.class)}>
        {displayCount()}
      </span>
    </Show>
  )
}

export { notificationBadgeVariants }
