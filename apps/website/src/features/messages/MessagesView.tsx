import { createMemo, createSignal, Show, type Component } from 'solid-js'
import { cn } from '@/lib/utils'
import { MessagesList } from './components/MessagesList'
import { Conversation } from './components/Conversation'
import { DEFAULT_MESSAGES, SAMPLE_CHATS_WITH_SCARLETT } from './fixtures'
import type { Chat, Message } from './types'

export interface MessagesViewProps {
  class?: string
}

export const MessagesView: Component<MessagesViewProps> = (props) => {
  const [selectedChatId, setSelectedChatId] = createSignal<string | null>(null)
  const [chats, setChats] = createSignal<Chat[]>(SAMPLE_CHATS_WITH_SCARLETT)
  const [messages, setMessages] = createSignal<Record<string, Message[]>>(DEFAULT_MESSAGES)

  const selectedChat = createMemo(() => chats().find((chat) => chat.id === selectedChatId()))

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId)
  }

  const handleBack = () => {
    setSelectedChatId(null)
  }

  const handleSendMessage = (content: string) => {
    const chatId = selectedChatId()
    if (!chatId) return

    const newMessage: Message = {
      id: `${chatId}-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] ?? []), newMessage],
    }))

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, lastMessage: content, timestamp: new Date(), unreadCount: 0 }
          : chat
      )
    )
  }

  return (
    <div class={cn('h-full', props.class)}>
      <Show
        when={selectedChatId()}
        fallback={
          <div class="h-full overflow-y-auto scrollbar-hide">
            <MessagesList chats={chats()} onSelectChat={handleSelectChat} />
          </div>
        }
      >
        <Conversation
          chatId={selectedChatId()!}
          name={selectedChat()?.name ?? ''}
          identityLabel={selectedChat()?.identityLabel}
          subtitle={selectedChat()?.subtitle}
          avatarUrl={selectedChat()?.avatar}
          online={selectedChat()?.online}
          isPinned={selectedChat()?.isPinned}
          isAIChat={selectedChat()?.isAIChat}
          messages={messages()[selectedChatId()!] ?? []}
          onBack={handleBack}
          onSendMessage={handleSendMessage}
        />
      </Show>
    </div>
  )
}

export default MessagesView
