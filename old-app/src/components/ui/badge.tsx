import { splitProps, type Component, type JSX } from 'solid-js'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'border-border text-foreground',
        success: 'border-transparent bg-green-500 text-white',
        online: 'border-transparent bg-green-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps extends JSX.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export const Badge: Component<BadgeProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'variant', 'children'])
  return (
    <div class={cn(badgeVariants({ variant: local.variant }), local.class)} {...others}>
      {local.children}
    </div>
  )
}
