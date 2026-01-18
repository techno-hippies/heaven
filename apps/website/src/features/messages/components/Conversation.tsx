import { createSignal, createEffect, For, Show, onCleanup, type Component } from 'solid-js'
import { cn } from '@/lib/utils'
import { Avatar } from '@/ui/avatar'
import { IconButton } from '@/ui/icon-button'
import { Icon } from '@/icons'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/ui/drawer'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { VoicePage } from './VoicePage'
import type { DisappearingDuration, Message, VoiceState } from '../types'

export interface ConversationProps {
  chatId: string
  name: string
  identityLabel?: string
  subtitle?: string
  avatarUrl?: string
  online?: boolean
  isPinned?: boolean
  isAIChat?: boolean
  messages?: Message[]
  isLoading?: boolean
  onBack?: () => void
  onSendMessage?: (message: string) => void
  voiceState?: VoiceState
  voiceMuted?: boolean
  voiceDuration?: number
  voiceBotSpeaking?: boolean
  onStartVoiceCall?: () => void
  onEndVoiceCall?: () => void
  onToggleVoiceMute?: () => void
  disappearingSetting?: DisappearingDuration
  onDisappearingChange?: (duration: DisappearingDuration) => void
  class?: string
}

const DISAPPEARING_OPTIONS: { value: DisappearingDuration; label: string; description: string }[] = [
  { value: 'off', label: 'Off', description: "Messages won't disappear" },
  { value: '24h', label: '24 hours', description: 'Messages disappear after 24 hours' },
  { value: '7d', label: '7 days', description: 'Messages disappear after 7 days' },
  { value: '90d', label: '90 days', description: 'Messages disappear after 90 days' },
]

const useIsMobile = () => {
  const [isMobile, setIsMobile] = createSignal(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  )

  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(max-width: 639px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mediaQuery.addEventListener('change', handler)
    onCleanup(() => mediaQuery.removeEventListener('change', handler))
  }

  return isMobile
}

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
            <div
              class={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                props.currentValue === option.value
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground'
              )}
            >
              <Show when={props.currentValue === option.value}>
                <Icon name="check" class="text-xs text-primary-foreground" />
              </Show>
            </div>
            <div class="text-left">
              <p class="text-base font-medium">{option.label}</p>
              <p class="text-base text-muted-foreground">{option.description}</p>
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

  const currentDisappearing = () => props.disappearingSetting ?? 'off'

  createEffect(() => {
    if (props.messages && messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: 'smooth' })
    }
  })

  const handleDisappearingChange = (value: DisappearingDuration) => {
    props.onDisappearingChange?.(value)
    setSettingsOpen(false)
  }

  const shouldShowAvatar = (index: number): boolean => {
    if (!props.messages) return true
    const msg = props.messages[index]
    const nextMsg = props.messages[index + 1]
    return !nextMsg || nextMsg.sender !== msg.sender
  }

  const inVoiceCall = () =>
    props.voiceState === 'connecting' || props.voiceState === 'connected'

  return (
    <>
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

      <Show when={!inVoiceCall()}>
        <div class={cn('flex flex-col h-full', props.class)}>
          <header class="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
            <IconButton
              icon="caret-left"
              label="Go back"
              variant="ghost"
              size="md"
              onClick={props.onBack}
            />

            <div class="flex items-center gap-3 flex-1 min-w-0">
              <Show when={props.isAIChat}>
                <Avatar
                  src={props.avatarUrl}
                  fallback={props.name}
                  size="md"
                  online={props.online}
                />
              </Show>
              <div class="min-w-0">
                <h2 class="text-base font-semibold truncate flex items-center gap-1">
                  {props.identityLabel ?? props.name}
                  {props.isPinned && (
                    <Icon name="sparkle" weight="fill" class="text-primary text-sm" />
                  )}
                </h2>
                <Show
                  when={props.subtitle}
                  fallback={
                    <Show when={props.online}>
                      <p class="text-base text-muted-foreground">Online</p>
                    </Show>
                  }
                >
                  <p class="text-base text-muted-foreground">{props.subtitle}</p>
                </Show>
              </div>
            </div>

            <Show when={props.isAIChat}>
              <IconButton
                icon="phone"
                label="Start voice call"
                variant="ghost"
                size="md"
                onClick={props.onStartVoiceCall}
              />
            </Show>

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

          <div class="px-4 py-3 border-t border-border flex-shrink-0">
            <MessageInput
              onSend={props.onSendMessage}
              placeholder={props.isLoading ? 'Thinking...' : `Message ${props.name}...`}
              disabled={props.isLoading}
            />
          </div>

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
