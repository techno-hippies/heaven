import { Show, type Component } from 'solid-js'
import { cn } from '@/lib/utils'
import { Avatar } from '@/ui/avatar'

export interface MessageBubbleProps {
  content: string
  sender: 'user' | 'other'
  timestamp: Date
  avatarUrl?: string
  avatarFallback?: string
  showAvatar?: boolean
  isStreaming?: boolean
}

const formatMessageTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export const MessageBubble: Component<MessageBubbleProps> = (props) => {
  const isUser = () => props.sender === 'user'

  return (
    <div
      class={cn(
        'flex gap-2 max-w-[85%]',
        isUser() ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      <Show when={!isUser() && props.showAvatar !== false}>
        <Avatar
          src={props.avatarUrl}
          fallback={props.avatarFallback}
          size="sm"
          class="flex-shrink-0 mt-1"
        />
      </Show>
      <Show when={!isUser() && props.showAvatar === false}>
        <div class="w-8 flex-shrink-0" />
      </Show>

      <div
        class={cn(
          'rounded-2xl px-4 py-2.5',
          isUser()
            ? 'bg-chat-user text-chat-user-foreground rounded-br-md'
            : 'bg-chat-other text-chat-other-foreground rounded-bl-md'
        )}
      >
        {props.isStreaming ? (
          props.content.length > 0 ? (
            <p class="text-base leading-snug">
              {props.content}
              <span class="ml-0.5 inline-block w-[2px] h-[1em] align-[-0.1em] bg-muted-foreground/70 animate-pulse" />
            </p>
          ) : (
            <div class="flex items-center gap-1 py-1">
              <span class="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span class="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span class="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
            </div>
          )
        ) : (
          <>
            <p class="text-base leading-snug">{props.content}</p>
            <p
              class={cn(
                'mt-1 text-xs',
                isUser() ? 'text-chat-user-foreground/70' : 'text-muted-foreground'
              )}
            >
              {formatMessageTime(props.timestamp)}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default MessageBubble
