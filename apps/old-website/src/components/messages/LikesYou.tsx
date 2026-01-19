/**
 * LikesYou - Horizontal scroll of users who liked you
 * Tinder-style "Likes You" section for messages page
 */

import { For, Show, type Component } from 'solid-js'
import { cn } from '@/lib/utils'

export interface LikeProfile {
  id: string
  name: string
  avatar: string
}

export interface LikesYouProps {
  likes: LikeProfile[]
  /** Callback when a profile is tapped */
  onSelect?: (id: string) => void
  class?: string
}

export const LikesYou: Component<LikesYouProps> = (props) => {
  return (
    <Show when={props.likes.length > 0}>
      <div class={cn('py-4', props.class)}>
        {/* Header */}
        <p class="px-5 mb-3 text-sm font-medium text-muted-foreground">
          Like Back
        </p>

        {/* Horizontal scroll */}
        <div class="flex gap-3 px-5 overflow-x-auto scrollbar-hide">
          <For each={props.likes}>
            {(like) => (
              <button
                type="button"
                onClick={() => props.onSelect?.(like.id)}
                class="flex-shrink-0"
              >
                <div class="w-16 h-16 rounded-xl overflow-hidden">
                  <img
                    src={like.avatar}
                    alt={like.name}
                    class="w-full h-full object-cover"
                  />
                </div>
              </button>
            )}
          </For>
        </div>
      </div>
    </Show>
  )
}

export default LikesYou
