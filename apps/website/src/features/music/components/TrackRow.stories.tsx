import type { Meta, StoryObj } from 'storybook-solidjs'
import { TrackRow } from './TrackRow'

const meta = {
  title: 'Features/Music/TrackRow',
  component: TrackRow,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div class="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TrackRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Everything In Its Right Place',
    artist: 'Radiohead',
  },
}

export const WithAlbumArt: Story = {
  args: {
    title: 'Everything In Its Right Place',
    artist: 'Radiohead',
    album: 'Kid A',
    albumArtUrl: 'https://picsum.photos/seed/kida/100/100',
  },
}

export const WithTimestamp: Story = {
  args: {
    title: 'Everything In Its Right Place',
    artist: 'Radiohead',
    albumArtUrl: 'https://picsum.photos/seed/kida/100/100',
    timestamp: '2 hours ago',
  },
}

export const Clickable: Story = {
  args: {
    title: 'Everything In Its Right Place',
    artist: 'Radiohead',
    albumArtUrl: 'https://picsum.photos/seed/kida/100/100',
    timestamp: '2 hours ago',
    onClick: () => alert('Clicked!'),
  },
}

export const LongTitle: Story = {
  args: {
    title: 'The National Anthem (Live From The Basement Sessions 2008)',
    artist: 'Radiohead',
    albumArtUrl: 'https://picsum.photos/seed/basement/100/100',
    timestamp: '3 hours ago',
  },
}

export const List: Story = {
  render: () => (
    <div class="space-y-2">
      <TrackRow
        title="Everything In Its Right Place"
        artist="Radiohead"
        albumArtUrl="https://picsum.photos/seed/t1/100/100"
        timestamp="2 hours ago"
      />
      <TrackRow
        title="Skinny Love"
        artist="Bon Iver"
        albumArtUrl="https://picsum.photos/seed/t2/100/100"
        timestamp="3 hours ago"
      />
      <TrackRow
        title="Be Sweet"
        artist="Japanese Breakfast"
        albumArtUrl="https://picsum.photos/seed/t3/100/100"
        timestamp="5 hours ago"
      />
      <TrackRow
        title="Kyoto"
        artist="Phoebe Bridgers"
        albumArtUrl="https://picsum.photos/seed/t4/100/100"
        timestamp="Yesterday"
      />
      <TrackRow
        title="Not"
        artist="Big Thief"
        albumArtUrl="https://picsum.photos/seed/t5/100/100"
        timestamp="Yesterday"
      />
    </div>
  ),
}
