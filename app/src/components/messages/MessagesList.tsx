/**
 * MessagesList - List of message conversations
 */

import { For, Show, type Component } from 'solid-js'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { NotificationBadge } from '@/components/ui/notification-badge'
import { Icon } from '@/components/icons'
import type { Chat } from './MessagesView'

export interface MessagesListProps {
  chats: Chat[]
  onSelectChat?: (chatId: string) => void
  class?: string
}

/** Format relative time for messages list */
const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const MessagesList: Component<MessagesListProps> = (props) => {
  return (
    <div class={cn(props.class)}>
      <div class="py-2 px-2">
        <For each={props.chats}>
          {(chat) => (
            <button
              type="button"
              onClick={() => props.onSelectChat?.(chat.id)}
              class={cn(
                'w-full flex items-center gap-4 px-4 py-4 rounded-2xl',
                'hover:bg-secondary/50 active:bg-secondary/70 transition-colors',
                'text-left cursor-pointer'
              )}
            >
              {/* Avatar with online indicator */}
              <Avatar
                src={chat.avatar}
                fallback={chat.name}
                size="xl"
                online={chat.online}
                class="flex-shrink-0"
              />

              {/* Chat info */}
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="text-base font-semibold truncate flex items-center gap-1.5">
                    {chat.name}
                    <Show when={chat.isPinned}>
                      <Icon name="sparkle" weight="fill" class="text-primary flex-shrink-0 text-base" />
                    </Show>
                  </h3>
                  <span class="text-sm text-muted-foreground flex-shrink-0">
                    {formatRelativeTime(chat.timestamp)}
                  </span>
                </div>
                <div class="flex items-center justify-between gap-3 mt-1">
                  <p class="text-sm text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                  <NotificationBadge count={chat.unreadCount} size="md" />
                </div>
              </div>
            </button>
          )}
        </For>
      </div>
    </div>
  )
}

export default MessagesList
