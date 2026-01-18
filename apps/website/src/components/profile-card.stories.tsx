import type { Meta, StoryObj } from 'storybook-solidjs'
import { ProfileCard } from './profile-card'
import { Button } from '@/ui/button'

const meta = {
  title: 'Components/ProfileCard',
  component: ProfileCard,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div class="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProfileCard>

export default meta
type Story = StoryObj<typeof meta>

// ============ Full Profiles ============

export const FullProfile: Story = {
  args: {
    name: 'sakura',
    tld: 'heaven',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=sakura',
    age: '27',
    gender: '2',
    location: 'Tokyo',
    lookingFor: '2',
    relationshipStatus: '1',
    relationshipStyle: '1',
    kids: '1',
    religion: 'spiritual',
    interestedIn: ['1'],
  },
}

export const PolyPartner: Story = {
  args: {
    name: 'alex',
    tld: 'heaven',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=alex',
    age: '31',
    gender: '5',
    location: 'Berlin',
    lookingFor: '1',
    relationshipStatus: '2',
    relationshipStyle: '2',
    kids: '1',
    religion: 'other',
    interestedIn: ['1', '2', '5'],
  },
}

export const SingleMom: Story = {
  args: {
    name: 'maya',
    tld: 'heaven',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=maya',
    age: '34',
    gender: '2',
    location: 'NYC',
    lookingFor: '2',
    relationshipStatus: '3',
    relationshipStyle: '1',
    kids: '2',
    religion: 'christian',
    interestedIn: ['1'],
  },
}

export const YoungProfessional: Story = {
  args: {
    name: 'kai',
    tld: 'heaven',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=kai',
    age: '26',
    gender: '1',
    location: 'SF',
    lookingFor: '1',
    relationshipStatus: '1',
    relationshipStyle: '1',
    kids: '1',
    interestedIn: ['2'],
  },
}

export const TransWomanLookingForLove: Story = {
  args: {
    name: 'luna',
    tld: 'heaven',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=luna',
    age: '29',
    gender: '4',
    location: 'LA',
    lookingFor: '2',
    relationshipStatus: '1',
    relationshipStyle: '1',
    kids: '1',
    religion: 'buddhist',
    interestedIn: ['1', '2'],
  },
}

export const ReligiousTraditional: Story = {
  args: {
    name: 'noah',
    tld: 'heaven',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=noah',
    age: '32',
    gender: '1',
    location: 'Dallas',
    lookingFor: '2',
    relationshipStatus: '1',
    relationshipStyle: '1',
    kids: '1',
    religion: 'christian',
    interestedIn: ['2'],
  },
}

// ============ Minimal Profiles ============

export const MinimalProfile: Story = {
  args: {
    name: 'ghost',
    tld: 'eth',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=ghost',
    age: '28',
    gender: '1',
    interestedIn: ['2'],
  },
}

export const JustBasics: Story = {
  args: {
    name: 'anon',
    tld: 'heaven',
    age: '25',
    gender: '2',
    location: 'Miami',
    interestedIn: ['1'],
  },
}

// ============ With Actions ============

export const WithLikeButtons: Story = {
  render: () => (
    <div class="space-y-4">
      <ProfileCard
        name="river"
        tld="heaven"
        avatarUrl="https://api.dicebear.com/9.x/notionists/svg?seed=river"
        age="28"
        gender="2"
        location="Portland"
        lookingFor="2"
        relationshipStatus="1"
        relationshipStyle="1"
        kids="1"
        religion="spiritual"
        interestedIn={['1', '2']}
      />
      <div class="flex gap-3">
        <Button variant="secondary" class="flex-1">Pass</Button>
        <Button variant="default" class="flex-1">Like</Button>
      </div>
    </div>
  ),
}

export const WithLikeBack: Story = {
  render: () => (
    <div class="space-y-4">
      <ProfileCard
        name="jade"
        tld="heaven"
        avatarUrl="https://api.dicebear.com/9.x/notionists/svg?seed=jade"
        age="30"
        gender="2"
        location="Austin"
        lookingFor="1"
        relationshipStatus="2"
        relationshipStyle="2"
        kids="1"
        interestedIn={['1', '2', '5']}
      />
      <div class="flex gap-3">
        <Button variant="secondary" class="flex-1">Pass</Button>
        <Button variant="default" class="flex-1">Like Back</Button>
      </div>
    </div>
  ),
}

// ============ Feed ============

export const Feed: Story = {
  render: () => (
    <div class="space-y-6">
      <div class="space-y-4">
        <ProfileCard
          name="sakura"
          tld="heaven"
          avatarUrl="https://api.dicebear.com/9.x/notionists/svg?seed=sakura"
          age="27"
          gender="2"
          location="Tokyo"
          lookingFor="2"
          relationshipStatus="1"
          relationshipStyle="1"
          kids="1"
          religion="spiritual"
          interestedIn={['1']}
        />
        <div class="flex gap-3">
          <Button variant="secondary" class="flex-1">Pass</Button>
          <Button variant="default" class="flex-1">Like</Button>
        </div>
      </div>

      <div class="space-y-4">
        <ProfileCard
          name="alex"
          tld="heaven"
          avatarUrl="https://api.dicebear.com/9.x/notionists/svg?seed=alex"
          age="31"
          gender="5"
          location="Berlin"
          lookingFor="1"
          relationshipStatus="2"
          relationshipStyle="2"
          kids="1"
          interestedIn={['1', '2', '5']}
        />
        <div class="flex gap-3">
          <Button variant="secondary" class="flex-1">Pass</Button>
          <Button variant="default" class="flex-1">Like</Button>
        </div>
      </div>

      <div class="space-y-4">
        <ProfileCard
          name="kai"
          tld="heaven"
          avatarUrl="https://api.dicebear.com/9.x/notionists/svg?seed=kai"
          age="26"
          gender="1"
          location="SF"
          lookingFor="1"
          relationshipStatus="1"
          relationshipStyle="1"
          kids="1"
          interestedIn={['2']}
        />
        <div class="flex gap-3">
          <Button variant="secondary" class="flex-1">Pass</Button>
          <Button variant="default" class="flex-1">Like Back</Button>
        </div>
      </div>
    </div>
  ),
}
