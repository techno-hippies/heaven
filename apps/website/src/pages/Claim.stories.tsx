import type { Meta, StoryObj } from 'storybook-solidjs'
import { ClaimPageInner, type ClaimProfile } from './Claim'

const meta: Meta<typeof ClaimPageInner> = {
  title: 'Pages/Claim',
  component: ClaimPageInner,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ClaimPageInner>

/** Mock shadow profile for stories */
const MOCK_PROFILE: ClaimProfile = {
  id: 'shadow-001',
  displayName: 'alex',
  avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=alex-claim',
  source: 'dateme',
  sourceUrl: 'https://dateme.directory/alex',
  age: '27',
  gender: '1',
  location: 'San Francisco',
  bio: 'Software engineer, hiking enthusiast',
  likesReceived: 3,
  verificationCode: 'HVN-X7K9M2',
}

/** Initial state - shows profile with verification options */
export const Default: Story = {
  args: {
    mockProfile: MOCK_PROFILE,
    initialState: 'profile',
  },
}

/** Single like notification */
export const OneLike: Story = {
  args: {
    mockProfile: {
      ...MOCK_PROFILE,
      likesReceived: 1,
    },
    initialState: 'profile',
  },
}

/** No likes yet - just claiming */
export const NoLikes: Story = {
  args: {
    mockProfile: {
      ...MOCK_PROFILE,
      likesReceived: 0,
    },
    initialState: 'profile',
  },
}

/** Different source - Cuties */
export const CutiesSource: Story = {
  args: {
    mockProfile: {
      ...MOCK_PROFILE,
      source: 'cuties',
      sourceUrl: 'https://cuties.app/user/alex',
    },
    initialState: 'profile',
  },
}

/** Different source - ACX */
export const AcxSource: Story = {
  args: {
    mockProfile: {
      ...MOCK_PROFILE,
      source: 'acx',
      sourceUrl: undefined,
      likesReceived: 2,
    },
    initialState: 'profile',
  },
}

/** Bio edit verification step */
export const BioEdit: Story = {
  args: {
    mockProfile: MOCK_PROFILE,
    initialState: 'bio-edit',
  },
}

/** Checking/verifying state */
export const Checking: Story = {
  args: {
    mockProfile: MOCK_PROFILE,
    initialState: 'checking',
  },
}

/** Passkey creation step */
export const Passkey: Story = {
  args: {
    mockProfile: MOCK_PROFILE,
    initialState: 'passkey',
  },
}

/** Minting PKP - creating account */
export const Minting: Story = {
  args: {
    mockProfile: MOCK_PROFILE,
    initialState: 'minting',
  },
}

/** Authenticating - signing in */
export const Authenticating: Story = {
  args: {
    mockProfile: MOCK_PROFILE,
    initialState: 'authenticating',
  },
}

/** Success - profile claimed */
export const Success: Story = {
  args: {
    mockProfile: MOCK_PROFILE,
    initialState: 'success',
  },
}

/** Error state - invalid/expired link */
export const Error: Story = {
  args: {
    mockProfile: MOCK_PROFILE,
    initialState: 'error',
  },
}

/** Loading state */
export const Loading: Story = {
  args: {
    initialState: 'loading',
  },
}
