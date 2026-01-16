import { type JSX, splitProps } from 'solid-js'
import { cn } from '@/lib/utils'

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'gradient'
  padding?: 'none' | 'sm' | 'default' | 'lg'
}

export function Card(props: CardProps) {
  const [local, others] = splitProps(props, ['class', 'children', 'variant', 'padding'])

  const variants = {
    default: 'bg-card border border-border',
    elevated: 'bg-card shadow-lg',
    glass: 'glass border border-white/10',
    gradient: 'bg-gradient-to-br from-card to-card/50 border border-border',
  }

  const paddings = {
    none: '',
    sm: 'p-3',
    default: 'p-4',
    lg: 'p-6',
  }

  return (
    <div
      class={cn(
        'rounded-xl transition-all',
        variants[local.variant ?? 'default'],
        paddings[local.padding ?? 'default'],
        local.class
      )}
      {...others}
    >
      {local.children}
    </div>
  )
}

export function CardHeader(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, others] = splitProps(props, ['class', 'children'])
  return (
    <div class={cn('flex flex-col space-y-1.5', local.class)} {...others}>
      {local.children}
    </div>
  )
}

export function CardTitle(props: JSX.HTMLAttributes<HTMLHeadingElement>) {
  const [local, others] = splitProps(props, ['class', 'children'])
  return (
    <h3 class={cn('text-lg font-semibold leading-none tracking-tight', local.class)} {...others}>
      {local.children}
    </h3>
  )
}

export function CardDescription(props: JSX.HTMLAttributes<HTMLParagraphElement>) {
  const [local, others] = splitProps(props, ['class', 'children'])
  return (
    <p class={cn('text-sm text-muted-foreground', local.class)} {...others}>
      {local.children}
    </p>
  )
}

export function CardContent(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, others] = splitProps(props, ['class', 'children'])
  return (
    <div class={cn('pt-4', local.class)} {...others}>
      {local.children}
    </div>
  )
}

export function CardFooter(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, others] = splitProps(props, ['class', 'children'])
  return (
    <div class={cn('flex items-center pt-4', local.class)} {...others}>
      {local.children}
    </div>
  )
}
