import { type JSX, Show, createSignal, createEffect, onMount } from 'solid-js'
import { cn } from '@/lib/utils'
import { ProfileCard, type ProfileData } from './ProfileCard'
import { Button } from './Button'

export interface SwipeCardProps {
  profile: ProfileData
  onLike?: () => void
  onPass?: () => void
  onSuperlike?: () => void
  onDetailsClick?: () => void
  class?: string
}

export function SwipeCard(props: SwipeCardProps) {
  const [isDragging, setIsDragging] = createSignal(false)
  const [dragX, setDragX] = createSignal(0)
  const [dragY, setDragY] = createSignal(0)
  const [swipeDirection, setSwipeDirection] = createSignal<'left' | 'right' | 'up' | null>(null)

  const SWIPE_THRESHOLD = 100
  const ROTATION_FACTOR = 0.1

  const rotation = () => dragX() * ROTATION_FACTOR
  const opacity = () => Math.min(Math.abs(dragX()) / SWIPE_THRESHOLD, 1)

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    setSwipeDirection(direction)
    setTimeout(() => {
      if (direction === 'right') props.onLike?.()
      else if (direction === 'left') props.onPass?.()
      else if (direction === 'up') props.onSuperlike?.()
      setSwipeDirection(null)
      setDragX(0)
      setDragY(0)
    }, 300)
  }

  return (
    <div class={cn('relative w-full max-w-sm', props.class)}>
      {/* Swipe indicators */}
      <div
        class={cn(
          'absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-4 transition-opacity pointer-events-none',
          'border-like bg-like/10',
          dragX() > 20 ? 'opacity-100' : 'opacity-0'
        )}
        style={{ opacity: dragX() > 0 ? opacity() : 0 }}
      >
        <span class="text-4xl font-bold text-like rotate-[-20deg]">LIKE</span>
      </div>
      <div
        class={cn(
          'absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-4 transition-opacity pointer-events-none',
          'border-pass bg-pass/10',
          dragX() < -20 ? 'opacity-100' : 'opacity-0'
        )}
        style={{ opacity: dragX() < 0 ? opacity() : 0 }}
      >
        <span class="text-4xl font-bold text-pass rotate-[20deg]">NOPE</span>
      </div>
      <div
        class={cn(
          'absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-4 transition-opacity pointer-events-none',
          'border-superlike bg-superlike/10',
          dragY() < -20 ? 'opacity-100' : 'opacity-0'
        )}
        style={{ opacity: dragY() < 0 ? Math.min(Math.abs(dragY()) / SWIPE_THRESHOLD, 1) : 0 }}
      >
        <span class="text-4xl font-bold text-superlike">SUPER</span>
      </div>

      {/* Card */}
      <div
        class={cn(
          'relative transition-transform',
          swipeDirection() === 'left' && 'animate-swipe-left',
          swipeDirection() === 'right' && 'animate-swipe-right',
          swipeDirection() === 'up' && 'animate-swipe-up'
        )}
        style={{
          transform: !swipeDirection()
            ? `translateX(${dragX()}px) translateY(${dragY()}px) rotate(${rotation()}deg)`
            : undefined,
        }}
      >
        <ProfileCard profile={props.profile} variant="full" />

        {/* Info button */}
        <button
          onClick={props.onDetailsClick}
          class="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>

      {/* Action buttons */}
      <div class="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="pass"
          size="icon-xl"
          rounded="full"
          onClick={() => handleSwipe('left')}
          class="shadow-lg hover:shadow-xl"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>

        <Button
          variant="superlike"
          size="icon-lg"
          rounded="full"
          onClick={() => handleSwipe('up')}
          class="shadow-lg hover:shadow-xl"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </Button>

        <Button
          variant="like"
          size="icon-xl"
          rounded="full"
          onClick={() => handleSwipe('right')}
          class="shadow-lg hover:shadow-xl hover:shadow-like/30"
        >
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </Button>
      </div>

      <style>{`
        @keyframes swipe-left {
          to {
            transform: translateX(-150%) rotate(-30deg);
            opacity: 0;
          }
        }
        @keyframes swipe-right {
          to {
            transform: translateX(150%) rotate(30deg);
            opacity: 0;
          }
        }
        @keyframes swipe-up {
          to {
            transform: translateY(-150%);
            opacity: 0;
          }
        }
        .animate-swipe-left {
          animation: swipe-left 0.3s ease-out forwards;
        }
        .animate-swipe-right {
          animation: swipe-right 0.3s ease-out forwards;
        }
        .animate-swipe-up {
          animation: swipe-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

// Empty state when no more profiles
export function SwipeCardEmpty() {
  return (
    <div class="w-full max-w-sm aspect-[3/4] rounded-2xl bg-card border border-border flex flex-col items-center justify-center p-8 text-center">
      <div class="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <svg class="h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </div>
      <h3 class="text-lg font-semibold mb-2">No more profiles</h3>
      <p class="text-sm text-muted-foreground">
        Check back later for new matches or adjust your preferences
      </p>
    </div>
  )
}
