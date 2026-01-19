import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { cn, formatDuration } from '@/lib/utils'
import { Icon } from '@/icons'

export interface NowPlayingProps {
  title: string
  artist: string
  albumArtUrl?: string
  position?: number
  duration?: number
  class?: string
}

export const NowPlaying: Component<NowPlayingProps> = (props) => {
  const progress = () => {
    if (!props.position || !props.duration) return 0
    return (props.position / props.duration) * 100
  }

  return (
    <section class={cn('bg-card border border-border rounded-2xl p-4', props.class)}>
      <div class="flex items-center gap-4">
        {/* Album art */}
        <div class="relative">
          <Show
            when={props.albumArtUrl}
            fallback={
              <div class="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                <Icon name="music-note" class="text-2xl text-muted-foreground" />
              </div>
            }
          >
            <img
              src={props.albumArtUrl}
              alt={props.title}
              class="w-16 h-16 rounded-xl object-cover"
            />
          </Show>
          <div class="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
            <Icon name="music-note" class="text-sm text-primary-foreground" weight="fill" />
          </div>
        </div>

        {/* Track info */}
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-primary uppercase tracking-wide">Now Playing</p>
          <p class="text-lg font-semibold text-foreground truncate">{props.title}</p>
          <p class="text-muted-foreground truncate">{props.artist}</p>
        </div>
      </div>

      {/* Progress bar (scrobbler-specific) */}
      <Show when={props.duration}>
        <div class="flex items-center gap-3 mt-4">
          <div class="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-primary rounded-full"
              style={{ width: `${progress()}%` }}
            />
          </div>
          <span class="text-muted-foreground tabular-nums">
            {formatDuration(props.position ?? 0)} / {formatDuration(props.duration!)}
          </span>
        </div>
      </Show>
    </section>
  )
}
