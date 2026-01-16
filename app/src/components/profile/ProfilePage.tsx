import { Component, For, Show, createSignal } from 'solid-js'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  ProfileBadge,
  type AgeBucket,
  type GenderIdentity,
  type LookingFor,
  AGE_BUCKET_LABELS,
  GENDER_IDENTITY_LABELS,
  LOOKING_FOR_LABELS,
} from './ProfileBadge'

export interface ProfilePageData {
  /** Wallet address / ID */
  id: string
  /** Display name */
  name: string
  /** Username / domain e.g., "sakura.neodate" */
  username: string
  /** First photo is anime avatar (animeCid), rest are additional */
  photos: string[]
  /** Bio text (off-chain) */
  bio?: string

  // === ATTESTED FIELDS (from Self.xyz passport - everyone has these) ===
  /** Age bucket: 0=hidden, 1=18-24, 2=25-29, 3=30-34, 4=35-39, 5=40-49, 6=50+ (attested from passport) */
  ageBucket: AgeBucket

  // === USER-SET PUBLIC FIELDS ===
  /** Region bucket (0=hidden) */
  regionBucket?: number
  /** Gender identity: 0=hidden, 1=man, 2=woman, 3=non-binary, etc. */
  genderIdentity: GenderIdentity
  /** Body type bucket (0=hidden) */
  bodyBucket?: number
  /** Fitness bucket (0=hidden) */
  fitnessBucket?: number

  // === LIFESTYLE (public optional, 0=hidden) ===
  /** Smoking: 0=hidden, 1=never, 2=sometimes, 3=regularly */
  smoking?: number
  /** Drinking: 0=hidden, 1=never, 2=socially, 3=regularly */
  drinking?: number
  /** Looking for: 0=hidden, 1=casual, 2=dating, 3=relationship, 4=marriage */
  lookingFor: LookingFor
}

export interface ProfilePageProps {
  profile: ProfilePageData
  /** Is this the current user's own profile? */
  isOwnProfile?: boolean
  onMessage?: () => void
  onFollow?: () => void
  onEdit?: () => void
  class?: string
}

export const ProfilePage: Component<ProfilePageProps> = (props) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = createSignal(0)

  const photos = () => props.profile.photos
  const currentPhoto = () => photos()[currentPhotoIndex()] || photos()[0]

  const nextPhoto = () => {
    if (currentPhotoIndex() < photos().length - 1) {
      setCurrentPhotoIndex(i => i + 1)
    }
  }

  const prevPhoto = () => {
    if (currentPhotoIndex() > 0) {
      setCurrentPhotoIndex(i => i - 1)
    }
  }

  return (
    <div class={cn('min-h-screen bg-background text-foreground', props.class)}>
      {/* Desktop: side by side, vertically centered / Mobile: stacked */}
      <div class="min-h-screen flex flex-col lg:flex-row lg:items-center lg:justify-center lg:p-12 lg:gap-12">

        {/* Photo Section */}
        <div class="relative w-full lg:w-[420px] lg:flex-shrink-0 aspect-square lg:rounded-3xl overflow-hidden bg-secondary">
          {/* Photo indicators */}
          <Show when={photos().length > 1}>
            <div class="absolute top-4 left-4 right-4 z-20 flex gap-1">
              <For each={photos()}>
                {(_, index) => (
                  <div
                    class={cn(
                      'flex-1 h-1 rounded-full transition-all',
                      index() === currentPhotoIndex()
                        ? 'bg-white'
                        : 'bg-white/40'
                    )}
                  />
                )}
              </For>
            </div>
          </Show>

          {/* Photo */}
          <img
            src={currentPhoto()}
            alt={props.profile.name}
            class="w-full h-full object-cover"
            draggable={false}
          />

          {/* Photo navigation areas */}
          <Show when={photos().length > 1}>
            <button
              class="absolute left-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
              onClick={prevPhoto}
              aria-label="Previous photo"
            />
            <button
              class="absolute right-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
              onClick={nextPhoto}
              aria-label="Next photo"
            />
          </Show>

          {/* Gradient overlay */}
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

          {/* Basic info overlay - mobile only */}
          <div class="absolute bottom-0 left-0 right-0 p-6 lg:hidden pointer-events-none">
            <h1 class="text-3xl font-bold text-white">
              {props.profile.name}
            </h1>
            <p class="text-lg text-white/70 mt-0.5">{props.profile.username}</p>
          </div>
        </div>

        {/* Content */}
        <div class="flex-1 lg:max-w-md">
          {/* Desktop header */}
          <div class="hidden lg:block">
            <h1 class="text-4xl font-bold text-foreground">
              {props.profile.name}
            </h1>
            <p class="text-xl text-muted-foreground mt-1">{props.profile.username}</p>
          </div>

          {/* Content area */}
          <div class="px-6 py-6 pb-28 lg:px-0 lg:pb-0 lg:mt-2">
            {/* Bio */}
            <Show when={props.profile.bio}>
              <p class="text-lg leading-relaxed text-muted-foreground">
                {props.profile.bio}
              </p>
            </Show>

            {/* 2-col field grid */}
            <div class={cn('grid grid-cols-2 gap-x-8 gap-y-3', props.profile.bio ? 'mt-4' : '')}>
              <Show when={props.profile.ageBucket && props.profile.ageBucket > 0}>
                <ProfileBadge category="Age" value={AGE_BUCKET_LABELS[props.profile.ageBucket]} attested />
              </Show>
              <Show when={props.profile.genderIdentity && props.profile.genderIdentity > 0}>
                <ProfileBadge category="Gender" value={GENDER_IDENTITY_LABELS[props.profile.genderIdentity]} />
              </Show>
              <Show when={props.profile.lookingFor && props.profile.lookingFor > 0}>
                <ProfileBadge category="Looking for" value={LOOKING_FOR_LABELS[props.profile.lookingFor]} />
              </Show>
            </div>

            {/* Desktop Buttons */}
            <div class="hidden lg:flex gap-3 mt-8">
              <Show
                when={props.isOwnProfile}
                fallback={
                  <>
                    <Button
                      variant="secondary"
                      size="xl"
                      class="flex-1"
                      onClick={props.onFollow}
                    >
                      Follow
                    </Button>
                    <Button
                      variant="default"
                      size="xl"
                      class="flex-1"
                      onClick={props.onMessage}
                    >
                      Message
                    </Button>
                  </>
                }
              >
                <Button
                  variant="secondary"
                  size="xl"
                  class="flex-1"
                  onClick={props.onEdit}
                >
                  <Icon name="pencil" class="text-xl" />
                  Edit Profile
                </Button>
              </Show>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Buttons */}
      <div class="fixed bottom-0 left-0 right-0 backdrop-blur border-t border-border lg:hidden bg-background/95">
        <div class="w-full max-w-lg mx-auto px-6 py-4 flex gap-3">
          <Show
            when={props.isOwnProfile}
            fallback={
              <>
                <Button
                  variant="secondary"
                  size="xl"
                  class="flex-1"
                  onClick={props.onFollow}
                >
                  Follow
                </Button>
                <Button
                  variant="default"
                  size="xl"
                  class="flex-1"
                  onClick={props.onMessage}
                >
                  Message
                </Button>
              </>
            }
          >
            <Button
              variant="secondary"
              size="xl"
              class="flex-1"
              onClick={props.onEdit}
            >
              <Icon name="pencil" class="text-xl" />
              Edit Profile
            </Button>
          </Show>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
