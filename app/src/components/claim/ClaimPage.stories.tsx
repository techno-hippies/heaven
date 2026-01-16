import type { Meta, StoryObj } from 'storybook-solidjs'
import { ClaimPage, type ShadowProfile } from './ClaimPage'

const mockProfile: ShadowProfile = {
  id: '1',
  pseudonym: 'Sakura',
  avatarUrl: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=sakura&backgroundColor=c0aede',
  bio: 'Software engineer who loves hiking and board games. Looking for someone to explore coffee shops with.',
  platform: 'dateme',
  sourceUrl: 'https://dateme.directory/profile/sakura',
}

const meta: Meta<typeof ClaimPage> = {
  title: 'Claim/ClaimPage',
  component: ClaimPage,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    step: {
      control: 'select',
      options: ['choose', 'bio-edit', 'enter-code', 'verifying', 'error', 'success'],
    },
  },
}

export default meta
type Story = StoryObj<typeof ClaimPage>

export const ChooseMethod: Story = {
  args: {
    profile: mockProfile,
    step: 'choose',
  },
}

export const BioEdit: Story = {
  args: {
    profile: mockProfile,
    step: 'bio-edit',
    code: 'NEO-7X9K2M',
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000),
  },
}

export const EnterCode: Story = {
  args: {
    profile: mockProfile,
    step: 'enter-code',
  },
}

export const Verifying: Story = {
  args: {
    profile: mockProfile,
    step: 'verifying',
  },
}

export const Error: Story = {
  args: {
    profile: mockProfile,
    step: 'error',
    error: 'Code not found in your bio. Wait 2-3 minutes and try again.',
  },
}

export const Success: Story = {
  args: {
    profile: mockProfile,
    step: 'success',
  },
}

// Different platforms
export const ACXProfile: Story = {
  args: {
    profile: {
      ...mockProfile,
      pseudonym: 'Rationalist42',
      platform: 'acx',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=rationalist&backgroundColor=b6e3f4',
    },
    step: 'choose',
  },
}

export const CutiesProfile: Story = {
  args: {
    profile: {
      ...mockProfile,
      pseudonym: 'CozyDev',
      platform: 'cuties',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=cozy&backgroundColor=ffd5dc',
    },
    step: 'bio-edit',
    code: 'NEO-ABC123',
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  },
}
