import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { NowPlaying } from './now-playing'

const meta: Meta<typeof NowPlaying> = {
  title: 'Features/Scrobble/NowPlaying',
  component: NowPlaying,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div class="max-w-md">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof NowPlaying>

export const WithAlbumArt: Story = {
  args: {
    title: 'Weird Fishes/Arpeggi',
    artist: 'Radiohead',
    albumArtUrl: 'https://picsum.photos/seed/inrainbows/200/200',
    position: 127,
    duration: 309,
  },
}

export const NoAlbumArt: Story = {
  args: {
    title: 'Karma Police',
    artist: 'Radiohead',
    position: 154,
    duration: 262,
  },
}

export const NoDuration: Story = {
  args: {
    title: 'Unknown Track',
    artist: 'Unknown Artist',
    albumArtUrl: 'https://picsum.photos/seed/unknown/200/200',
  },
}
