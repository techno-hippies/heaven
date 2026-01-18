import { Show, type Component } from 'solid-js'
import { cn } from '@/lib/utils'
import { Avatar } from '@/ui/avatar'
import { IconButton } from '@/ui/icon-button'
import { Icon } from '@/icons'
import type { VoiceState } from '../types'

export interface VoicePageProps {
  state: VoiceState
  isMuted: boolean
  duration: number
  isBotSpeaking?: boolean
  name: string
  avatarUrl?: string
  onToggleMute?: () => void
  onEndCall?: () => void
  onStartCall?: () => void
  onBack?: () => void
  class?: string
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const VoiceDots: Component<{ state: VoiceState; isSpeaking?: boolean }> = (props) => {
  return (
    <div class="flex items-center justify-center gap-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          class={cn(
            'w-3 h-3 rounded-full bg-primary transition-all duration-300',
            props.state === 'idle' && 'opacity-30',
            props.state === 'connecting' && 'animate-voice-connecting',
            props.state === 'connected' && !props.isSpeaking && 'animate-voice-idle',
            props.state === 'connected' && props.isSpeaking && 'animate-voice-speaking',
            props.state === 'error' && 'bg-destructive opacity-50'
          )}
          style={{
            'animation-delay': `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}

const getStatusText = (state: VoiceState, isSpeaking?: boolean): string => {
  switch (state) {
    case 'idle':
      return 'Tap to start call'
    case 'connecting':
      return 'Connecting...'
    case 'connected':
      return isSpeaking ? 'Speaking...' : 'Listening'
    case 'error':
      return 'Connection failed'
  }
}

export const VoicePage: Component<VoicePageProps> = (props) => {
  return (
    <div class={cn('flex flex-col h-full bg-background', props.class)}>
      <header class="flex items-center gap-3 px-4 py-3 flex-shrink-0">
        <IconButton
          icon="caret-left"
          label="Go back"
          variant="ghost"
          size="md"
          onClick={props.onBack}
        />
        <div class="flex-1" />
        <Show when={props.state === 'connected'}>
          <span class="text-base text-muted-foreground font-mono">
            {formatDuration(props.duration)}
          </span>
        </Show>
      </header>

      <div class="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        <div class="relative">
          <Show when={props.state === 'connected'}>
            <div
              class={cn(
                'absolute inset-0 rounded-full bg-primary/20',
                props.isBotSpeaking && 'animate-voice-pulse'
              )}
              style={{
                transform: 'scale(1.3)',
              }}
            />
          </Show>
          <Avatar
            src={props.avatarUrl}
            fallback={props.name}
            size="3xl"
            class="text-4xl relative z-10"
          />
        </div>

        <div class="text-center">
          <h1 class="text-2xl font-semibold">{props.name}</h1>
          <p class="text-muted-foreground mt-1">
            {getStatusText(props.state, props.isBotSpeaking)}
          </p>
        </div>

        <VoiceDots state={props.state} isSpeaking={props.isBotSpeaking} />
      </div>

      <div class="flex-shrink-0 px-6 pb-8 pt-4">
        <Show when={props.state === 'idle' || props.state === 'error'}>
          <div class="flex justify-center">
            <button
              type="button"
              onClick={props.onStartCall}
              class={cn(
                'w-20 h-20 rounded-full flex items-center justify-center',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90 active:scale-95 transition-all',
                'shadow-lg shadow-primary/30'
              )}
            >
              <Icon name="phone" weight="fill" class="text-3xl" />
            </button>
          </div>
        </Show>

        <Show when={props.state === 'connecting'}>
          <div class="flex justify-center">
            <button
              type="button"
              onClick={props.onEndCall}
              class={cn(
                'w-20 h-20 rounded-full flex items-center justify-center',
                'bg-destructive text-destructive-foreground',
                'hover:bg-destructive/90 active:scale-95 transition-all'
              )}
            >
              <Icon name="phone-disconnect" weight="fill" class="text-3xl" />
            </button>
          </div>
        </Show>

        <Show when={props.state === 'connected'}>
          <div class="flex items-center justify-center gap-8">
            <button
              type="button"
              onClick={props.onToggleMute}
              class={cn(
                'w-16 h-16 rounded-full flex items-center justify-center transition-all',
                props.isMuted
                  ? 'bg-destructive/20 text-destructive'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              )}
            >
              <Icon
                name={props.isMuted ? 'microphone-slash' : 'microphone'}
                weight="fill"
                class="text-2xl"
              />
            </button>

            <button
              type="button"
              onClick={props.onEndCall}
              class={cn(
                'w-20 h-20 rounded-full flex items-center justify-center',
                'bg-destructive text-destructive-foreground',
                'hover:bg-destructive/90 active:scale-95 transition-all'
              )}
            >
              <Icon name="phone-disconnect" weight="fill" class="text-3xl" />
            </button>

            <button
              type="button"
              class="w-16 h-16 rounded-full flex items-center justify-center bg-secondary text-foreground hover:bg-secondary/80 transition-all"
            >
              <Icon name="speaker-high" weight="fill" class="text-2xl" />
            </button>
          </div>
        </Show>
      </div>
    </div>
  )
}

export default VoicePage
