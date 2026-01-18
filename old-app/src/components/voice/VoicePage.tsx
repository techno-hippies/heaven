/**
 * VoicePage - Full-screen voice call interface
 *
 * Features:
 * - Animated pulsing dots in theme color (soft red)
 * - Voice state visualization (idle, connecting, connected, speaking)
 * - Mute/unmute and end call controls
 * - Duration timer
 */

import { Show, type Component } from 'solid-js'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { IconButton } from '@/components/ui/icon-button'
import { Icon } from '@/components/icons'
import type { VoiceState } from '@/lib/voice'

export interface VoicePageProps {
  /** Current voice connection state */
  state: VoiceState
  /** Whether microphone is muted */
  isMuted: boolean
  /** Call duration in seconds */
  duration: number
  /** Whether the AI is currently speaking */
  isBotSpeaking?: boolean
  /** Contact name */
  name: string
  /** Contact avatar URL */
  avatarUrl?: string
  /** Called to toggle mute */
  onToggleMute?: () => void
  /** Called to end the call */
  onEndCall?: () => void
  /** Called to start/retry the call */
  onStartCall?: () => void
  /** Called to go back */
  onBack?: () => void
  class?: string
}

/** Format seconds to MM:SS */
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/** Animated dots component */
const VoiceDots: Component<{
  state: VoiceState
  isSpeaking?: boolean
}> = (props) => {
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

/** Status text based on state */
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
    <div
      class={cn(
        'flex flex-col h-full bg-background',
        props.class
      )}
    >
      {/* Header */}
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
          <span class="text-sm text-muted-foreground font-mono">
            {formatDuration(props.duration)}
          </span>
        </Show>
      </header>

      {/* Main content */}
      <div class="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {/* Avatar with pulse effect */}
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
            size="xl"
            class="w-32 h-32 text-4xl relative z-10"
          />
        </div>

        {/* Name */}
        <div class="text-center">
          <h1 class="text-2xl font-semibold">{props.name}</h1>
          <p class="text-muted-foreground mt-1">
            {getStatusText(props.state, props.isBotSpeaking)}
          </p>
        </div>

        {/* Animated dots */}
        <VoiceDots state={props.state} isSpeaking={props.isBotSpeaking} />
      </div>

      {/* Controls */}
      <div class="flex-shrink-0 px-6 pb-8 pt-4">
        <Show when={props.state === 'idle' || props.state === 'error'}>
          {/* Start call button */}
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
          {/* Cancel button while connecting */}
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
          {/* In-call controls */}
          <div class="flex items-center justify-center gap-8">
            {/* Mute button */}
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

            {/* End call button */}
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

            {/* Speaker button (placeholder) */}
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
