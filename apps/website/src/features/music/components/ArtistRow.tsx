import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { Avatar } from '@/ui/avatar'
import { cn } from '@/lib/utils'

export interface ArtistRowProps {
  /** Artist name */
  name: string
  /** Artist image URL */
  imageUrl?: string
  /** Rank number (1-based) */
  rank?: number
  /** Play count */
  playCount?: number
  /** Click handler */
  onClick?: () => void
  /** Additional class names */
  class?: string
}

export const ArtistRow: Component<ArtistRowProps> = (props) => {
  return (
    <button
      type="button"
      onClick={props.onClick}
      class={cn(
        'flex items-center gap-3 bg-muted/50 rounded-lg p-3 text-left w-full',
        'transition-all duration-200',
        props.onClick && 'cursor-pointer hover:bg-muted active:scale-[0.98]',
        !props.onClick && 'cursor-default',
        props.class
      )}
    >
      {/* Rank */}
      <Show when={props.rank !== undefined}>
        <span class="w-5 text-sm font-medium text-muted-foreground tabular-nums">
          {props.rank}
        </span>
      </Show>

      {/* Artist image */}
      <Avatar
        src={props.imageUrl}
        fallback={props.name}
        size="lg"
      />

      {/* Name */}
      <span class="flex-1 truncate font-medium text-foreground">
        {props.name}
      </span>

      {/* Play count */}
      <Show when={props.playCount !== undefined}>
        <span class="text-sm text-muted-foreground tabular-nums">
          {props.playCount} {props.playCount === 1 ? 'play' : 'plays'}
        </span>
      </Show>
    </button>
  )
}

export default ArtistRow
