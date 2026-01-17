import { Component, createSignal, Show, onMount, createEffect } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { SwipeCard, type SwipeProfileData } from '@/components/swipe'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { useDirectory, type ProfileWithAddress } from '@/lib/contracts'

// Placeholder avatars for profiles without photos
const PLACEHOLDER_AVATARS = [
  '/avatars/sakura.svg',
  '/avatars/hiroshi.svg',
  '/avatars/sakura2.svg',
]

// Names to assign to profiles (based on index)
const PROFILE_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey',
  'Riley', 'Quinn', 'Avery', 'Parker', 'Skyler',
]

/**
 * Convert on-chain profile to SwipeProfileData
 * Note: Contract uses 0 = hidden, so we only pass non-zero values
 */
function toSwipeProfile(profile: ProfileWithAddress, index: number): SwipeProfileData & { datingInitialized: boolean } {
  const name = PROFILE_NAMES[index % PROFILE_NAMES.length]

  return {
    id: profile.address,
    name,
    username: `${name.toLowerCase()}.neodate`,
    photo: PLACEHOLDER_AVATARS[index % PLACEHOLDER_AVATARS.length],
    datingInitialized: profile.datingInitialized,
    // Cast to expected types - 0 means hidden so we use undefined
    ageBucket: profile.ageBucket ? profile.ageBucket as SwipeProfileData['ageBucket'] : undefined,
    genderIdentity: profile.genderIdentity ? profile.genderIdentity as SwipeProfileData['genderIdentity'] : undefined,
    lookingFor: profile.lookingFor ? profile.lookingFor as SwipeProfileData['lookingFor'] : undefined,
    bodyBucket: profile.bodyBucket ? profile.bodyBucket as SwipeProfileData['bodyBucket'] : undefined,
    fitnessBucket: profile.fitnessBucket ? profile.fitnessBucket as SwipeProfileData['fitnessBucket'] : undefined,
    smoking: profile.smoking ? profile.smoking as SwipeProfileData['smoking'] : undefined,
    drinking: profile.drinking ? profile.drinking as SwipeProfileData['drinking'] : undefined,
  }
}

type SwipeProfile = SwipeProfileData & { datingInitialized: boolean }

export const HomePage: Component = () => {
  const navigate = useNavigate()
  const auth = useAuth()
  const directory = useDirectory()
  const [currentIndex, setCurrentIndex] = createSignal(0)
  const [swipeProfiles, setSwipeProfiles] = createSignal<SwipeProfile[]>([])

  const isOnboarded = () => localStorage.getItem('neodate:onboarded') === 'true'
  const isReady = () => auth.isAuthenticated() && isOnboarded()

  // Load profiles from contract when ready
  onMount(() => {
    if (isReady()) {
      directory.loadProfiles(0, 20)
    }
  })

  // Convert contract profiles to swipe format, filtering to dating-initialized only
  createEffect(() => {
    const profiles = directory.profiles()
    if (profiles.length > 0) {
      // Only show profiles that have initialized their Dating contract profile
      const initialized = profiles.filter((p) => p.datingInitialized)
      setSwipeProfiles(initialized.map((p, i) => toSwipeProfile(p, i)))
    }
  })

  const currentProfile = () => swipeProfiles()[currentIndex()]
  const hasMore = () => currentIndex() < swipeProfiles().length

  // TODO: Check on-chain if they liked us
  const likedYou = () => false

  const handleLike = () => {
    const profile = currentProfile()
    if (profile) {
      console.log('Liked', profile.name, profile.id)
      // TODO: Call Dating.sendLike(profile.id)
    }
    setCurrentIndex((i) => i + 1)
  }

  const handlePass = () => {
    console.log('Passed', currentProfile()?.name)
    setCurrentIndex((i) => i + 1)
  }

  const handleGetStarted = () => {
    navigate('/onboarding')
  }

  const handleSignIn = () => {
    auth.openAuthDialog()
  }

  // Not ready - show welcome inline
  if (!isReady()) {
    return (
      <div class="min-h-screen bg-background flex flex-col">
        <div class="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div class="text-center">
            <img
              src="/images/neodate-logo-300x300.png"
              alt="neodate"
              class="w-32 h-32 mx-auto mb-6"
            />
            <h1 class="text-5xl font-bold text-foreground font-title">neodate</h1>
            <p class="text-xl text-muted-foreground mt-3 max-w-sm mx-auto">
              Blind dates from anonymous browsing.
            </p>
          </div>
        </div>

        <div class="px-6 pb-12">
          <div class="w-full max-w-md mx-auto space-y-3">
            <Button
              variant="default"
              size="xl"
              class="w-full"
              onClick={handleGetStarted}
            >
              Get started
            </Button>
            <Button
              variant="ghost"
              size="lg"
              class="w-full text-muted-foreground"
              onClick={handleSignIn}
            >
              I already have an account
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Ready - show profiles
  return (
    <Show
      when={!directory.loading()}
      fallback={
        <div class="min-h-screen bg-background flex items-center justify-center">
          <div class="text-center">
            <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p class="text-base text-muted-foreground">Loading profiles...</p>
          </div>
        </div>
      }
    >
      <Show
        when={hasMore()}
        fallback={
          <div class="min-h-screen bg-background flex items-center justify-center">
            <div class="text-center">
              <h2 class="text-2xl font-semibold text-foreground mb-2">No more profiles</h2>
              <p class="text-base text-muted-foreground">
                {directory.totalCount() === 0
                  ? 'No profiles yet. Be the first!'
                  : 'Check back later!'}
              </p>
              <Show when={directory.error()}>
                <p class="text-sm text-destructive mt-2">{directory.error()}</p>
              </Show>
            </div>
          </div>
        }
      >
        <SwipeCard
          profile={currentProfile()!}
          likedYou={likedYou()}
          onLike={handleLike}
          onPass={handlePass}
        />
      </Show>
    </Show>
  )
}

export default HomePage
