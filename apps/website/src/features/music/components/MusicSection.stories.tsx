import type { Meta, StoryObj } from 'storybook-solidjs'
import { MusicSection } from './MusicSection'

const meta = {
  title: 'Features/Music/MusicSection',
  component: MusicSection,
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
} satisfies Meta<typeof MusicSection>

export default meta
type Story = StoryObj<typeof meta>

const topArtists = [
  { name: 'Radiohead', imageUrl: 'https://picsum.photos/seed/a1/100/100', playCount: 47 },
  { name: 'Bon Iver', imageUrl: 'https://picsum.photos/seed/a2/100/100', playCount: 32 },
  { name: 'Japanese Breakfast', imageUrl: 'https://picsum.photos/seed/a3/100/100', playCount: 28 },
  { name: 'Phoebe Bridgers', imageUrl: 'https://picsum.photos/seed/a4/100/100', playCount: 21 },
  { name: 'Big Thief', imageUrl: 'https://picsum.photos/seed/a5/100/100', playCount: 18 },
]

const recentTracks = [
  {
    title: 'Everything In Its Right Place',
    artist: 'Radiohead',
    albumArtUrl: 'https://picsum.photos/seed/t1/100/100',
    timestamp: '2 hours ago',
  },
  {
    title: 'Skinny Love',
    artist: 'Bon Iver',
    albumArtUrl: 'https://picsum.photos/seed/t2/100/100',
    timestamp: '3 hours ago',
  },
  {
    title: 'Be Sweet',
    artist: 'Japanese Breakfast',
    albumArtUrl: 'https://picsum.photos/seed/t3/100/100',
    timestamp: '5 hours ago',
  },
  {
    title: 'Kyoto',
    artist: 'Phoebe Bridgers',
    albumArtUrl: 'https://picsum.photos/seed/t4/100/100',
    timestamp: 'Yesterday',
  },
  {
    title: 'Not',
    artist: 'Big Thief',
    albumArtUrl: 'https://picsum.photos/seed/t5/100/100',
    timestamp: 'Yesterday',
  },
]

export const Default: Story = {
  args: {
    topArtists,
    recentTracks,
  },
}

export const ArtistsOnly: Story = {
  args: {
    topArtists,
  },
}

export const TracksOnly: Story = {
  args: {
    recentTracks,
  },
}

export const Limited: Story = {
  args: {
    topArtists,
    recentTracks,
    maxArtists: 3,
    maxTracks: 3,
  },
}

export const NoImages: Story = {
  args: {
    topArtists: topArtists.map(({ imageUrl, ...rest }) => rest),
    recentTracks: recentTracks.map(({ albumArtUrl, ...rest }) => rest),
  },
}

export const Empty: Story = {
  args: {},
}
