import type { Chat, Message } from './types'
import type { MatchProfile } from '@/features/matching'

const getAvatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=65c9ff,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`

const getAnimeAvatar = (seed: string) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`

export const SCARLETT_CHAT: Chat = {
  id: 'scarlett',
  name: 'Scarlett',
  identityLabel: 'Scarlett',
  avatar: getAvatarUrl('scarlett-ai'),
  lastMessage: "Hey, I'm Scarlett. Think of me as your life coach.",
  timestamp: new Date(Date.now() - 1000 * 60 * 5),
  unreadCount: 1,
  online: true,
  isPinned: true,
  isAIChat: true,
}

export const SAMPLE_CHATS: Chat[] = [
  {
    id: '1',
    name: 'Emma',
    avatar: getAvatarUrl('emma'),
    lastMessage: 'That sounds amazing! Would love to hear more',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 0,
    online: true,
  },
  {
    id: '2',
    name: 'Sophie',
    avatar: getAvatarUrl('sophie'),
    lastMessage: 'See you tomorrow then!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 1,
    online: false,
  },
  {
    id: '3',
    name: 'Olivia',
    avatar: getAvatarUrl('olivia'),
    lastMessage: 'Haha that was so funny',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    unreadCount: 0,
    online: false,
  },
  {
    id: '4',
    name: 'Ava',
    avatar: getAvatarUrl('ava'),
    lastMessage: 'Thanks for the recommendation!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 3,
    online: true,
  },
  {
    id: '5',
    name: 'Isabella',
    avatar: getAvatarUrl('isabella'),
    lastMessage: 'Let me know when you are free',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    unreadCount: 0,
    online: false,
  },
]

export const SAMPLE_MESSAGES: Message[] = [
  {
    id: '1',
    content: 'Hey! How are you doing today?',
    sender: 'other',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: '2',
    content: "I'm good! Just been busy with work. How about you?",
    sender: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 55),
  },
  {
    id: '3',
    content: 'Same here! I was thinking about what you said earlier about trying that new restaurant downtown.',
    sender: 'other',
    timestamp: new Date(Date.now() - 1000 * 60 * 50),
  },
  {
    id: '4',
    content: "Oh yes! We should definitely go this weekend if you're free.",
    sender: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: '5',
    content: 'That sounds perfect! Saturday evening works for me. What time were you thinking?',
    sender: 'other',
    timestamp: new Date(Date.now() - 1000 * 60 * 40),
  },
  {
    id: '6',
    content: 'How about 7pm? That way we can grab drinks first',
    sender: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 35),
  },
  {
    id: '7',
    content: 'Love it! See you then.',
    sender: 'other',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
]

export const SCARLETT_MESSAGES: Message[] = [
  {
    id: '1',
    content: 'Hey, think of me as your lifecoach. I have context of your screen time and am willing to coach you toward healthy habits.',
    sender: 'other',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: '2',
    content: 'That sounds helpful! What kind of habits are you thinking?',
    sender: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 55),
  },
  {
    id: '3',
    content: "I noticed you've been spending a lot of time scrolling. Maybe we could work on setting some boundaries together?",
    sender: 'other',
    timestamp: new Date(Date.now() - 1000 * 60 * 50),
  },
]

export const DEFAULT_MESSAGES: Record<string, Message[]> = {
  scarlett: [
    {
      id: '1',
      content: "Hey, I'm Scarlett. Think of me as your life coach. Whether you want to talk about your dating life or your screen time, I'm here to listen.",
      sender: 'other',
      timestamp: new Date(),
    },
  ],
}

export const SAMPLE_CHATS_WITH_SCARLETT = [SCARLETT_CHAT, ...SAMPLE_CHATS]

export const SAMPLE_MATCHES: MatchProfile[] = [
  { id: 'm1', name: 'Luna', avatar: getAnimeAvatar('luna'), isNew: true },
  { id: 'm2', name: 'Nova', avatar: getAnimeAvatar('nova'), isNew: true },
  { id: 'm3', name: 'Aria', avatar: getAnimeAvatar('aria') },
  { id: 'm4', name: 'Kai', avatar: getAnimeAvatar('kai') },
  { id: 'm5', name: 'Miko', avatar: getAnimeAvatar('miko') },
  { id: 'm6', name: 'Zen', avatar: getAnimeAvatar('zen') },
]
