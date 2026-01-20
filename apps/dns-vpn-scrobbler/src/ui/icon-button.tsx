/**
 * IconButton - Standardized icon button for consistent sizing/styling
 */

import { splitProps, type Component, type JSX } from 'solid-js'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Icon, type IconName, type IconWeight } from '@/icons'

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-95 flex-shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'text-foreground hover:bg-secondary',
        outline: 'border border-border bg-transparent text-foreground hover:bg-secondary/50',
      },
      size: {
        sm: 'h-10 w-10',
        md: 'h-12 w-12',
        lg: 'h-14 w-14',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  }
)

const iconSizeClasses = {
  sm: 'text-[20px]',
  md: 'text-[22px]',
  lg: 'text-[26px]',
} as const

export interface IconButtonProps
  extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof iconButtonVariants> {
  icon: IconName
  weight?: IconWeight
  label: string // Required for accessibility
}

export const IconButton: Component<IconButtonProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'variant', 'size', 'icon', 'weight', 'label'])
  const iconClass = () => iconSizeClasses[local.size ?? 'md']

  return (
    <button
      type="button"
      aria-label={local.label}
      class={cn(iconButtonVariants({ variant: local.variant, size: local.size }), local.class)}
      {...others}
    >
      <Icon
        name={local.icon}
        weight={local.weight}
        class={iconClass()}
      />
    </button>
  )
}

export { iconButtonVariants }
