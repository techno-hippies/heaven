import { type JSX, Show, For } from 'solid-js'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { Badge } from './Badge'

export interface MatchOverlap {
  category: string
  label: string
  icon: string
}

export interface MatchModalProps {
  isOpen: boolean
  onClose: () => void
  onSendMessage?: () => void
  onKeepSwiping?: () => void
  myAvatar: string
  theirAvatar: string
  theirName: string
  overlaps?: MatchOverlap[]
  class?: string
}

export function MatchModal(props: MatchModalProps) {
  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          class="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={props.onClose}
        />

        {/* Modal */}
        <div
          class={cn(
            'relative z-10 w-full max-w-md mx-4 rounded-3xl bg-card p-8 text-center overflow-hidden',
            props.class
          )}
        >
          {/* Background gradient effect */}
          <div class="absolute inset-0 bg-gradient-to-br from-secondary/20 via-transparent to-primary/20" />

          {/* Content */}
          <div class="relative z-10 space-y-6">
            {/* Animated hearts background */}
            <div class="absolute -top-4 left-1/2 -translate-x-1/2 text-6xl animate-bounce">
              💕
            </div>

            {/* Title */}
            <div class="pt-8">
              <h2 class="text-3xl font-bold gradient-text">It's a Match!</h2>
              <p class="text-muted-foreground mt-2">
                You and {props.theirName} liked each other
              </p>
            </div>

            {/* Avatars */}
            <div class="flex justify-center items-center gap-4">
              <div class="relative">
                <img
                  src={props.myAvatar}
                  alt="You"
                  class="h-24 w-24 rounded-full object-cover ring-4 ring-secondary"
                />
                <div class="absolute -bottom-1 -right-1 bg-secondary text-white rounded-full p-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              </div>

              <div class="h-16 w-16 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center pulse-glow">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>

              <div class="relative">
                <img
                  src={props.theirAvatar}
                  alt={props.theirName}
                  class="h-24 w-24 rounded-full object-cover ring-4 ring-primary"
                />
                <div class="absolute -bottom-1 -left-1 bg-primary text-white rounded-full p-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Overlaps */}
            <Show when={props.overlaps && props.overlaps.length > 0}>
              <div class="space-y-3">
                <p class="text-sm font-medium text-muted-foreground">
                  What you have in common
                </p>
                <div class="flex flex-wrap justify-center gap-2">
                  <For each={props.overlaps}>
                    {(overlap) => (
                      <Badge variant="muted" size="lg" class="bg-white/10">
                        <span class="mr-1">{overlap.icon}</span>
                        {overlap.label}
                      </Badge>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            {/* Actions */}
            <div class="flex flex-col gap-3 pt-2">
              <Button
                variant="gradient"
                size="lg"
                class="w-full"
                onClick={props.onSendMessage}
              >
                Send a Message
              </Button>
              <Button
                variant="ghost"
                size="lg"
                class="w-full"
                onClick={props.onKeepSwiping}
              >
                Keep Swiping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  )
}

// Simplified match notification (for toast/notification style)
export function MatchNotification(props: {
  avatar: string
  name: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={props.onClick}
      class="flex items-center gap-3 rounded-xl bg-gradient-to-r from-secondary/20 to-primary/20 border border-white/10 p-3 hover:brightness-110 transition-all"
    >
      <img
        src={props.avatar}
        alt={props.name}
        class="h-12 w-12 rounded-full object-cover ring-2 ring-secondary"
      />
      <div class="text-left">
        <p class="text-sm font-semibold">New Match!</p>
        <p class="text-xs text-muted-foreground">
          You matched with {props.name}
        </p>
      </div>
      <div class="ml-auto text-secondary">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
    </button>
  )
}
