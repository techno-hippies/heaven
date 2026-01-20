import { For, Show, type Component } from 'solid-js'
import { cn } from '@/lib/utils'
import { Avatar } from '@/ui/avatar'

export interface MatchProfile {
  id: string
  name: string
  avatar: string
  isNew?: boolean
}

export interface MatchesProps {
  matches: MatchProfile[]
  onSelect?: (id: string) => void
  class?: string
}

export const Matches: Component<MatchesProps> = (props) => {
  return (
    <Show when={props.matches.length > 0}>
      <div class={cn('py-4', props.class)}>
        <p class="px-5 mb-3 text-base font-medium text-muted-foreground">
          Matches
        </p>

        <div class="flex gap-3 px-5 overflow-x-auto scrollbar-hide">
          <For each={props.matches}>
            {(match) => (
              <button
                type="button"
                onClick={() => props.onSelect?.(match.id)}
                class="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div class="relative p-1">
                  <Avatar
                    src={match.avatar}
                    fallback={match.name}
                    size="xl"
                  />
                  <Show when={match.isNew}>
                    <span class="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary ring-2 ring-background" />
                  </Show>
                </div>
                <span class="text-sm text-foreground font-medium max-w-16 truncate">
                  {match.name}
                </span>
              </button>
            )}
          </For>
        </div>
      </div>
    </Show>
  )
}

export default Matches
