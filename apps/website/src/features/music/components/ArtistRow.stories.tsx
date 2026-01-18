import type { Meta, StoryObj } from 'storybook-solidjs'
import { ArtistRow } from './ArtistRow'

const meta = {
  title: 'Features/Music/ArtistRow',
  component: ArtistRow,
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
} satisfies Meta<typeof ArtistRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Radiohead',
  },
}

export const WithImage: Story = {
  args: {
    name: 'Radiohead',
    imageUrl: 'https://picsum.photos/seed/radiohead/100/100',
  },
}

export const WithRank: Story = {
  args: {
    rank: 1,
    name: 'Radiohead',
    imageUrl: 'https://picsum.photos/seed/radiohead/100/100',
  },
}

export const WithPlayCount: Story = {
  args: {
    rank: 1,
    name: 'Radiohead',
    imageUrl: 'https://picsum.photos/seed/radiohead/100/100',
    playCount: 47,
  },
}

export const Clickable: Story = {
  args: {
    rank: 1,
    name: 'Radiohead',
    imageUrl: 'https://picsum.photos/seed/radiohead/100/100',
    playCount: 47,
    onClick: () => alert('Clicked!'),
  },
}

export const LongName: Story = {
  args: {
    rank: 5,
    name: 'The Incredibly Long Artist Name That Should Truncate',
    imageUrl: 'https://picsum.photos/seed/long/100/100',
    playCount: 12,
  },
}

export const List: Story = {
  render: () => (
    <div class="space-y-2">
      <ArtistRow
        rank={1}
        name="Radiohead"
        imageUrl="https://picsum.photos/seed/r1/100/100"
        playCount={47}
      />
      <ArtistRow
        rank={2}
        name="Bon Iver"
        imageUrl="https://picsum.photos/seed/r2/100/100"
        playCount={32}
      />
      <ArtistRow
        rank={3}
        name="Japanese Breakfast"
        imageUrl="https://picsum.photos/seed/r3/100/100"
        playCount={28}
      />
      <ArtistRow
        rank={4}
        name="Phoebe Bridgers"
        imageUrl="https://picsum.photos/seed/r4/100/100"
        playCount={21}
      />
      <ArtistRow
        rank={5}
        name="Big Thief"
        imageUrl="https://picsum.photos/seed/r5/100/100"
        playCount={18}
      />
    </div>
  ),
}
