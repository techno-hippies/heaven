import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { ScrobbleItem } from './scrobble-item'

const meta: Meta<typeof ScrobbleItem> = {
  title: 'Features/Scrobble/ScrobbleItem',
  component: ScrobbleItem,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div class="max-w-md bg-card border border-border rounded-2xl p-5">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ScrobbleItem>

const now = Math.floor(Date.now() / 1000)

export const Default: Story = {
  args: {
    title: 'Karma Police',
    artist: 'Radiohead',
    albumArtUrl: 'https://picsum.photos/seed/t1/100/100',
    playedAt: now - 600,
  },
}

export const NowPlaying: Story = {
  args: {
    title: 'Weird Fishes/Arpeggi',
    artist: 'Radiohead',
    albumArtUrl: 'https://picsum.photos/seed/t2/100/100',
    playedAt: now,
    isNowPlaying: true,
  },
}

export const Pending: Story = {
  args: {
    title: 'Skinny Love',
    artist: 'Bon Iver',
    albumArtUrl: 'https://picsum.photos/seed/t3/100/100',
    playedAt: now - 1380,
    pending: true,
  },
}

export const NoAlbumArt: Story = {
  args: {
    title: 'Unknown Track',
    artist: 'Unknown Artist',
    playedAt: now - 3600,
  },
}

export const RecentList: Story = {
  render: () => (
    <div class="space-y-2">
      <ScrobbleItem title="Weird Fishes/Arpeggi" artist="Radiohead" albumArtUrl="https://picsum.photos/seed/t1/100/100" playedAt={now} isNowPlaying pending />
      <ScrobbleItem title="Skinny Love" artist="Bon Iver" albumArtUrl="https://picsum.photos/seed/t2/100/100" playedAt={now - 1380} pending />
      <ScrobbleItem title="Be Sweet" artist="Japanese Breakfast" albumArtUrl="https://picsum.photos/seed/t3/100/100" playedAt={now - 1620} />
      <ScrobbleItem title="Kyoto" artist="Phoebe Bridgers" albumArtUrl="https://picsum.photos/seed/t4/100/100" playedAt={now - 1860} />
    </div>
  ),
}
