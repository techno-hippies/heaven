/**
 * CandidateCard - Profile card for swiping
 *
 * V0 simplified version showing:
 * - Avatar (anime/DiceBear)
 * - Display name
 * - Age bucket and gender (if available)
 * - Bio (if available)
 * - Like/Pass buttons
 */

import { Show, type Component } from 'solid-js'
import { cn } from '@/lib/utils'
import { Button } from '@/ui/button'
import type { CandidateProfile } from '../types'
import { AGE_BUCKET_LABELS, GENDER_LABELS } from '../types'

export interface CandidateCardProps {
  candidate: CandidateProfile
  onLike: () => void
  onPass: () => void
  isLoading?: boolean
  class?: string
}

export const CandidateCard: Component<CandidateCardProps> = (props) => {
  const candidate = () => props.candidate

  // Format badge text
  const badges = () => {
    const parts: string[] = []
    const c = candidate()
    if (c.ageBucket && AGE_BUCKET_LABELS[c.ageBucket]) {
      parts.push(AGE_BUCKET_LABELS[c.ageBucket])
    }
    if (c.genderIdentity && GENDER_LABELS[c.genderIdentity]) {
      parts.push(GENDER_LABELS[c.genderIdentity])
    }
    if (c.location) {
      parts.push(c.location)
    }
    return parts
  }

  // Mobile height: viewport minus footer and action buttons
  const mobileHeight = 'calc(100dvh - 8rem - env(safe-area-inset-bottom))'

  return (
    <div class={cn('bg-background text-foreground', props.class)}>
      <div
        class="flex flex-col lg:!h-auto lg:min-h-screen lg:flex-row lg:items-center lg:justify-center lg:p-12 lg:gap-12"
        style={{ height: mobileHeight }}
      >
        {/* Photo Section */}
        <div class="relative w-full lg:w-[420px] lg:flex-shrink-0 aspect-square lg:rounded-3xl overflow-hidden bg-secondary">
          <img
            src={candidate().avatarUrl}
            alt={candidate().displayName}
            class="w-full h-full object-cover"
            draggable={false}
          />

          {/* Gradient overlay */}
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

          {/* Name overlay - mobile only */}
          <div class="absolute bottom-0 left-0 right-0 p-6 lg:hidden pointer-events-none">
            <h1 class="text-3xl font-bold text-white">{candidate().displayName}</h1>
            <Show when={badges().length > 0}>
              <p class="text-lg text-white/70 mt-0.5">{badges().join(' · ')}</p>
            </Show>
          </div>
        </div>

        {/* Content - scrolls only when needed on mobile */}
        <div class="flex-1 min-h-0 overflow-y-auto lg:flex-initial lg:overflow-visible lg:max-w-md">
          {/* Desktop header */}
          <div class="hidden lg:block">
            <h1 class="text-4xl font-bold text-foreground">{candidate().displayName}</h1>
            <Show when={badges().length > 0}>
              <p class="text-xl text-muted-foreground mt-1">{badges().join(' · ')}</p>
            </Show>
          </div>

          {/* Content area */}
          <div class="px-6 py-6 lg:px-0 lg:pb-0 lg:mt-2">
            {/* Bio */}
            <Show when={candidate().bio}>
              <p class="text-lg leading-relaxed text-muted-foreground">{candidate().bio}</p>
            </Show>

            {/* Desktop Buttons */}
            <div class="hidden lg:flex gap-3 mt-8">
              <Button
                variant="secondary"
                size="xl"
                class="flex-1"
                onClick={props.onPass}
                disabled={props.isLoading}
              >
                Pass
              </Button>
              <Button
                variant="default"
                size="xl"
                class="flex-1"
                onClick={props.onLike}
                disabled={props.isLoading}
              >
                Like
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Buttons */}
      <div
        class="fixed left-0 right-0 backdrop-blur border-t border-border lg:hidden bg-background/95"
        style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
      >
        <div class="w-full max-w-lg mx-auto px-6 py-4 flex gap-3">
          <Button
            variant="secondary"
            size="xl"
            class="flex-1"
            onClick={props.onPass}
            disabled={props.isLoading}
          >
            Pass
          </Button>
          <Button
            variant="default"
            size="xl"
            class="flex-1"
            onClick={props.onLike}
            disabled={props.isLoading}
          >
            Like
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CandidateCard
