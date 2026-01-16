import { splitProps, type ParentComponent } from 'solid-js'
import { cn } from '@/lib/utils'

export interface CardProps {
  class?: string
}

export const Card: ParentComponent<CardProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children'])

  return (
    <div
      class={cn(
        'rounded-3xl bg-card border border-border shadow-lg overflow-hidden',
        local.class
      )}
      {...others}
    >
      {local.children}
    </div>
  )
}

export const CardHeader: ParentComponent<CardProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children'])

  return (
    <div class={cn('px-6 pt-6', local.class)} {...others}>
      {local.children}
    </div>
  )
}

export const CardContent: ParentComponent<CardProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children'])

  return (
    <div class={cn('px-6 py-4', local.class)} {...others}>
      {local.children}
    </div>
  )
}

export const CardFooter: ParentComponent<CardProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children'])

  return (
    <div class={cn('px-6 pb-6 pt-2', local.class)} {...others}>
      {local.children}
    </div>
  )
}

export const CardTitle: ParentComponent<CardProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children'])

  return (
    <h3 class={cn('text-xl font-semibold text-foreground', local.class)} {...others}>
      {local.children}
    </h3>
  )
}

export const CardDescription: ParentComponent<CardProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children'])

  return (
    <p class={cn('text-sm text-muted-foreground mt-1', local.class)} {...others}>
      {local.children}
    </p>
  )
}
