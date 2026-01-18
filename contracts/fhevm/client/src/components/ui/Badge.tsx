import { type JSX, splitProps } from 'solid-js'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/20 text-primary',
        secondary: 'bg-secondary/20 text-secondary',
        success: 'bg-success/20 text-success',
        warning: 'bg-warning/20 text-warning',
        destructive: 'bg-destructive/20 text-destructive',
        muted: 'bg-muted text-muted-foreground',
        outline: 'border border-border text-foreground',
        verified: 'bg-success/20 text-success',
        premium: 'bg-gradient-to-r from-secondary/20 to-primary/20 text-foreground',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends JSX.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: JSX.Element
}

export function Badge(props: BadgeProps) {
  const [local, others] = splitProps(props, ['variant', 'size', 'class', 'children', 'icon'])

  return (
    <span
      class={cn(badgeVariants({ variant: local.variant, size: local.size }), local.class)}
      {...others}
    >
      {local.icon}
      {local.children}
    </span>
  )
}

// Pre-built verified badge
export function VerifiedBadge(props: { level?: 'basic' | 'photo' | 'id' }) {
  const level = props.level ?? 'basic'

  const configs = {
    basic: { label: 'Verified', icon: '✓' },
    photo: { label: 'Photo Verified', icon: '📸' },
    id: { label: 'ID Verified', icon: '🛡️' },
  }

  const config = configs[level]

  return (
    <Badge variant="verified" size="sm">
      <span>{config.icon}</span>
      {config.label}
    </Badge>
  )
}

export { badgeVariants }
