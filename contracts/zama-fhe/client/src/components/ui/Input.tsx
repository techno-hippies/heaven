import { type JSX, splitProps, Show } from 'solid-js'
import { cn } from '@/lib/utils'

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: JSX.Element
  iconPosition?: 'left' | 'right'
}

export function Input(props: InputProps) {
  const [local, others] = splitProps(props, [
    'class',
    'label',
    'error',
    'hint',
    'icon',
    'iconPosition',
    'id',
  ])

  const inputId = local.id || `input-${Math.random().toString(36).slice(2, 9)}`
  const iconPos = local.iconPosition || 'left'

  return (
    <div class="w-full space-y-1.5">
      <Show when={local.label}>
        <label
          for={inputId}
          class="block text-sm font-medium text-foreground"
        >
          {local.label}
        </label>
      </Show>
      <div class="relative">
        <Show when={local.icon && iconPos === 'left'}>
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {local.icon}
          </div>
        </Show>
        <input
          id={inputId}
          class={cn(
            'flex h-11 w-full rounded-lg border border-border bg-input px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            local.error && 'border-destructive focus:ring-destructive',
            local.icon && iconPos === 'left' && 'pl-10',
            local.icon && iconPos === 'right' && 'pr-10',
            local.class
          )}
          {...others}
        />
        <Show when={local.icon && iconPos === 'right'}>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {local.icon}
          </div>
        </Show>
      </div>
      <Show when={local.error}>
        <p class="text-sm text-destructive">{local.error}</p>
      </Show>
      <Show when={local.hint && !local.error}>
        <p class="text-sm text-muted-foreground">{local.hint}</p>
      </Show>
    </div>
  )
}

export interface TextareaProps extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export function Textarea(props: TextareaProps) {
  const [local, others] = splitProps(props, ['class', 'label', 'error', 'hint', 'id'])

  const inputId = local.id || `textarea-${Math.random().toString(36).slice(2, 9)}`

  return (
    <div class="w-full space-y-1.5">
      <Show when={local.label}>
        <label for={inputId} class="block text-sm font-medium text-foreground">
          {local.label}
        </label>
      </Show>
      <textarea
        id={inputId}
        class={cn(
          'flex min-h-[120px] w-full rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors resize-none',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          local.error && 'border-destructive focus:ring-destructive',
          local.class
        )}
        {...others}
      />
      <Show when={local.error}>
        <p class="text-sm text-destructive">{local.error}</p>
      </Show>
      <Show when={local.hint && !local.error}>
        <p class="text-sm text-muted-foreground">{local.hint}</p>
      </Show>
    </div>
  )
}
