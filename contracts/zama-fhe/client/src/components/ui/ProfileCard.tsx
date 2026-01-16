import { type JSX, Show, For } from 'solid-js'
import { cn } from '@/lib/utils'
import { Badge, VerifiedBadge } from './Badge'

export interface ProfileData {
  id: string
  name: string
  age?: number
  ageRange?: string // e.g., "25-30"
  location?: string
  bio?: string
  avatarUrl: string
  verified?: boolean
  verificationLevel?: 'basic' | 'photo' | 'id'
  tags?: string[]
  compatibility?: number // 0-100
}

export interface ProfileCardProps {
  profile: ProfileData
  variant?: 'compact' | 'full' | 'mini'
  showActions?: boolean
  onLike?: () => void
  onPass?: () => void
  onSuperlike?: () => void
  class?: string
}

export function ProfileCard(props: ProfileCardProps) {
  const variant = () => props.variant ?? 'full'

  return (
    <div
      class={cn(
        'relative overflow-hidden rounded-2xl bg-card',
        variant() === 'mini' && 'w-24',
        variant() === 'compact' && 'w-full max-w-sm',
        variant() === 'full' && 'w-full max-w-sm',
        props.class
      )}
    >
      {/* Image */}
      <div
        class={cn(
          'relative overflow-hidden bg-muted',
          variant() === 'mini' && 'aspect-square',
          variant() === 'compact' && 'aspect-[4/5]',
          variant() === 'full' && 'aspect-[3/4]'
        )}
      >
        <img
          src={props.profile.avatarUrl}
          alt={props.profile.name}
          class="h-full w-full object-cover"
        />

        {/* Gradient overlay */}
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Verified badge */}
        <Show when={props.profile.verified && variant() !== 'mini'}>
          <div class="absolute top-3 right-3">
            <VerifiedBadge level={props.profile.verificationLevel} />
          </div>
        </Show>

        {/* Compatibility score */}
        <Show when={props.profile.compatibility && variant() === 'full'}>
          <div class="absolute top-3 left-3">
            <div class="flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
              <div
                class={cn(
                  'h-2 w-2 rounded-full',
                  props.profile.compatibility! >= 80 && 'bg-success',
                  props.profile.compatibility! >= 50 && props.profile.compatibility! < 80 && 'bg-warning',
                  props.profile.compatibility! < 50 && 'bg-muted-foreground'
                )}
              />
              <span class="text-xs font-medium text-white">
                {props.profile.compatibility}% match
              </span>
            </div>
          </div>
        </Show>

        {/* Basic info overlay */}
        <div class="absolute bottom-0 left-0 right-0 p-4">
          <Show when={variant() !== 'mini'}>
            <div class="space-y-2">
              <h2 class="text-xl font-bold text-white">
                {props.profile.name}
                <Show when={props.profile.age || props.profile.ageRange}>
                  <span class="font-normal text-white/80">
                    , {props.profile.age ?? props.profile.ageRange}
                  </span>
                </Show>
              </h2>

              <Show when={props.profile.location}>
                <div class="flex items-center gap-1 text-sm text-white/70">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {props.profile.location}
                </div>
              </Show>

              <Show when={props.profile.bio && variant() === 'full'}>
                <p class="text-sm text-white/80 line-clamp-2">{props.profile.bio}</p>
              </Show>

              <Show when={props.profile.tags && props.profile.tags.length > 0}>
                <div class="flex flex-wrap gap-1.5 pt-1">
                  <For each={props.profile.tags?.slice(0, 4)}>
                    {(tag) => (
                      <Badge variant="muted" size="sm" class="bg-white/20 text-white">
                        {tag}
                      </Badge>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </div>

      {/* Mini variant name */}
      <Show when={variant() === 'mini'}>
        <div class="p-2 text-center">
          <p class="text-xs font-medium truncate">{props.profile.name}</p>
        </div>
      </Show>
    </div>
  )
}

// Skeleton loading state
export function ProfileCardSkeleton(props: { variant?: 'compact' | 'full' | 'mini' }) {
  const variant = () => props.variant ?? 'full'

  return (
    <div
      class={cn(
        'overflow-hidden rounded-2xl bg-card',
        variant() === 'mini' && 'w-24',
        variant() === 'compact' && 'w-full max-w-sm',
        variant() === 'full' && 'w-full max-w-sm'
      )}
    >
      <div
        class={cn(
          'shimmer',
          variant() === 'mini' && 'aspect-square',
          variant() === 'compact' && 'aspect-[4/5]',
          variant() === 'full' && 'aspect-[3/4]'
        )}
      />
      <Show when={variant() === 'mini'}>
        <div class="p-2">
          <div class="shimmer h-3 w-16 mx-auto rounded" />
        </div>
      </Show>
    </div>
  )
}
