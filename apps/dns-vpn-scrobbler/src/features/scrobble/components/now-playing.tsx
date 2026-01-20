import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { cn } from '@/lib/utils'
import { Icon } from '@/icons'

export interface NowPlayingProps {
  title: string
  artist: string
  albumArtUrl?: string
  isPlaying?: boolean
  class?: string
}

export const NowPlaying: Component<NowPlayingProps> = (props) => {
  return (
    <section class={cn('bg-card border border-border rounded-2xl p-4', props.class)}>
      <div class="flex items-center gap-4">
        {/* Album art */}
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

        {/* Track info */}
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <Icon
              name={props.isPlaying ? 'play' : 'pause'}
              weight="fill"
              class="text-sm text-primary"
            />
            <p class="text-sm font-medium text-primary uppercase tracking-wide">
              {props.isPlaying ? 'Playing' : 'Paused'}
            </p>
          </div>
          <p class="text-lg font-semibold text-foreground truncate">{props.title}</p>
          <p class="text-muted-foreground truncate">{props.artist}</p>
        </div>
      </div>
    </section>
  )
}
