import type { Meta, StoryObj } from 'storybook-solidjs'
import { Matches, type MatchProfile } from './Matches'

const getAnimeAvatar = (seed: string) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`

const SAMPLE_MATCHES: MatchProfile[] = [
  { id: '1', name: 'Luna', avatar: getAnimeAvatar('luna'), isNew: true },
  { id: '2', name: 'Nova', avatar: getAnimeAvatar('nova'), isNew: true },
  { id: '3', name: 'Aria', avatar: getAnimeAvatar('aria') },
  { id: '4', name: 'Kai', avatar: getAnimeAvatar('kai') },
  { id: '5', name: 'Miko', avatar: getAnimeAvatar('miko') },
  { id: '6', name: 'Zen', avatar: getAnimeAvatar('zen') },
  { id: '7', name: 'Yuna', avatar: getAnimeAvatar('yuna') },
  { id: '8', name: 'Emi', avatar: getAnimeAvatar('emi') },
]

const meta = {
  title: 'Features/Matching/Matches',
  component: Matches,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div class="bg-background min-h-screen">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Matches>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    matches: SAMPLE_MATCHES,
    onSelect: (id) => console.log('Selected match:', id),
  },
}

export const WithNewMatches: Story = {
  args: {
    matches: SAMPLE_MATCHES.map((m, i) => ({ ...m, isNew: i < 3 })),
    onSelect: (id) => console.log('Selected match:', id),
  },
}

export const NoNewMatches: Story = {
  args: {
    matches: SAMPLE_MATCHES.map((m) => ({ ...m, isNew: false })),
    onSelect: (id) => console.log('Selected match:', id),
  },
}

export const FewMatches: Story = {
  args: {
    matches: SAMPLE_MATCHES.slice(0, 3),
    onSelect: (id) => console.log('Selected match:', id),
  },
}

export const SingleMatch: Story = {
  args: {
    matches: [SAMPLE_MATCHES[0]],
    onSelect: (id) => console.log('Selected match:', id),
  },
}

export const Empty: Story = {
  args: {
    matches: [],
  },
}

export const Mobile: Story = {
  args: {
    matches: SAMPLE_MATCHES,
    onSelect: (id) => console.log('Selected match:', id),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}
