import type { Meta, StoryObj } from 'storybook-solidjs'
import { ProfilePage, type ProfilePageData } from './ProfilePage'
import { ProfileBadge } from './ProfileBadge'

const meta: Meta<typeof ProfilePage> = {
  title: 'Profile/ProfilePage',
  component: ProfilePage,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ProfilePage>

const baseProfile: ProfilePageData = {
  id: '0x1234...5678',
  name: 'Sakura',
  username: 'sakura.neodate',
  bio: 'Digital artist and anime enthusiast. Love exploring coffee shops and finding new music.',
  photos: [
    'https://api.dicebear.com/9.x/notionists/svg?seed=sakura&backgroundColor=ffdfbf',
    'https://api.dicebear.com/9.x/notionists/svg?seed=sakura2&backgroundColor=c0aede',
    'https://api.dicebear.com/9.x/notionists/svg?seed=sakura3&backgroundColor=d1f4d9',
  ],
  ageBucket: 2,
  genderIdentity: 2,
  lookingFor: 3,
  bodyBucket: 2,
  fitnessBucket: 4,
  smoking: 1,
  drinking: 2,
}

export const Default: Story = {
  args: {
    profile: baseProfile,
  },
}

export const OwnProfile: Story = {
  args: {
    profile: baseProfile,
    isOwnProfile: true,
  },
}

// =============================================================================
// LAYOUT MOCKUP - Maximum info (all 17 fields)
// =============================================================================

/** All possible fields - to see if we need sections */
export const MockA_AllFields: StoryObj = {
  render: () => (
    <div class="min-h-screen bg-background p-8">
      <div class="max-w-md mx-auto">
        {/* Photo placeholder */}
        <div class="aspect-square rounded-3xl bg-secondary mb-6 overflow-hidden">
          <img
            src="https://api.dicebear.com/9.x/notionists/svg?seed=sakura&backgroundColor=ffdfbf"
            class="w-full h-full object-cover"
          />
        </div>

        {/* Name */}
        <h1 class="text-4xl font-bold text-foreground">Sakura</h1>
        <p class="text-xl text-muted-foreground mt-1">sakura.neodate</p>

        {/* Bio */}
        <p class="text-lg leading-relaxed text-muted-foreground mt-5">
          Digital artist and anime enthusiast. Love exploring coffee shops and finding new music.
        </p>

        {/* 2-col grid, stacked labels */}
        <div class="grid grid-cols-2 gap-x-8 gap-y-4 mt-6">
          <ProfileBadge category="Age" value="25-29" attested stacked />
          <ProfileBadge category="Sex" value="Female" attested stacked />
          <ProfileBadge category="Nationality" value="Japan" attested stacked />
          <ProfileBadge category="Gender" value="Woman" stacked />
          <ProfileBadge category="Looking for" value="Relationship" stacked />
          <ProfileBadge category="Body" value="Athletic" stacked />
          <ProfileBadge category="Fitness" value="Very active" stacked />
          <ProfileBadge category="Smoking" value="Never" stacked />
          <ProfileBadge category="Drinking" value="Socially" stacked />
          <ProfileBadge category="Kids" value="Don't have, open to it" stacked />
          <ProfileBadge category="Kids timeline" value="In 2-5 years" stacked />
          <ProfileBadge category="Relationship" value="Monogamish" stacked />
          <ProfileBadge category="Religion" value="Spiritual" stacked />
          <ProfileBadge category="Kink" value="Open-minded" stacked />
          <ProfileBadge category="Income" value="$75-100K" stacked />
        </div>
      </div>
    </div>
  ),
}
