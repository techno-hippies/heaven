import { type JSX, splitProps, Show, For, createSignal, createEffect } from 'solid-js'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string | number
  defaultValue?: string | number
  onChange?: (value: string | number) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  class?: string
}

export function Select(props: SelectProps) {
  const [local, others] = splitProps(props, [
    'options',
    'value',
    'defaultValue',
    'onChange',
    'placeholder',
    'label',
    'error',
    'disabled',
    'class',
  ])

  const [isOpen, setIsOpen] = createSignal(false)
  const [internalValue, setInternalValue] = createSignal(local.defaultValue)
  const currentValue = () => local.value ?? internalValue()

  const selectedOption = () => local.options.find((o) => o.value === currentValue())

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return
    setInternalValue(option.value)
    local.onChange?.(option.value)
    setIsOpen(false)
  }

  return (
    <div class={cn('relative w-full', local.class)}>
      <Show when={local.label}>
        <label class="block text-sm font-medium text-foreground mb-1.5">
          {local.label}
        </label>
      </Show>
      <button
        type="button"
        disabled={local.disabled}
        onClick={() => setIsOpen(!isOpen())}
        class={cn(
          'flex h-11 w-full items-center justify-between rounded-lg border border-border bg-input px-4 py-2 text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          local.error && 'border-destructive',
          isOpen() && 'ring-2 ring-ring'
        )}
      >
        <span class={cn(!selectedOption() && 'text-muted-foreground')}>
          {selectedOption()?.label ?? local.placeholder ?? 'Select...'}
        </span>
        <svg
          class={cn('h-4 w-4 text-muted-foreground transition-transform', isOpen() && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Show when={isOpen()}>
        <div class="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover p-1 shadow-lg">
          <For each={local.options}>
            {(option) => (
              <button
                type="button"
                disabled={option.disabled}
                onClick={() => handleSelect(option)}
                class={cn(
                  'flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors',
                  'hover:bg-accent focus:bg-accent focus:outline-none',
                  option.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
                  currentValue() === option.value && 'bg-accent text-accent-foreground'
                )}
              >
                <div class="flex flex-col items-start">
                  <span>{option.label}</span>
                  <Show when={option.description}>
                    <span class="text-xs text-muted-foreground">{option.description}</span>
                  </Show>
                </div>
                <Show when={currentValue() === option.value}>
                  <svg class="ml-auto h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </Show>
              </button>
            )}
          </For>
        </div>
      </Show>

      <Show when={local.error}>
        <p class="mt-1.5 text-sm text-destructive">{local.error}</p>
      </Show>
    </div>
  )
}

// Multi-select with chips
export interface MultiSelectProps {
  options: SelectOption[]
  value?: (string | number)[]
  defaultValue?: (string | number)[]
  onChange?: (value: (string | number)[]) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  max?: number
  class?: string
}

export function MultiSelect(props: MultiSelectProps) {
  const [local, others] = splitProps(props, [
    'options',
    'value',
    'defaultValue',
    'onChange',
    'placeholder',
    'label',
    'error',
    'disabled',
    'max',
    'class',
  ])

  const [isOpen, setIsOpen] = createSignal(false)
  const [internalValue, setInternalValue] = createSignal<(string | number)[]>(local.defaultValue ?? [])
  const currentValue = () => local.value ?? internalValue()

  const selectedOptions = () => local.options.filter((o) => currentValue().includes(o.value))

  const toggleOption = (option: SelectOption) => {
    if (option.disabled) return
    const current = currentValue()
    let newValue: (string | number)[]

    if (current.includes(option.value)) {
      newValue = current.filter((v) => v !== option.value)
    } else {
      if (local.max && current.length >= local.max) return
      newValue = [...current, option.value]
    }

    setInternalValue(newValue)
    local.onChange?.(newValue)
  }

  const removeOption = (value: string | number, e: Event) => {
    e.stopPropagation()
    const newValue = currentValue().filter((v) => v !== value)
    setInternalValue(newValue)
    local.onChange?.(newValue)
  }

  return (
    <div class={cn('relative w-full', local.class)}>
      <Show when={local.label}>
        <label class="block text-sm font-medium text-foreground mb-1.5">
          {local.label}
        </label>
      </Show>
      <button
        type="button"
        disabled={local.disabled}
        onClick={() => setIsOpen(!isOpen())}
        class={cn(
          'flex min-h-11 w-full flex-wrap gap-1.5 items-center rounded-lg border border-border bg-input px-3 py-2 text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          local.error && 'border-destructive',
          isOpen() && 'ring-2 ring-ring'
        )}
      >
        <Show
          when={selectedOptions().length > 0}
          fallback={
            <span class="text-muted-foreground">
              {local.placeholder ?? 'Select...'}
            </span>
          }
        >
          <For each={selectedOptions()}>
            {(option) => (
              <span class="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-xs">
                {option.label}
                <button
                  type="button"
                  onClick={(e) => removeOption(option.value, e)}
                  class="hover:text-destructive"
                >
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </For>
        </Show>
        <svg
          class={cn('ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform', isOpen() && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Show when={isOpen()}>
        <div class="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover p-1 shadow-lg max-h-60 overflow-auto">
          <For each={local.options}>
            {(option) => {
              const isSelected = () => currentValue().includes(option.value)
              const isDisabled = () =>
                option.disabled || (!isSelected() && local.max && currentValue().length >= local.max)

              return (
                <button
                  type="button"
                  disabled={isDisabled()}
                  onClick={() => toggleOption(option)}
                  class={cn(
                    'flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors',
                    'hover:bg-accent focus:bg-accent focus:outline-none',
                    isDisabled() && 'opacity-50 cursor-not-allowed hover:bg-transparent',
                    isSelected() && 'bg-accent'
                  )}
                >
                  <div
                    class={cn(
                      'mr-2 h-4 w-4 rounded border border-border flex items-center justify-center',
                      isSelected() && 'bg-primary border-primary'
                    )}
                  >
                    <Show when={isSelected()}>
                      <svg class="h-3 w-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </Show>
                  </div>
                  <span>{option.label}</span>
                </button>
              )
            }}
          </For>
        </div>
      </Show>

      <Show when={local.error}>
        <p class="mt-1.5 text-sm text-destructive">{local.error}</p>
      </Show>
    </div>
  )
}
