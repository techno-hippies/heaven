import type { Dm } from '@/lib/xmtp'

export type VoiceState = 'idle' | 'connecting' | 'connected' | 'error'

export type DisappearingDuration = 'off' | '24h' | '7d' | '90d'

export interface Message {
  id: string
  content: string
  sender: 'user' | 'other'
  timestamp: Date
  optimistic?: boolean
}

export interface Chat {
  id: string
  name: string
  identityLabel?: string
  subtitle?: string
  avatar?: string
  lastMessage: string
  timestamp: Date
  unreadCount: number
  online?: boolean
  isPinned?: boolean
  isAIChat?: boolean
  disappearingSetting?: DisappearingDuration
  /** Peer address for XMTP chats */
  peerAddress?: string
  /** XMTP conversation reference */
  xmtpConversation?: Dm
}
