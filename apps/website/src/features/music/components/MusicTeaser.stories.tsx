import type { Meta, StoryObj } from 'storybook-solidjs'
import { MusicTeaser } from './MusicTeaser'

const meta = {
  title: 'Features/Music/MusicTeaser',
  component: MusicTeaser,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div class="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MusicTeaser>

export default meta
type Story = StoryObj<typeof meta>

const topArtists = [
  { name: 'Radiohead', playCount: 247 },
  { name: 'Bon Iver', playCount: 182 },
  { name: 'Japanese Breakfast', playCount: 156 },
  { name: 'Phoebe Bridgers', playCount: 134 },
  { name: 'Big Thief', playCount: 98 },
]

export const Default: Story = {
  args: {
    topArtists,
    scrobbles: 12847,
    hoursThisWeek: 23,
    onClick: () => alert('Navigate to music page'),
  },
}

export const TwoArtists: Story = {
  args: {
    topArtists: topArtists.slice(0, 2),
    onClick: () => alert('Navigate to music page'),
  },
}

export const SingleArtist: Story = {
  args: {
    topArtists: topArtists.slice(0, 1),
    onClick: () => alert('Navigate to music page'),
  },
}

export const NoClickHandler: Story = {
  args: {
    topArtists,
  },
}

export const Empty: Story = {
  args: {
    topArtists: [],
  },
}
