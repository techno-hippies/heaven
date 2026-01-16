import type { Meta, StoryObj } from 'storybook-solidjs'
import { ProfileCard, ProfileCardSkeleton } from './ProfileCard'

const meta = {
  title: 'Dating/ProfileCard',
  component: ProfileCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['mini', 'compact', 'full'],
    },
  },
} satisfies Meta<typeof ProfileCard>

export default meta
type Story = StoryObj<typeof meta>

const sampleProfile = {
  id: '1',
  name: 'Alex',
  age: 28,
  location: 'San Francisco',
  bio: 'Coffee enthusiast, hiking lover, and amateur chef. Looking for someone to explore the city with.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
  verified: true,
  verificationLevel: 'id' as const,
  tags: ['Coffee', 'Hiking', 'Travel', 'Dogs'],
  compatibility: 87,
}

const sampleProfile2 = {
  id: '2',
  name: 'Jordan',
  age: 32,
  location: 'Oakland',
  bio: 'Tech nerd by day, vinyl collector by night. Let\'s grab dinner and talk about nothing.',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
  verified: true,
  verificationLevel: 'photo' as const,
  tags: ['Music', 'Tech', 'Food', 'Wine'],
  compatibility: 72,
}

const sampleProfile3 = {
  id: '3',
  name: 'Sam',
  ageRange: '25-30',
  location: 'Berkeley',
  bio: 'Yoga instructor and plant parent. Seeking genuine connections.',
  avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop',
  verified: false,
  tags: ['Yoga', 'Plants', 'Meditation'],
  compatibility: 65,
}

export const Full: Story = {
  args: {
    profile: sampleProfile,
    variant: 'full',
  },
}

export const Compact: Story = {
  args: {
    profile: sampleProfile2,
    variant: 'compact',
  },
}

export const Mini: Story = {
  args: {
    profile: sampleProfile3,
    variant: 'mini',
  },
}

export const WithAgeRange: Story = {
  args: {
    profile: sampleProfile3,
    variant: 'full',
  },
}

export const NotVerified: Story = {
  args: {
    profile: {
      ...sampleProfile,
      verified: false,
    },
    variant: 'full',
  },
}

export const HighCompatibility: Story = {
  args: {
    profile: {
      ...sampleProfile,
      compatibility: 95,
    },
    variant: 'full',
  },
}

export const LowCompatibility: Story = {
  args: {
    profile: {
      ...sampleProfile,
      compatibility: 35,
    },
    variant: 'full',
  },
}

export const MiniGrid: Story = {
  render: () => (
    <div class="grid grid-cols-4 gap-2">
      <ProfileCard profile={sampleProfile} variant="mini" />
      <ProfileCard profile={sampleProfile2} variant="mini" />
      <ProfileCard profile={sampleProfile3} variant="mini" />
      <ProfileCard profile={{ ...sampleProfile, name: 'Taylor', id: '4' }} variant="mini" />
    </div>
  ),
}

export const CompactList: Story = {
  render: () => (
    <div class="space-y-4 w-80">
      <ProfileCard profile={sampleProfile} variant="compact" />
      <ProfileCard profile={sampleProfile2} variant="compact" />
    </div>
  ),
}

export const Skeleton: Story = {
  render: () => (
    <div class="flex gap-4">
      <ProfileCardSkeleton variant="mini" />
      <ProfileCardSkeleton variant="compact" />
      <ProfileCardSkeleton variant="full" />
    </div>
  ),
}
