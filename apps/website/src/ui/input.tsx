import { splitProps, type Component, type JSX } from 'solid-js'
import { cn, haptic } from '@/lib/utils'
import { IconButton } from './icon-button'
import { Spinner } from './spinner'

const inputStyles = [
  'flex w-full rounded-2xl bg-secondary px-4 py-3',
  'text-base text-foreground placeholder:text-muted-foreground leading-6',
  'border border-transparent',
  'focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'transition-all duration-200',
].join(' ')

export interface InputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'class'> {
  class?: string
}

export const Input: Component<InputProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'type'])

  return (
    <input
      type={local.type}
      class={cn(inputStyles, local.class)}
      {...others}
    />
  )
}

export interface TextareaProps extends Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'class'> {
  class?: string
}

export const Textarea: Component<TextareaProps> = (props) => {
  const [local, others] = splitProps(props, ['class'])

  return (
    <textarea
      class={cn(inputStyles, 'resize-none scrollbar-hide min-h-[100px]', local.class)}
      {...others}
    />
  )
}

export interface InputWithCopyProps {
  /** The value to display and copy */
  value: string
  /** Additional class names */
  class?: string
}

/**
 * Read-only input field with copy button.
 * Used for displaying codes, URLs, or other copyable values.
 */
export const InputWithCopy: Component<InputWithCopyProps> = (props) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(props.value)
    haptic.light()
  }

  return (
    <div
      class={cn(
        'flex items-center gap-3 rounded-2xl bg-secondary pl-4 pr-2 py-1.5',
        props.class
      )}
    >
      <span class="flex-1 text-base leading-6 text-foreground truncate">
        {props.value}
      </span>
      <IconButton
        icon="copy"
        label="Copy to clipboard"
        variant="ghost"
        size="sm"
        onClick={handleCopy}
      />
    </div>
  )
}

export type InputState = 'idle' | 'checking' | 'valid' | 'invalid'

export interface InputStatusProps {
  state: InputState
  /** Custom message for valid state */
  validMessage?: string
  /** Custom message for invalid state */
  invalidMessage?: string
  class?: string
}

/**
 * Reusable status indicator for inputs.
 * Shows checking spinner, valid check, or invalid X.
 */
export const InputStatus: Component<InputStatusProps> = (props) => {
  const validMsg = () => props.validMessage ?? 'Available'
  const invalidMsg = () => props.invalidMessage ?? 'Unavailable'

  return (
    <div class={cn('h-6 flex items-center gap-2', props.class)}>
      {props.state === 'checking' && (
        <>
          <Spinner size="xs" />
          <span class="text-base text-muted-foreground">Checking...</span>
        </>
      )}
      {props.state === 'valid' && (
        <>
          <svg class="w-3.5 h-3.5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="text-base text-green-600">{validMsg()}</span>
        </>
      )}
      {props.state === 'invalid' && (
        <>
          <svg class="w-3.5 h-3.5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span class="text-base text-destructive">{invalidMsg()}</span>
        </>
      )}
    </div>
  )
}

export interface InputWithSuffixProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'class'> {
  /** Suffix text displayed after input (e.g., ".neodate") */
  suffix: string
  /** Validation state */
  state?: 'default' | 'valid' | 'invalid'
  /** Additional class names for wrapper */
  class?: string
  /** Additional class names for input */
  inputClass?: string
}

/**
 * Input field with a fixed suffix.
 * Used for domain/handle inputs like "name.neodate"
 */
export const InputWithSuffix: Component<InputWithSuffixProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'inputClass', 'suffix', 'state'])
  const state = () => local.state ?? 'default'

  return (
    <div
      class={cn(
        'flex items-center rounded-2xl bg-secondary',
        'border-2 transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-ring',
        state() === 'valid' && 'border-green-500',
        state() === 'invalid' && 'border-destructive',
        state() === 'default' && 'border-transparent focus-within:border-primary/50',
        local.class
      )}
    >
      <input
        type="text"
        class={cn(
          'flex-1 min-w-0 bg-transparent px-4 py-3',
          'text-base text-foreground placeholder:text-muted-foreground leading-6',
          'focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          local.inputClass
        )}
        {...others}
      />
      <span class="pr-4 text-base text-muted-foreground whitespace-nowrap">
        {local.suffix}
      </span>
    </div>
  )
}
