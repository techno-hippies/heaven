import type { Meta, StoryObj } from 'storybook-solidjs'
import { SwipeCard, type SwipeProfileData } from './SwipeCard'

const meta: Meta<typeof SwipeCard> = {
  title: 'Swipe/SwipeCard',
  component: SwipeCard,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof SwipeCard>

const fullProfile: SwipeProfileData = {
  id: '0x1234567890abcdef',
  name: 'Sakura',
  username: 'sakura.neodate',
  photo: '/avatars/sakura.svg',
  bio: 'Digital artist and anime enthusiast. Love exploring coffee shops and finding new music.',

  // Attested
  ageBucket: 2, // 25-29
  biologicalSex: 1, // Female
  nationality: 'JPN',

  // Public
  genderIdentity: 2, // Woman
  lookingFor: 3, // Relationship
  bodyBucket: 2, // Athletic
  fitnessBucket: 4, // Very active
  smoking: 1, // Never
  drinking: 2, // Socially

  // Optional revealed
  kids: 3, // Don't have, open to it
  relationshipStructure: 2, // Monogamish
  religion: 2, // Spiritual
  kinkLevel: 3, // Open-minded
}

export const Default: Story = {
  args: {
    profile: fullProfile,
  },
}

export const TheyLikedYou: Story = {
  args: {
    profile: fullProfile,
    likedYou: true,
  },
}

export const MinimalProfile: Story = {
  args: {
    profile: {
      id: '0xminimal',
      name: 'Mystery',
      username: 'mystery.neodate',
      photo: '/avatars/sakura2.svg',
      ageBucket: 3,
      genderIdentity: 2,
      lookingFor: 2,
    },
  },
}

export const MaleProfile: Story = {
  args: {
    profile: {
      id: '0xhiroshi',
      name: 'Hiroshi',
      username: 'hiroshi.neodate',
      photo: '/avatars/hiroshi.svg',
      bio: 'Software engineer by day, DJ by night. Always looking for the next adventure.',
      ageBucket: 3, // 30-34
      biologicalSex: 0, // Male
      nationality: 'USA',
      genderIdentity: 1, // Man
      lookingFor: 2, // Dating
      bodyBucket: 2, // Athletic
      fitnessBucket: 5, // Athlete
      smoking: 1,
      drinking: 2,
      kinkLevel: 4, // Friendly
      incomeRange: 6, // $100-150K
    },
    likedYou: true,
  },
}

export const NonBinaryProfile: Story = {
  args: {
    profile: {
      id: '0xriver',
      name: 'River',
      username: 'river.neodate',
      photo: '/avatars/sakura.svg',
      bio: 'Artist, dreamer, plant parent. They/them.',
      ageBucket: 1, // 18-24
      nationality: 'CAN',
      genderIdentity: 3, // Non-binary
      lookingFor: 1, // Casual
      bodyBucket: 1, // Slim
      drinking: 1, // Never
      religion: 2, // Spiritual
    },
  },
}
