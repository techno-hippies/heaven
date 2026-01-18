import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { Avatar } from '@/ui/avatar'
import { cn } from '@/lib/utils'

export interface TrackRowProps {
  /** Track title */
  title: string
  /** Artist name */
  artist: string
  /** Album name */
  album?: string
  /** Album art URL */
  albumArtUrl?: string
  /** Relative timestamp (e.g. "2 hours ago") */
  timestamp?: string
  /** Click handler */
  onClick?: () => void
  /** Additional class names */
  class?: string
}

export const TrackRow: Component<TrackRowProps> = (props) => {
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
      {/* Album art */}
      <Avatar
        src={props.albumArtUrl}
        fallback={props.title}
        size="lg"
        class="rounded-lg"
      />

      {/* Content */}
      <div class="flex-1 min-w-0">
        <p class="truncate font-medium text-foreground">{props.title}</p>
        <p class="truncate text-sm text-muted-foreground">
          {props.artist}
          <Show when={props.timestamp}>
            <span> · {props.timestamp}</span>
          </Show>
        </p>
      </div>
    </button>
  )
}

export default TrackRow
