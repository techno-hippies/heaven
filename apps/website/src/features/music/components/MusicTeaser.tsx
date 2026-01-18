import type { Component } from 'solid-js'
import { For, Show } from 'solid-js'
import { Icon } from '@/icons'
import { cn } from '@/lib/utils'

export interface MusicTeaserArtist {
  name: string
  playCount?: number
}

export interface MusicTeaserProps {
  /** Top artists to display */
  topArtists?: MusicTeaserArtist[]
  /** Max artists to show (default: 3) */
  maxArtists?: number
  /** Total scrobbles count */
  scrobbles?: number
  /** Hours listened this week */
  hoursThisWeek?: number
  /** Click handler to navigate to music page */
  onClick?: () => void
  /** Additional class names */
  class?: string
}

const formatNumber = (n: number) => {
  return n.toLocaleString()
}

export const MusicTeaser: Component<MusicTeaserProps> = (props) => {
  const artists = () => props.topArtists?.slice(0, props.maxArtists ?? 3) ?? []
  const hasArtists = () => artists().length > 0

  const statsLine = () => {
    const parts: string[] = []
    if (props.scrobbles) {
      parts.push(`${formatNumber(props.scrobbles)} scrobbles`)
    }
    if (props.hoursThisWeek) {
      parts.push(`${props.hoursThisWeek} hrs this week`)
    }
    return parts.join(' · ')
  }

  return (
    <Show when={hasArtists()}>
      <button
        type="button"
        onClick={props.onClick}
        disabled={!props.onClick}
        class={cn(
          'w-full bg-card border border-border rounded-2xl p-6 text-left',
          props.onClick && 'cursor-pointer hover:bg-card/80 active:scale-[0.99] transition-all',
          props.class
        )}
      >
        {/* Stats line */}
        <Show when={statsLine()}>
          <p class="text-muted-foreground mb-4">{statsLine()}</p>
        </Show>

        {/* Artist list with trailing chevron on last row */}
        <div class="space-y-3">
          <For each={artists()}>
            {(artist, index) => (
              <div class="flex items-center gap-3">
                <span class="w-5 text-muted-foreground tabular-nums">{index() + 1}.</span>
                <span class="flex-1 text-lg text-foreground">{artist.name}</span>
                <Show when={index() === artists().length - 1 && props.onClick}>
                  <Icon name="caret-right" class="text-lg text-muted-foreground" />
                </Show>
              </div>
            )}
          </For>
        </div>
      </button>
    </Show>
  )
}

export default MusicTeaser
