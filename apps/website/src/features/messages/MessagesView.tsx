/**
 * MessagesView - Main messages component with XMTP integration
 *
 * Features:
 * - Automatic XMTP client initialization when authenticated
 * - Real-time message streaming
 * - Optimistic message updates with reconciliation
 * - Consent state management (Unknown → Allowed)
 * - 15-second auto-refresh for conversations
 * - Scarlett AI chat with Agora voice calls
 */

import {
  createSignal,
  createMemo,
  createEffect,
  onCleanup,
  Show,
  type Component,
} from 'solid-js'
import { cn } from '@/lib/utils'
import { useAuth } from '@/app/providers/AuthContext'
import { Matches, type MatchProfile } from '@/features/matching'
import { MessagesList } from './components/MessagesList'
import { Conversation } from './components/Conversation'
import {
  DEFAULT_MESSAGES,
  SCARLETT_CHAT,
  SAMPLE_MATCHES,
} from './fixtures'
import type { Chat, Message, VoiceState } from './types'

// XMTP imports
import {
  initXMTPClient,
  getClient,
  listDMs,
  getOrCreateDM,
  sendMessage as sendXMTPMessage,
  loadMessages,
  streamMessages,
  disconnect as disconnectXMTP,
  isConnected as isXMTPConnected,
  type Dm,
  type DecodedMessage,
} from '@/lib/xmtp'
import { ConsentState, GroupMessageKind, SortDirection } from '@xmtp/browser-sdk'

// Voice imports
import { useAgoraVoice } from '@/lib/voice'

const IS_DEV = import.meta.env.DEV

/** Placeholder avatar URLs using DiceBear API */
const getAvatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=65c9ff,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`

/**
 * Extract displayable text content from XMTP message
 */
function getDisplayableXMTPContent(msg: DecodedMessage): string | null {
  const kind = msg.kind as unknown
  const isApplication =
    kind === GroupMessageKind.Application ||
    kind === 'application' ||
    (typeof kind === 'number' && kind === 1)
  if (!isApplication) return null

  const typeId = msg.contentType?.typeId
  if (typeId !== 'text' && typeId !== 'markdown') return null
  if (typeof msg.content === 'string') return msg.content
  if (typeof msg.fallback === 'string' && msg.fallback.length > 0) {
    return msg.fallback
  }
  return null
}

/**
 * Convert XMTP DecodedMessage to local Message format
 */
function xmtpToLocalMessage(msg: DecodedMessage, myInboxId: string): Message | null {
  const content = getDisplayableXMTPContent(msg)
  if (!content) return null

  return {
    id: msg.id,
    content,
    sender: msg.senderInboxId === myInboxId ? 'user' : 'other',
    timestamp: msg.sentAt,
  }
}

function formatAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatMatchLabel(address: string, date: Date): string {
  const label = formatAddress(address)
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  return `Matched with ${label} on ${formattedDate}`
}

export interface MessagesViewProps {
  class?: string
  matches?: MatchProfile[]
  onSelectMatch?: (id: string) => void
}

export const MessagesView: Component<MessagesViewProps> = (props) => {
  const auth = useAuth()
  const [selectedChatId, setSelectedChatId] = createSignal<string | null>(null)
  const [chats, setChats] = createSignal<Chat[]>([SCARLETT_CHAT])
  const [messages, setMessages] = createSignal<Record<string, Message[]>>(DEFAULT_MESSAGES)
  const [matches] = createSignal<MatchProfile[]>(props.matches ?? SAMPLE_MATCHES)
  const [isLoading, setIsLoading] = createSignal(false)

  // Voice state for Scarlett AI
  const [isBotSpeaking, setIsBotSpeaking] = createSignal(false)

  const selectedChat = createMemo(() => chats().find((c) => c.id === selectedChatId()))

  // Agora voice hook - only active when authenticated and in Scarlett chat
  const pkpInfo = () => auth.pkpInfo()
  const voice = createMemo(() => {
    const info = pkpInfo()
    if (!info) return null

    return useAgoraVoice({
      pkpInfo: info,
      signMessage: auth.signMessage,
      onBotSpeaking: () => setIsBotSpeaking(true),
      onBotSilent: () => setIsBotSpeaking(false),
      onError: (error) => {
        console.error('[MessagesView] Voice error:', error)
      },
    })
  })

  // Voice handlers for Scarlett chat
  const handleStartVoiceCall = () => {
    const v = voice()
    if (v && selectedChatId() === 'scarlett') {
      v.startCall()
    } else if (!pkpInfo()) {
      auth.openAuthDialog()
    }
  }

  const handleEndVoiceCall = () => {
    voice()?.endCall()
  }

  const handleToggleVoiceMute = () => {
    voice()?.toggleMute()
  }

  // Get voice state for rendering
  const voiceState = (): VoiceState => voice()?.state() ?? 'idle'
  const voiceMuted = () => voice()?.isMuted() ?? false
  const voiceDuration = () => voice()?.duration() ?? 0

  // XMTP state
  let messageStreamCleanup: (() => void) | null = null
  let isInitializingXMTP = false
  let activeXMTPChatId: string | null = null
  let activeXMTPConversationId: string | null = null
  const initializingConversations = new Set<string>()
  let xmtpRefreshTimer: number | null = null

  // Initialize XMTP when authenticated
  createEffect(() => {
    const pkpInfo = auth.pkpInfo()

    if (pkpInfo && !isXMTPConnected() && !isInitializingXMTP) {
      isInitializingXMTP = true
      initXMTP().finally(() => {
        isInitializingXMTP = false
      })
    }
  })

  async function initXMTP() {
    try {
      if (IS_DEV) console.log('[MessagesView] Initializing XMTP...')

      const pkpInfo = auth.pkpInfo()
      if (!pkpInfo) return

      const client = await initXMTPClient(pkpInfo, auth.signMessage)
      await refreshXMTPChats(client)
      startXMTPRefresh(client)
    } catch (error) {
      console.error('[MessagesView] Failed to initialize XMTP:', error)
    }
  }

  async function refreshXMTPChats(client?: NonNullable<ReturnType<typeof getClient>>) {
    const activeClient = client || getClient()
    if (!activeClient) return

    const dms = await listDMs()
    if (IS_DEV) console.log('[MessagesView] Loaded', dms.length, 'XMTP conversations')

    const xmtpChats: Chat[] = await Promise.all(
      dms.map(async (conv) => {
        const latestMessages = await conv.messages({
          limit: 10n,
          direction: SortDirection.Descending,
          kind: GroupMessageKind.Application,
        })
        const myInboxId = activeClient.inboxId ?? ''
        const previewMsg = latestMessages
          .map((m) => xmtpToLocalMessage(m, myInboxId))
          .find((m): m is Message => m !== null)
        const members = await conv.members()

        const peer = members.find((m) => m.inboxId !== activeClient.inboxId)
        const peerAddress = peer?.accountIdentifiers?.[0]?.identifier || 'Unknown'
        const matchDate = conv.createdAt ? new Date(conv.createdAt) : previewMsg?.timestamp

        const displayName = peerAddress !== 'Unknown' ? formatAddress(peerAddress) : 'Unknown'

        return {
          id: conv.id,
          name: displayName,
          identityLabel: peerAddress !== 'Unknown' ? displayName : undefined,
          subtitle:
            peerAddress !== 'Unknown' && matchDate
              ? formatMatchLabel(peerAddress, matchDate)
              : undefined,
          avatar: getAvatarUrl(peerAddress),
          lastMessage: previewMsg?.content || 'No messages yet',
          timestamp: previewMsg?.timestamp || new Date(),
          unreadCount: 0,
          peerAddress,
          xmtpConversation: conv,
        }
      })
    )

    // Scarlett always first, then XMTP chats
    setChats([SCARLETT_CHAT, ...xmtpChats])
  }

  function startXMTPRefresh(client: NonNullable<ReturnType<typeof getClient>>) {
    if (xmtpRefreshTimer) return
    xmtpRefreshTimer = window.setInterval(() => {
      refreshXMTPChats(client).catch((error) => {
        if (IS_DEV) console.error('[MessagesView] Refresh error:', error)
      })
    }, 15000)
  }

  function stopXMTPRefresh() {
    if (xmtpRefreshTimer) {
      window.clearInterval(xmtpRefreshTimer)
      xmtpRefreshTimer = null
    }
  }

  onCleanup(() => {
    if (messageStreamCleanup) {
      messageStreamCleanup()
    }
    stopXMTPRefresh()
    disconnectXMTP()
  })

  // Load messages when conversation selected
  createEffect(() => {
    const chatId = selectedChatId()
    const chat = selectedChat()

    if (!chatId || !chat) {
      if (messageStreamCleanup) {
        messageStreamCleanup()
        messageStreamCleanup = null
      }
      activeXMTPChatId = null
      activeXMTPConversationId = null
      return
    }

    // Scarlett uses fixture messages
    if (chatId === 'scarlett') {
      activeXMTPChatId = null
      activeXMTPConversationId = null
      return
    }

    if (activeXMTPChatId && activeXMTPChatId !== chatId && messageStreamCleanup) {
      messageStreamCleanup()
      messageStreamCleanup = null
    }

    if (chat.xmtpConversation) {
      if (
        activeXMTPChatId === chatId &&
        activeXMTPConversationId === chat.xmtpConversation.id
      ) {
        return
      }
      activeXMTPChatId = chatId
      activeXMTPConversationId = chat.xmtpConversation.id
      loadXMTPMessagesFromConv(chatId, chat.xmtpConversation)
    } else if (chat.peerAddress) {
      if (initializingConversations.has(chatId)) return
      initializingConversations.add(chatId)
      initXMTPConversation(chatId, chat.peerAddress).finally(() => {
        initializingConversations.delete(chatId)
      })
    }
  })

  async function initXMTPConversation(chatId: string, peerAddress: string) {
    const pkpInfo = auth.pkpInfo()
    if (!pkpInfo) {
      if (IS_DEV) console.log('[MessagesView] Not authenticated')
      auth.openAuthDialog()
      return
    }

    try {
      if (IS_DEV) console.log('[MessagesView] Creating conversation with:', peerAddress)

      await initXMTPClient(pkpInfo, auth.signMessage)
      const conversation = await getOrCreateDM(peerAddress)

      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, xmtpConversation: conversation } : c))
      )

      await loadXMTPMessagesFromConv(chatId, conversation)
    } catch (error) {
      console.error('[MessagesView] Failed to create conversation:', error)
      setMessages((prev) => ({
        ...prev,
        [chatId]: [
          {
            id: `error-${Date.now()}`,
            content: `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`,
            sender: 'other',
            timestamp: new Date(),
          },
        ],
      }))
    }
  }

  function upsertXMTPMessage(chatId: string, localMsg: Message) {
    setMessages((prev) => {
      const existing = prev[chatId] || []

      if (existing.some((m) => m.id === localMsg.id)) {
        return prev
      }

      const optimisticIndex = existing.findIndex(
        (m) => m.optimistic && m.sender === localMsg.sender && m.content === localMsg.content
      )

      if (optimisticIndex >= 0) {
        const updated = existing.slice()
        updated[optimisticIndex] = localMsg
        return { ...prev, [chatId]: updated }
      }

      return { ...prev, [chatId]: [...existing, localMsg] }
    })
  }

  async function loadXMTPMessagesFromConv(chatId: string, conversation: Dm) {
    try {
      const client = getClient()
      const myInboxId = client?.inboxId ?? ''

      const consentState = await conversation.consentState()
      if (consentState === ConsentState.Unknown) {
        await conversation.updateConsentState(ConsentState.Allowed)
      }
      if (client) {
        await client.conversations.syncAll([ConsentState.Allowed, ConsentState.Unknown])
      }

      if (messageStreamCleanup) {
        messageStreamCleanup()
      }

      const xmtpMessages = await loadMessages(conversation, {
        direction: SortDirection.Ascending,
        kind: GroupMessageKind.Application,
      })
      const localMessages = xmtpMessages
        .map((m) => xmtpToLocalMessage(m, myInboxId))
        .filter((m): m is Message => m !== null)

      setMessages((prev) => {
        if (localMessages.length === 0 && (prev[chatId] || []).length > 0) {
          return prev
        }

        const merged = [...(prev[chatId] || [])]
        for (const msg of localMessages) {
          const existingIndex = merged.findIndex((m) => m.id === msg.id)
          if (existingIndex >= 0) {
            merged[existingIndex] = msg
            continue
          }

          const optimisticIndex = merged.findIndex(
            (m) => m.optimistic && m.sender === msg.sender && m.content === msg.content
          )
          if (optimisticIndex >= 0) {
            merged[optimisticIndex] = msg
          } else {
            merged.push(msg)
          }
        }

        merged.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        return { ...prev, [chatId]: merged }
      })

      messageStreamCleanup = await streamMessages(
        conversation,
        (newMsg) => {
          const localMsg = xmtpToLocalMessage(newMsg, myInboxId)
          if (!localMsg) return

          upsertXMTPMessage(chatId, localMsg)

          setChats((prev) =>
            prev.map((c) =>
              c.id === chatId
                ? { ...c, lastMessage: localMsg.content.slice(0, 50), timestamp: localMsg.timestamp }
                : c
            )
          )
        },
        (error) => {
          if (IS_DEV) console.error('[MessagesView] Stream error:', error)
        }
      )
    } catch (error) {
      console.error('[MessagesView] Failed to load messages:', error)
    }
  }

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId)
  }

  const handleBack = () => {
    setSelectedChatId(null)
  }

  const handleSendMessage = async (content: string) => {
    const chatId = selectedChatId()
    const chat = selectedChat()
    if (!chatId || isLoading()) return

    // Add optimistic message
    const userMessage: Message = {
      id: `optimistic-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date(),
      optimistic: chat?.xmtpConversation ? true : false,
    }

    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), userMessage],
    }))

    // Update chat preview
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, lastMessage: content, timestamp: new Date(), unreadCount: 0 } : c
      )
    )

    // For Scarlett (AI), just keep the local message (no backend)
    if (chatId === 'scarlett') {
      // Could add AI streaming here later
      return
    }

    // For XMTP chats, send via protocol
    if (chat?.xmtpConversation) {
      try {
        setIsLoading(true)
        await sendXMTPMessage(chat.xmtpConversation, content)
        // Message will appear via stream listener
      } catch (error) {
        if (IS_DEV) console.error('[MessagesView] Send failed:', error)
        setMessages((prev) => ({
          ...prev,
          [chatId]: [
            ...(prev[chatId] || []),
            {
              id: `error-${Date.now()}`,
              content: 'Failed to send message. Please try again.',
              sender: 'other',
              timestamp: new Date(),
            },
          ],
        }))
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div class={cn('h-full', props.class)}>
      <Show
        when={selectedChatId()}
        fallback={
          <div class="h-full overflow-y-auto scrollbar-hide">
            <Matches
              matches={matches()}
              onSelect={(id) => {
                console.log('Selected match:', id)
                props.onSelectMatch?.(id)
              }}
            />
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
          isLoading={isLoading()}
          onBack={handleBack}
          onSendMessage={handleSendMessage}
          voiceState={selectedChat()?.isAIChat ? voiceState() : undefined}
          voiceMuted={selectedChat()?.isAIChat ? voiceMuted() : undefined}
          voiceDuration={selectedChat()?.isAIChat ? voiceDuration() : undefined}
          voiceBotSpeaking={selectedChat()?.isAIChat ? isBotSpeaking() : undefined}
          onStartVoiceCall={selectedChat()?.isAIChat ? handleStartVoiceCall : undefined}
          onEndVoiceCall={selectedChat()?.isAIChat ? handleEndVoiceCall : undefined}
          onToggleVoiceMute={selectedChat()?.isAIChat ? handleToggleVoiceMute : undefined}
        />
      </Show>
    </div>
  )
}

export default MessagesView
