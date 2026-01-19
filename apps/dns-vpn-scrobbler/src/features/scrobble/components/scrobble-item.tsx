import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { cn, formatRelativeTime } from '@/lib/utils'
import { Icon } from '@/icons'

export interface ScrobbleItemProps {
  title: string
  artist: string
  albumArtUrl?: string
  playedAt: number
  isNowPlaying?: boolean
  pending?: boolean
  class?: string
}

export const ScrobbleItem: Component<ScrobbleItemProps> = (props) => {
  const timestamp = () => props.isNowPlaying ? 'Now' : formatRelativeTime(props.playedAt)

  return (
    <div
      class={cn(
        'flex items-center gap-3 p-2 -mx-2 rounded-lg',
        props.isNowPlaying && 'bg-primary/5',
        props.class
      )}
    >
      {/* Album art with optional pending badge */}
      <div class="relative">
        <Show
          when={props.albumArtUrl}
          fallback={
            <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Icon name="music-note" class="text-muted-foreground" />
            </div>
          }
        >
          <img
            src={props.albumArtUrl}
            alt={props.title}
            class="w-10 h-10 rounded-lg object-cover"
          />
        </Show>
        <Show when={props.pending}>
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-card" />
        </Show>
      </div>

      {/* Content */}
      <div class="flex-1 min-w-0">
        <p class="font-medium text-foreground truncate">{props.title}</p>
        <p class="text-muted-foreground truncate">{props.artist}</p>
      </div>

      {/* Timestamp */}
      <span
        class={cn(
          'tabular-nums shrink-0',
          props.isNowPlaying ? 'text-primary font-medium' : 'text-muted-foreground'
        )}
      >
        {timestamp()}
      </span>
    </div>
  )
}
