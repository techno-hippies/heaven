import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal, For, Show } from 'solid-js'
import { SwipeCard, SwipeCardEmpty } from './SwipeCard'
import type { ProfileData } from './ProfileCard'

const meta = {
  title: 'Dating/SwipeCard',
  component: SwipeCard,
  tags: ['autodocs'],
} satisfies Meta<typeof SwipeCard>

export default meta
type Story = StoryObj<typeof meta>

const profiles: ProfileData[] = [
  {
    id: '1',
    name: 'Alex',
    age: 28,
    location: 'San Francisco',
    bio: 'Coffee enthusiast, hiking lover, and amateur chef. Looking for someone to explore the city with.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
    verified: true,
    verificationLevel: 'id',
    tags: ['Coffee', 'Hiking', 'Travel', 'Dogs'],
    compatibility: 87,
  },
  {
    id: '2',
    name: 'Jordan',
    age: 32,
    location: 'Oakland',
    bio: "Tech nerd by day, vinyl collector by night. Let's grab dinner and talk about nothing.",
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
    verified: true,
    verificationLevel: 'photo',
    tags: ['Music', 'Tech', 'Food', 'Wine'],
    compatibility: 72,
  },
  {
    id: '3',
    name: 'Sam',
    age: 26,
    location: 'Berkeley',
    bio: 'Yoga instructor and plant parent. Seeking genuine connections.',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop',
    verified: true,
    verificationLevel: 'basic',
    tags: ['Yoga', 'Plants', 'Meditation'],
    compatibility: 65,
  },
]

export const Default: Story = {
  args: {
    profile: profiles[0],
    onLike: () => console.log('Liked!'),
    onPass: () => console.log('Passed!'),
    onSuperlike: () => console.log('Superliked!'),
  },
}

export const Interactive: Story = {
  render: () => {
    const [currentIndex, setCurrentIndex] = createSignal(0)
    const [action, setAction] = createSignal<string | null>(null)

    const currentProfile = () => profiles[currentIndex()]

    const handleAction = (type: string) => {
      setAction(type)
      setTimeout(() => {
        setAction(null)
        setCurrentIndex((i) => i + 1)
      }, 400)
    }

    return (
      <div class="space-y-4">
        <Show when={action()}>
          <div class="text-center text-sm text-muted-foreground">
            You {action()}ed {profiles[currentIndex()]?.name}!
          </div>
        </Show>

        <Show when={currentProfile()} fallback={<SwipeCardEmpty />}>
          <SwipeCard
            profile={currentProfile()}
            onLike={() => handleAction('like')}
            onPass={() => handleAction('pass')}
            onSuperlike={() => handleAction('superlike')}
          />
        </Show>

        <div class="text-center text-xs text-muted-foreground">
          {currentIndex()} / {profiles.length} profiles viewed
        </div>
      </div>
    )
  },
}

export const Empty: Story = {
  render: () => <SwipeCardEmpty />,
}

export const WithDetails: Story = {
  args: {
    profile: profiles[0],
    onDetailsClick: () => alert('Show profile details'),
  },
}

export const SwipeDemo: Story = {
  render: () => (
    <div class="space-y-8">
      <div class="text-center space-y-2">
        <h3 class="font-semibold">Swipe Actions</h3>
        <p class="text-sm text-muted-foreground">
          Use the buttons below to like, pass, or superlike
        </p>
      </div>
      <SwipeCard
        profile={profiles[0]}
        onLike={() => console.log('Like')}
        onPass={() => console.log('Pass')}
        onSuperlike={() => console.log('Superlike')}
      />
    </div>
  ),
}
