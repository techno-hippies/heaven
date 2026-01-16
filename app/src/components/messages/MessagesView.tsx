/**
 * MessagesView - Main messages component that handles list and conversation views
 * Integrates with:
 * - XMTP for user-to-user encrypted messaging
 * - Voice worker for Scarlett AI chat with SSE streaming and voice calls
 */

import { createSignal, createMemo, createEffect, onCleanup, Show, type Component } from 'solid-js'
import type { VoiceState } from '@/lib/voice'
import { cn } from '@/lib/utils'
import { MessagesList } from './MessagesList'
import { Conversation, type Message } from './Conversation'
import { useAuth } from '@/contexts/AuthContext'
import { streamChatMessage } from '@/lib/voice/api'
import { useAgoraVoice } from '@/lib/voice'

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
  type Dm,
  type DecodedMessage,
} from '@/lib/xmtp'

const IS_DEV = import.meta.env.DEV

/** Chat conversation type */
export interface Chat {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: Date
  unreadCount: number
  online?: boolean
  isPinned?: boolean
  /** Peer address for XMTP chats */
  peerAddress?: string
  /** XMTP conversation reference */
  xmtpConversation?: Dm
}

/** Placeholder avatar URLs using DiceBear API */
const getAvatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=65c9ff,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`

/** Scarlett's special chat - always pinned at top */
const SCARLETT_CHAT: Chat = {
  id: 'scarlett',
  name: 'Scarlett',
  avatar: getAvatarUrl('scarlett-ai'),
  lastMessage: "Hey, I'm Scarlett. Think of me as your life coach.",
  timestamp: new Date(),
  unreadCount: 1,
  isPinned: true,
}

/** Test XMTP chat - hardcoded for testing */
const TEST_XMTP_ADDRESS = '0x03626B945ec2713Ea50AcE6b42a6f8650E0611B5'
const TEST_XMTP_CHAT: Chat = {
  id: 'test-xmtp',
  name: 'XMTP Test',
  avatar: getAvatarUrl(TEST_XMTP_ADDRESS),
  lastMessage: 'Tap to start an encrypted chat...',
  timestamp: new Date(),
  unreadCount: 0,
  peerAddress: TEST_XMTP_ADDRESS,
}

/** Default messages - Scarlett's intro */
const DEFAULT_MESSAGES: Record<string, Message[]> = {
  scarlett: [
    { id: '1', content: "Hey, I'm Scarlett. Think of me as your life coach. Whether you want to talk about your dating life or your screen time, I'm here to listen.", sender: 'other', timestamp: new Date() },
  ],
}

/**
 * Convert XMTP DecodedMessage to local Message format
 */
function xmtpToLocalMessage(msg: DecodedMessage, myInboxId: string): Message {
  return {
    id: msg.id,
    content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
    sender: msg.senderInboxId === myInboxId ? 'user' : 'other',
    timestamp: msg.sentAt,
  }
}

export const MessagesView: Component<{ class?: string }> = (props) => {
  const auth = useAuth()
  const [selectedChatId, setSelectedChatId] = createSignal<string | null>(null)
  const [chats, setChats] = createSignal<Chat[]>([SCARLETT_CHAT, TEST_XMTP_CHAT])
  const [messages, setMessages] = createSignal<Record<string, Message[]>>(DEFAULT_MESSAGES)
  const [isLoading, setIsLoading] = createSignal(false)
  const [isBotSpeaking, setIsBotSpeaking] = createSignal(false)

  const selectedChat = createMemo(() => chats().find(c => c.id === selectedChatId()))

  // Voice state - managed separately since we can't call hooks conditionally
  const [voiceState, setVoiceState] = createSignal<VoiceState>('idle')
  const [voiceMuted, setVoiceMuted] = createSignal(false)
  const [voiceDuration, setVoiceDuration] = createSignal(0)

  // Voice hook refs - stored when auth is available
  let voiceHook: ReturnType<typeof useAgoraVoice> | null = null

  // XMTP message stream cleanup
  let messageStreamCleanup: (() => void) | null = null

  // Initialize voice hook when authenticated
  createEffect(() => {
    const p = auth.pkpInfo()
    const a = auth.authData()

    if (p && a && !voiceHook) {
      voiceHook = useAgoraVoice({
        pkpInfo: p,
        authData: a,
        onBotSpeaking: () => setIsBotSpeaking(true),
        onBotSilent: () => setIsBotSpeaking(false),
        onError: (error) => {
          if (IS_DEV) console.error('[MessagesView] Voice error:', error)
          setVoiceState('error')
        },
      })

      // Sync voice state to signals
      createEffect(() => {
        if (voiceHook) {
          setVoiceState(voiceHook.state())
          setVoiceMuted(voiceHook.isMuted())
          setVoiceDuration(voiceHook.duration())
        }
      })
    }
  })

  // Initialize XMTP client when authenticated
  createEffect(() => {
    const p = auth.pkpInfo()
    const a = auth.authData()

    if (p && a) {
      initXMTP(p)
    }
  })

  // Load XMTP conversations
  async function initXMTP(pkpInfo: NonNullable<ReturnType<typeof auth.pkpInfo>>) {
    try {
      if (IS_DEV) console.log('[MessagesView] Initializing XMTP...')

      const client = await initXMTPClient(pkpInfo, auth.signMessage)

      // Load existing DM conversations
      const dms = await listDMs()

      if (IS_DEV) console.log('[MessagesView] Loaded', dms.length, 'XMTP conversations')

      // Convert XMTP conversations to Chat format
      const xmtpChats: Chat[] = await Promise.all(
        dms.map(async (conv) => {
          const lastMsg = await conv.lastMessage()
          const members = await conv.members()

          // Find peer (not us)
          const peer = members.find(m => m.inboxId !== client.inboxId)
          const peerAddress = peer?.accountIdentifiers?.[0]?.identifier || 'Unknown'

          return {
            id: conv.id,
            name: peerAddress.slice(0, 6) + '...' + peerAddress.slice(-4),
            avatar: getAvatarUrl(peerAddress),
            lastMessage: typeof lastMsg?.content === 'string' ? lastMsg.content : 'No messages yet',
            timestamp: lastMsg?.sentAt || new Date(),
            unreadCount: 0,
            peerAddress,
            xmtpConversation: conv,
          }
        })
      )

      // Add XMTP chats below Scarlett and test chat
      setChats([SCARLETT_CHAT, TEST_XMTP_CHAT, ...xmtpChats])

    } catch (error) {
      console.error('[MessagesView] Failed to initialize XMTP:', error)
    }
  }

  // Clean up on unmount
  onCleanup(() => {
    if (messageStreamCleanup) {
      messageStreamCleanup()
    }
    disconnectXMTP()
  })

  // Load messages when conversation is selected
  createEffect(() => {
    const chatId = selectedChatId()
    const chat = selectedChat()

    if (!chatId || !chat) {
      // Clean up previous stream
      if (messageStreamCleanup) {
        messageStreamCleanup()
        messageStreamCleanup = null
      }
      return
    }

    // Skip if Scarlett (already has default messages)
    if (chatId === 'scarlett') return

    // Load XMTP messages
    if (chat.xmtpConversation) {
      loadXMTPMessagesFromConv(chatId, chat.xmtpConversation)
    } else if (chat.peerAddress) {
      // Create/get XMTP conversation for chats with peer address (like test chat)
      initXMTPConversation(chatId, chat.peerAddress)
    }
  })

  // Initialize XMTP conversation for a peer address
  async function initXMTPConversation(chatId: string, peerAddress: string) {
    const pkpInfo = auth.pkpInfo()

    if (!pkpInfo) {
      if (IS_DEV) console.log('[MessagesView] Not authenticated, cannot create XMTP conversation')
      auth.openAuthDialog()
      return
    }

    try {
      if (IS_DEV) console.log('[MessagesView] Creating XMTP conversation with:', peerAddress)

      // Ensure XMTP client is initialized first
      const client = await initXMTPClient(pkpInfo, auth.signMessage)
      if (IS_DEV) console.log('[MessagesView] XMTP client ready, inbox:', client.inboxId)

      const conversation = await getOrCreateDM(peerAddress)
      if (IS_DEV) console.log('[MessagesView] Conversation created:', conversation.id)

      // Update the chat with the XMTP conversation reference
      setChats(prev => prev.map(c =>
        c.id === chatId ? { ...c, xmtpConversation: conversation } : c
      ))

      // Now load messages
      await loadXMTPMessagesFromConv(chatId, conversation)

    } catch (error) {
      console.error('[MessagesView] Failed to create XMTP conversation:', error)

      // Show error in messages
      setMessages(prev => ({
        ...prev,
        [chatId]: [{
          id: `error-${Date.now()}`,
          content: `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`,
          sender: 'other',
          timestamp: new Date(),
        }],
      }))
    }
  }

  async function loadXMTPMessagesFromConv(chatId: string, conversation: Dm) {
    try {
      const client = getClient()
      const myInboxId = client?.inboxId ?? ''

      // Clean up previous stream
      if (messageStreamCleanup) {
        messageStreamCleanup()
      }

      // Load existing messages
      const xmtpMessages = await loadMessages(conversation)
      const localMessages = xmtpMessages.map(m => xmtpToLocalMessage(m, myInboxId))

      setMessages(prev => ({
        ...prev,
        [chatId]: localMessages,
      }))

      // Start streaming new messages
      messageStreamCleanup = await streamMessages(
        conversation,
        (newMsg) => {
          const localMsg = xmtpToLocalMessage(newMsg, myInboxId)
          setMessages(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), localMsg],
          }))

          // Update chat preview
          setChats(prev => prev.map(c =>
            c.id === chatId
              ? { ...c, lastMessage: localMsg.content.slice(0, 50), timestamp: localMsg.timestamp }
              : c
          ))
        },
        (error) => {
          if (IS_DEV) console.error('[MessagesView] Message stream error:', error)
        }
      )

    } catch (error) {
      console.error('[MessagesView] Failed to load XMTP messages:', error)
    }
  }

  const handleStartVoiceCall = () => {
    if (!auth.pkpInfo() || !auth.authData()) {
      auth.openAuthDialog()
      return
    }
    voiceHook?.startCall()
  }

  const handleEndVoiceCall = () => {
    voiceHook?.endCall()
  }

  const handleToggleVoiceMute = () => {
    voiceHook?.toggleMute()
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

    // Add user message optimistically
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), userMessage],
    }))

    // For Scarlett (AI chat), stream response from worker
    if (chatId === 'scarlett') {
      await handleScarlettMessage(chatId, content)
      return
    }

    // For XMTP chats, send via XMTP
    if (chat?.xmtpConversation) {
      await handleXMTPMessage(chatId, chat.xmtpConversation, content)
    }
  }

  // Handle AI chat message (Scarlett)
  async function handleScarlettMessage(chatId: string, content: string) {
    const pkpInfo = auth.pkpInfo()
    const authData = auth.authData()

    // Check auth - require authentication
    if (!pkpInfo || !authData) {
      const connectMessage: Message = {
        id: `connect-${Date.now()}`,
        content: 'Connect your wallet to chat with me!',
        sender: 'other',
        timestamp: new Date(),
      }
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), connectMessage],
      }))
      auth.openAuthDialog()
      return
    }

    setIsLoading(true)
    const streamingMsgId = `streaming-${Date.now()}`

    // Add streaming placeholder
    const streamingMessage: Message = {
      id: streamingMsgId,
      content: '',
      sender: 'other',
      timestamp: new Date(),
    }
    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), streamingMessage],
    }))

    try {
      // Build history for context
      const currentMessages = messages()[chatId] || []
      const history = currentMessages.slice(-10).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content,
      }))

      let streamingContent = ''

      // Stream response using authenticated endpoint
      const fullResponse = await streamChatMessage(pkpInfo, authData, content, history, (delta) => {
        streamingContent += delta
        // Update streaming message in place
        setMessages(prev => ({
          ...prev,
          [chatId]: prev[chatId]?.map(m =>
            m.id === streamingMsgId ? { ...m, content: streamingContent } : m
          ) || [],
        }))
      })

      // Replace streaming message with final
      const finalMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: fullResponse || streamingContent,
        sender: 'other',
        timestamp: new Date(),
      }
      setMessages(prev => ({
        ...prev,
        [chatId]: prev[chatId]?.map(m =>
          m.id === streamingMsgId ? finalMessage : m
        ) || [],
      }))

      // Update chat preview
      setChats(prev => prev.map(c =>
        c.id === chatId ? { ...c, lastMessage: finalMessage.content.slice(0, 50) + '...', timestamp: new Date() } : c
      ))

    } catch (error) {
      if (IS_DEV) console.error('[MessagesView] Streaming failed:', error)

      const errorContent = error instanceof Error
        ? error.message
        : "Sorry, I'm having trouble connecting right now. Please try again in a moment."

      // Replace streaming with error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: errorContent,
        sender: 'other',
        timestamp: new Date(),
      }
      setMessages(prev => ({
        ...prev,
        [chatId]: prev[chatId]?.map(m =>
          m.id === streamingMsgId ? errorMessage : m
        ) || [],
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // Handle XMTP message
  async function handleXMTPMessage(chatId: string, conversation: Dm, content: string) {
    try {
      setIsLoading(true)
      await sendXMTPMessage(conversation, content)
      // Message will appear via the stream listener

      // Update chat preview
      setChats(prev => prev.map(c =>
        c.id === chatId ? { ...c, lastMessage: content.slice(0, 50), timestamp: new Date() } : c
      ))
    } catch (error) {
      if (IS_DEV) console.error('[MessagesView] Failed to send XMTP message:', error)

      // Show error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: 'Failed to send message. Please try again.',
        sender: 'other',
        timestamp: new Date(),
      }
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), errorMessage],
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div class={cn('h-full', props.class)}>
      <Show
        when={selectedChatId()}
        fallback={
          <div class="h-full overflow-y-auto scrollbar-hide">
            <MessagesList
              chats={chats()}
              onSelectChat={handleSelectChat}
            />
          </div>
        }
      >
        <Conversation
          chatId={selectedChatId()!}
          name={selectedChat()?.name ?? ''}
          avatarUrl={selectedChat()?.avatar}
          online={selectedChat()?.online}
          isPinned={selectedChat()?.isPinned}
          isAIChat={selectedChatId() === 'scarlett'}
          messages={messages()[selectedChatId()!] ?? []}
          isLoading={isLoading()}
          onBack={handleBack}
          onSendMessage={handleSendMessage}
          // Voice call props (Scarlett only)
          voiceState={selectedChatId() === 'scarlett' ? voiceState() : undefined}
          voiceMuted={voiceMuted()}
          voiceDuration={voiceDuration()}
          voiceBotSpeaking={isBotSpeaking()}
          onStartVoiceCall={handleStartVoiceCall}
          onEndVoiceCall={handleEndVoiceCall}
          onToggleVoiceMute={handleToggleVoiceMute}
        />
      </Show>
    </div>
  )
}

export default MessagesView
