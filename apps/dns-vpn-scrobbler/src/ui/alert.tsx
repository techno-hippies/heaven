import { splitProps, type Component, type JSX, Show } from 'solid-js'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Icon, type IconName } from '@/icons'

const alertVariants = cva(
  'w-full rounded-xl p-4 flex items-start gap-3',
  {
    variants: {
      variant: {
        error: 'bg-destructive/10 border border-destructive/20 text-destructive',
        warning: 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-500',
        info: 'bg-primary/10 border border-primary/20 text-primary',
      },
    },
    defaultVariants: {
      variant: 'error',
    },
  }
)

const iconMap: Record<NonNullable<VariantProps<typeof alertVariants>['variant']>, IconName> = {
  error: 'x-circle',
  warning: 'warning',
  info: 'check-circle',
}

export interface AlertProps
  extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof alertVariants> {
  /** Alert title */
  title?: string
  /** Alert message */
  message: string
  /** Called when dismiss button is clicked */
  onDismiss?: () => void
}

export const Alert: Component<AlertProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'variant', 'title', 'message', 'onDismiss'])
  const variant = () => local.variant ?? 'error'

  return (
    <div
      class={cn(alertVariants({ variant: variant() }), local.class)}
      role="alert"
      {...others}
    >
      <Icon
        name={iconMap[variant()]}
        weight="fill"
        class="w-5 h-5 flex-shrink-0 mt-0.5"
      />
      <div class="flex-1 min-w-0">
        <Show when={local.title}>
          <p class="font-medium">{local.title}</p>
        </Show>
        <p class={cn(local.title && 'text-muted-foreground mt-1')}>
          {local.message}
        </p>
      </div>
      <Show when={local.onDismiss}>
        <button
          type="button"
          onClick={local.onDismiss}
          class="flex-shrink-0 p-1 -m-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <Icon name="x" class="w-5 h-5" />
        </button>
      </Show>
    </div>
  )
}
