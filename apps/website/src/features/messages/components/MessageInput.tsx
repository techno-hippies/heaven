import { createSignal, type Component } from 'solid-js'
import { cn } from '@/lib/utils'
import { IconButton } from '@/ui/icon-button'

export interface MessageInputProps {
  onSend?: (message: string) => void
  placeholder?: string
  disabled?: boolean
  class?: string
}

export const MessageInput: Component<MessageInputProps> = (props) => {
  const [message, setMessage] = createSignal('')

  const handleSend = () => {
    const text = message().trim()
    if (text && props.onSend) {
      props.onSend(text)
      setMessage('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div class={cn('flex items-center gap-3', props.class)}>
      <textarea
        value={message()}
        onInput={(e) => setMessage(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        placeholder={props.placeholder ?? 'Type a message...'}
        disabled={props.disabled}
        rows={1}
        class={cn(
          'flex-1 resize-none rounded-3xl bg-secondary px-5',
          'text-base text-foreground placeholder:text-muted-foreground',
          'border border-transparent focus:outline-none focus:ring-2 focus:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'scrollbar-hide max-h-32',
          'h-12 leading-[48px]'
        )}
      />
      <IconButton
        icon="paper-plane-right"
        weight="fill"
        label="Send message"
        variant="default"
        size="md"
        onClick={handleSend}
        disabled={props.disabled || !message().trim()}
      />
    </div>
  )
}

export default MessageInput
