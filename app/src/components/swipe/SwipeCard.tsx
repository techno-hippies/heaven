import { Component, Show } from 'solid-js'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ProfileBadge } from '@/components/profile/ProfileBadge'

import type {
  AgeBucket,
  BiologicalSex,
  GenderIdentity,
  LookingFor,
  Smoking,
  Drinking,
  BodyBucket,
  FitnessBucket,
  Kids,
  KidsTimeline,
  RelationshipStructure,
  Religion,
  KinkLevel,
  IncomeRange,
} from '@/components/profile/ProfileBadge'

import {
  AGE_BUCKET_LABELS,
  BIOLOGICAL_SEX_LABELS,
  NATIONALITY_LABELS,
  GENDER_IDENTITY_LABELS,
  LOOKING_FOR_LABELS,
  SMOKING_LABELS,
  DRINKING_LABELS,
  BODY_BUCKET_LABELS,
  FITNESS_BUCKET_LABELS,
  KIDS_LABELS,
  KIDS_TIMELINE_LABELS,
  RELATIONSHIP_STRUCTURE_LABELS,
  RELIGION_LABELS,
  KINK_LEVEL_LABELS,
  INCOME_RANGE_LABELS,
} from '@/components/profile/ProfileBadge'

export interface SwipeProfileData {
  id: string
  name: string
  username: string
  photo: string
  bio?: string

  // Attested (from passport)
  ageBucket?: AgeBucket
  biologicalSex?: BiologicalSex
  nationality?: string

  // Public user-set
  genderIdentity?: GenderIdentity
  lookingFor?: LookingFor
  bodyBucket?: BodyBucket
  fitnessBucket?: FitnessBucket
  smoking?: Smoking
  drinking?: Drinking

  // Optional public
  kids?: Kids
  kidsTimeline?: KidsTimeline
  relationshipStructure?: RelationshipStructure
  religion?: Religion
  kinkLevel?: KinkLevel
  incomeRange?: IncomeRange
}

export interface SwipeCardProps {
  profile: SwipeProfileData
  /** They already liked us (public on-chain) */
  likedYou?: boolean
  onLike?: () => void
  onPass?: () => void
  class?: string
}

export const SwipeCard: Component<SwipeCardProps> = (props) => {
  const profile = () => props.profile

  // Mobile: viewport minus footer (4rem) and action buttons (4rem) and safe area
  const mobileHeight = 'calc(100dvh - 8rem - env(safe-area-inset-bottom))'

  return (
    <div class={cn('bg-background text-foreground', props.class)}>
      {/* Mobile: fixed height / Desktop: natural flow */}
      <div
        class="flex flex-col lg:!h-auto lg:min-h-screen lg:flex-row lg:items-center lg:justify-center lg:p-12 lg:gap-12"
        style={{ height: mobileHeight }}
      >
        {/* Photo Section */}
        <div class="relative w-full lg:w-[420px] lg:flex-shrink-0 aspect-square lg:rounded-3xl overflow-hidden bg-secondary">
          {/* Photo */}
          <img
            src={profile().photo}
            alt={profile().name}
            class="w-full h-full object-cover"
            draggable={false}
          />

          {/* Gradient overlay */}
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

          {/* Name overlay - mobile only */}
          <div class="absolute bottom-0 left-0 right-0 p-6 lg:hidden pointer-events-none">
            <h1 class="text-3xl font-bold text-white">{profile().name}</h1>
            <p class="text-lg text-white/70 mt-0.5">{profile().username}</p>
          </div>
        </div>

        {/* Content - scrolls only when needed on mobile */}
        <div class="flex-1 min-h-0 overflow-y-auto lg:flex-initial lg:overflow-visible lg:max-w-md">
          {/* Desktop header */}
          <div class="hidden lg:block">
            <h1 class="text-4xl font-bold text-foreground">{profile().name}</h1>
            <p class="text-xl text-muted-foreground mt-1">{profile().username}</p>
          </div>

          {/* Content area */}
          <div class="px-6 py-6 lg:px-0 lg:pb-0 lg:mt-2">
            {/* Bio */}
            <Show when={profile().bio}>
              <p class="text-lg leading-relaxed text-muted-foreground">
                {profile().bio}
              </p>
            </Show>

            {/* 2-col field grid */}
            <div class={cn('grid grid-cols-2 gap-x-8 gap-y-3', profile().bio ? 'mt-4' : '')}>
              <Show when={profile().ageBucket}>
                <ProfileBadge category="Age" value={AGE_BUCKET_LABELS[profile().ageBucket!]} attested />
              </Show>
              <Show when={profile().biologicalSex !== undefined}>
                <ProfileBadge category="Sex" value={BIOLOGICAL_SEX_LABELS[profile().biologicalSex!]} attested />
              </Show>
              <Show when={profile().nationality}>
                <ProfileBadge category="Nationality" value={NATIONALITY_LABELS[profile().nationality!] || profile().nationality!} attested />
              </Show>
              <Show when={profile().genderIdentity}>
                <ProfileBadge category="Gender" value={GENDER_IDENTITY_LABELS[profile().genderIdentity!]} />
              </Show>
              <Show when={profile().lookingFor}>
                <ProfileBadge category="Seeking" value={LOOKING_FOR_LABELS[profile().lookingFor!]} />
              </Show>
              <Show when={profile().bodyBucket}>
                <ProfileBadge category="Body" value={BODY_BUCKET_LABELS[profile().bodyBucket!]} />
              </Show>
              <Show when={profile().fitnessBucket}>
                <ProfileBadge category="Fitness" value={FITNESS_BUCKET_LABELS[profile().fitnessBucket!]} />
              </Show>
              <Show when={profile().smoking}>
                <ProfileBadge category="Smoking" value={SMOKING_LABELS[profile().smoking!]} />
              </Show>
              <Show when={profile().drinking}>
                <ProfileBadge category="Drinking" value={DRINKING_LABELS[profile().drinking!]} />
              </Show>
              <Show when={profile().kids}>
                <ProfileBadge category="Kids" value={KIDS_LABELS[profile().kids!]} />
              </Show>
              <Show when={profile().kidsTimeline}>
                <ProfileBadge category="Kids timeline" value={KIDS_TIMELINE_LABELS[profile().kidsTimeline!]} />
              </Show>
              <Show when={profile().relationshipStructure}>
                <ProfileBadge category="Relationship" value={RELATIONSHIP_STRUCTURE_LABELS[profile().relationshipStructure!]} />
              </Show>
              <Show when={profile().religion}>
                <ProfileBadge category="Religion" value={RELIGION_LABELS[profile().religion!]} />
              </Show>
              <Show when={profile().kinkLevel}>
                <ProfileBadge category="Kink" value={KINK_LEVEL_LABELS[profile().kinkLevel!]} />
              </Show>
              <Show when={profile().incomeRange}>
                <ProfileBadge category="Income" value={INCOME_RANGE_LABELS[profile().incomeRange!]} />
              </Show>
            </div>

            {/* Desktop Buttons */}
            <div class="hidden lg:flex gap-3 mt-8">
              <Button variant="secondary" size="xl" class="flex-1" onClick={props.onPass}>
                Pass
              </Button>
              <Button variant="default" size="xl" class="flex-1" onClick={props.onLike}>
                {props.likedYou ? 'Like Back' : 'Like'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Buttons - positioned above MobileFooter (h-16 = 64px) */}
      <div
        class="fixed left-0 right-0 backdrop-blur border-t border-border lg:hidden bg-background/95"
        style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
      >
        <div class="w-full max-w-lg mx-auto px-6 py-4 flex gap-3">
          <Button variant="secondary" size="xl" class="flex-1" onClick={props.onPass}>
            Pass
          </Button>
          <Button variant="default" size="xl" class="flex-1" onClick={props.onLike}>
            {props.likedYou ? 'Like Back' : 'Like'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SwipeCard
