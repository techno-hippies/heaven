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

export const Playing: Story = {
  args: {
    title: 'Weird Fishes/Arpeggi',
    artist: 'Radiohead',
    albumArtUrl: 'https://picsum.photos/seed/inrainbows/200/200',
    isPlaying: true,
  },
}

export const Paused: Story = {
  args: {
    title: 'Karma Police',
    artist: 'Radiohead',
    albumArtUrl: 'https://picsum.photos/seed/okcomputer/200/200',
    isPlaying: false,
  },
}

export const NoAlbumArt: Story = {
  args: {
    title: 'Unknown Track',
    artist: 'Unknown Artist',
    isPlaying: true,
  },
}
