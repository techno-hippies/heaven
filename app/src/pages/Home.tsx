import { Component, createSignal, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { SwipeCard, type SwipeProfileData } from '@/components/swipe'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

// Mock profiles for development
const MOCK_PROFILES: SwipeProfileData[] = [
  {
    id: '0x1234...5678',
    name: 'Sakura',
    username: 'sakura.neodate',
    photo: '/avatars/sakura.svg',
    bio: 'Digital artist & coffee enthusiast. Looking for someone to explore new cafes with!',
    ageBucket: 2,
    biologicalSex: 1,
    nationality: 'JPN',
    genderIdentity: 2,
    lookingFor: 3,
    bodyBucket: 2,
    fitnessBucket: 3,
    smoking: 1,
    drinking: 2,
  },
  {
    id: '0x2345...6789',
    name: 'Alex',
    username: 'alex.neodate',
    photo: '/avatars/hiroshi.svg',
    bio: 'Software engineer by day, musician by night. Into hiking and board games.',
    ageBucket: 3,
    biologicalSex: 0,
    nationality: 'USA',
    genderIdentity: 1,
    lookingFor: 2,
    bodyBucket: 2,
    fitnessBucket: 4,
  },
  {
    id: '0x3456...7890',
    name: 'Nova',
    username: 'nova.neodate',
    photo: '/avatars/sakura2.svg',
    bio: 'Crypto native, art collector. Looking for meaningful connections.',
    ageBucket: 2,
    nationality: 'GBR',
    genderIdentity: 3,
    lookingFor: 3,
    kinkLevel: 3,
  },
]

export const HomePage: Component = () => {
  const navigate = useNavigate()
  const auth = useAuth()
  const [currentIndex, setCurrentIndex] = createSignal(0)

  const isOnboarded = () => localStorage.getItem('neodate:onboarded') === 'true'
  const isReady = () => auth.isAuthenticated() && isOnboarded()

  const currentProfile = () => MOCK_PROFILES[currentIndex()]
  const hasMore = () => currentIndex() < MOCK_PROFILES.length

  // Second profile liked us
  const likedYou = () => currentIndex() === 1

  const handleLike = () => {
    console.log('Liked', currentProfile()?.name)
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
      when={hasMore()}
      fallback={
        <div class="min-h-screen bg-background flex items-center justify-center">
          <div class="text-center">
            <h2 class="text-2xl font-semibold text-foreground mb-2">No more profiles</h2>
            <p class="text-base text-muted-foreground">Check back later!</p>
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
  )
}

export default HomePage
