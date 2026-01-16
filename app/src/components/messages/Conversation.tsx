/**
 * Conversation - Full conversation view with header, messages, and input
 * - Header with back button, avatar, name, and settings
 * - Disappearing messages settings via modal (desktop) or drawer (mobile)
 * - Voice call support for AI chats
 */

import { createSignal, createEffect, For, Show, type Component } from 'solid-js'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { IconButton } from '@/components/ui/icon-button'
import { Icon } from '@/components/icons'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { VoicePage } from '@/components/voice'
import type { VoiceState } from '@/lib/voice'

export interface Message {
  id: string
  content: string
  sender: 'user' | 'other'
  timestamp: Date
}

export interface ConversationProps {
  chatId: string
  name: string
  avatarUrl?: string
  online?: boolean
  isPinned?: boolean
  /** AI companion chat - no disappearing messages */
  isAIChat?: boolean
  messages?: Message[]
  /** Whether AI is currently responding */
  isLoading?: boolean
  onBack?: () => void
  onSendMessage?: (message: string) => void
  /** Voice call state (AI chat only) */
  voiceState?: VoiceState
  /** Whether microphone is muted */
  voiceMuted?: boolean
  /** Voice call duration in seconds */
  voiceDuration?: number
  /** Whether the AI is currently speaking */
  voiceBotSpeaking?: boolean
  /** Called to start voice call */
  onStartVoiceCall?: () => void
  /** Called to end voice call */
  onEndVoiceCall?: () => void
  /** Called to toggle mute */
  onToggleVoiceMute?: () => void
  /** Current disappearing messages setting */
  disappearingSetting?: DisappearingDuration
  /** Called when disappearing messages setting changes */
  onDisappearingChange?: (duration: DisappearingDuration) => void
  class?: string
}

export type DisappearingDuration = 'off' | '24h' | '7d' | '90d'

const DISAPPEARING_OPTIONS: { value: DisappearingDuration; label: string; description: string }[] = [
  { value: 'off', label: 'Off', description: 'Messages won\'t disappear' },
  { value: '24h', label: '24 hours', description: 'Messages disappear after 24 hours' },
  { value: '7d', label: '7 days', description: 'Messages disappear after 7 days' },
  { value: '90d', label: '90 days', description: 'Messages disappear after 90 days' },
]

/** Check if viewport is mobile */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = createSignal(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  )

  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(max-width: 639px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mediaQuery.addEventListener('change', handler)
  }

  return isMobile
}

/** Disappearing messages settings content */
const DisappearingMessagesSettings: Component<{
  currentValue: DisappearingDuration
  onChange: (value: DisappearingDuration) => void
}> = (props) => {
  return (
    <div class="space-y-2 pt-2">
      <For each={DISAPPEARING_OPTIONS}>
        {(option) => (
          <button
            type="button"
            onClick={() => props.onChange(option.value)}
            class={cn(
              'w-full flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer',
              'hover:bg-secondary/50 active:scale-[0.98]',
              props.currentValue === option.value && 'bg-secondary ring-2 ring-primary'
            )}
          >
            <div class={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
              props.currentValue === option.value
                ? 'border-primary bg-primary'
                : 'border-muted-foreground'
            )}>
              <Show when={props.currentValue === option.value}>
                <Icon name="check" class="text-xs text-primary-foreground" />
              </Show>
            </div>
            <div class="text-left">
              <p class="text-base font-medium">{option.label}</p>
              <p class="text-sm text-muted-foreground">{option.description}</p>
            </div>
          </button>
        )}
      </For>
    </div>
  )
}

export const Conversation: Component<ConversationProps> = (props) => {
  const isMobile = useIsMobile()
  const [settingsOpen, setSettingsOpen] = createSignal(false)
  let messagesEndRef: HTMLDivElement | undefined

  // Use prop value or default to 'off'
  const currentDisappearing = () => props.disappearingSetting ?? 'off'

  // Scroll to bottom when messages change
  createEffect(() => {
    if (props.messages && messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: 'smooth' })
    }
  })

  const handleDisappearingChange = (value: DisappearingDuration) => {
    // Call parent callback if provided
    props.onDisappearingChange?.(value)
    setSettingsOpen(false)
  }

  // Group messages by sender for avatar display
  const shouldShowAvatar = (index: number): boolean => {
    if (!props.messages) return true
    const msg = props.messages[index]
    const nextMsg = props.messages[index + 1]
    // Show avatar if next message is from different sender or this is last message
    return !nextMsg || nextMsg.sender !== msg.sender
  }

  // Check if we're in an active voice call
  const inVoiceCall = () =>
    props.voiceState === 'connecting' || props.voiceState === 'connected'

  return (
    <>
      {/* Voice call view */}
      <Show when={inVoiceCall()}>
        <VoicePage
          state={props.voiceState!}
          isMuted={props.voiceMuted ?? false}
          duration={props.voiceDuration ?? 0}
          isBotSpeaking={props.voiceBotSpeaking}
          name={props.name}
          avatarUrl={props.avatarUrl}
          onBack={props.onEndVoiceCall}
          onStartCall={props.onStartVoiceCall}
          onEndCall={props.onEndVoiceCall}
          onToggleMute={props.onToggleVoiceMute}
          class={props.class}
        />
      </Show>

      {/* Chat view */}
      <Show when={!inVoiceCall()}>
        <div class={cn('flex flex-col h-full', props.class)}>
      {/* Header */}
      <header class="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
        {/* Back button */}
        <IconButton
          icon="caret-left"
          label="Go back"
          variant="ghost"
          size="md"
          onClick={props.onBack}
        />

        {/* Avatar and name */}
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <Avatar
            src={props.avatarUrl}
            fallback={props.name}
            size="lg"
            online={props.online}
          />
          <div class="min-w-0">
            <h2 class="text-base font-semibold truncate flex items-center gap-1">
              {props.name}
              {props.isPinned && (
                <Icon name="sparkle" weight="fill" class="text-primary text-sm" />
              )}
            </h2>
            <Show when={props.online}>
              <p class="text-xs text-muted-foreground">Online</p>
            </Show>
          </div>
        </div>

        {/* Voice call button for AI chat */}
        <Show when={props.isAIChat}>
          <IconButton
            icon="phone"
            label="Start voice call"
            variant="ghost"
            size="md"
            onClick={props.onStartVoiceCall}
          />
        </Show>

        {/* Settings button - hidden for AI chat (no disappearing messages) */}
        <Show when={!props.isAIChat}>
          <IconButton
            icon="timer"
            label="Disappearing messages settings"
            variant="ghost"
            size="md"
            onClick={() => setSettingsOpen(true)}
          />
        </Show>
      </header>

      {/* Messages */}
      <div class="flex-1 overflow-y-auto scrollbar-hide px-4 py-4">
        <div class="space-y-2">
          <For each={props.messages}>
            {(message, index) => (
              <MessageBubble
                content={message.content}
                sender={message.sender}
                timestamp={message.timestamp}
                avatarUrl={message.sender === 'other' ? props.avatarUrl : undefined}
                avatarFallback={message.sender === 'other' ? props.name : undefined}
                showAvatar={message.sender === 'other' && shouldShowAvatar(index())}
                isStreaming={message.id.startsWith('streaming-')}
              />
            )}
          </For>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div class="px-4 py-3 border-t border-border flex-shrink-0">
        <MessageInput
          onSend={props.onSendMessage}
          placeholder={props.isLoading ? 'Thinking...' : `Message ${props.name}...`}
          disabled={props.isLoading}
        />
      </div>

      {/* Disappearing messages settings - only for human chats, not AI */}
      <Show when={!props.isAIChat}>
        <Show when={!isMobile()}>
          <Dialog open={settingsOpen()} onOpenChange={setSettingsOpen}>
            <DialogContent class="sm:max-w-md">
              <DialogHeader>
                <DialogTitle class="flex items-center gap-2">
                  <Icon name="timer" class="text-xl" />
                  Disappearing Messages
                </DialogTitle>
                <DialogDescription>
                  Set messages in this chat to automatically disappear.
                </DialogDescription>
              </DialogHeader>
              <DisappearingMessagesSettings
                currentValue={currentDisappearing()}
                onChange={handleDisappearingChange}
              />
            </DialogContent>
          </Dialog>
        </Show>

        <Show when={isMobile()}>
          <Drawer open={settingsOpen()} onOpenChange={setSettingsOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle class="flex items-center justify-center gap-2">
                  <Icon name="timer" class="text-xl" />
                  Disappearing Messages
                </DrawerTitle>
                <DrawerDescription>
                  Set messages in this chat to automatically disappear.
                </DrawerDescription>
              </DrawerHeader>
              <DisappearingMessagesSettings
                currentValue={currentDisappearing()}
                onChange={handleDisappearingChange}
              />
            </DrawerContent>
          </Drawer>
        </Show>
      </Show>
        </div>
      </Show>
    </>
  )
}

export default Conversation
