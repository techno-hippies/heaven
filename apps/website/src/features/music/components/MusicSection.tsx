import type { Component } from 'solid-js'
import { For, Show } from 'solid-js'
import { Icon } from '@/icons'
import { cn } from '@/lib/utils'
import { ArtistRow, type ArtistRowProps } from './ArtistRow'
import { TrackRow, type TrackRowProps } from './TrackRow'

export interface MusicSectionProps {
  /** Top artists list */
  topArtists?: Omit<ArtistRowProps, 'rank'>[]
  /** Recent tracks list */
  recentTracks?: TrackRowProps[]
  /** Max artists to show (default: 5) */
  maxArtists?: number
  /** Max tracks to show (default: 5) */
  maxTracks?: number
  /** Click handler for artists */
  onArtistClick?: (artist: Omit<ArtistRowProps, 'rank'>) => void
  /** Click handler for tracks */
  onTrackClick?: (track: TrackRowProps) => void
  /** Additional class names */
  class?: string
}

export const MusicSection: Component<MusicSectionProps> = (props) => {
  const artists = () => props.topArtists?.slice(0, props.maxArtists ?? 5) ?? []
  const tracks = () => props.recentTracks?.slice(0, props.maxTracks ?? 5) ?? []
  const hasData = () => artists().length > 0 || tracks().length > 0
  const hasBoth = () => artists().length > 0 && tracks().length > 0

  return (
    <div class={cn('bg-card border border-border rounded-2xl p-6', props.class)}>
      <Show when={hasData()} fallback={
        <div class="py-8 text-center">
          <Icon name="music-note" class="text-3xl text-muted-foreground mx-auto mb-2" />
          <p class="text-muted-foreground">No music data yet</p>
        </div>
      }>
        <div class={cn(
          'grid gap-6',
          hasBoth() && 'md:grid-cols-2'
        )}>
          {/* Top Artists */}
          <Show when={artists().length > 0}>
            <section class="space-y-3">
              <p class="text-muted-foreground">Top Artists</p>
              <div class="space-y-2">
                <For each={artists()}>
                  {(artist, index) => (
                    <ArtistRow
                      {...artist}
                      rank={index() + 1}
                      onClick={props.onArtistClick ? () => props.onArtistClick?.(artist) : undefined}
                    />
                  )}
                </For>
              </div>
            </section>
          </Show>

          {/* Recent Tracks */}
          <Show when={tracks().length > 0}>
            <section class="space-y-3">
              <p class="text-muted-foreground">Recently Played</p>
              <div class="space-y-2">
                <For each={tracks()}>
                  {(track) => (
                    <TrackRow
                      {...track}
                      onClick={props.onTrackClick ? () => props.onTrackClick?.(track) : undefined}
                    />
                  )}
                </For>
              </div>
            </section>
          </Show>
        </div>
      </Show>
    </div>
  )
}

export default MusicSection
