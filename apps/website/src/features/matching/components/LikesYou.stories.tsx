import type { Meta, StoryObj } from 'storybook-solidjs'
import { LikesYou, type LikeProfile } from './LikesYou'

const getAnimeAvatar = (seed: string) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`

const SAMPLE_LIKES: LikeProfile[] = [
  { id: '1', name: 'Sakura', avatar: getAnimeAvatar('sakura') },
  { id: '2', name: 'Yuki', avatar: getAnimeAvatar('yuki') },
  { id: '3', name: 'Hana', avatar: getAnimeAvatar('hana') },
  { id: '4', name: 'Mei', avatar: getAnimeAvatar('mei') },
  { id: '5', name: 'Aiko', avatar: getAnimeAvatar('aiko') },
  { id: '6', name: 'Rin', avatar: getAnimeAvatar('rin') },
  { id: '7', name: 'Nao', avatar: getAnimeAvatar('nao') },
  { id: '8', name: 'Sora', avatar: getAnimeAvatar('sora') },
]

const meta = {
  title: 'Features/Matching/LikesYou',
  component: LikesYou,
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
} satisfies Meta<typeof LikesYou>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    likes: SAMPLE_LIKES,
    onSelect: (id) => console.log('Selected:', id),
  },
}

export const FewLikes: Story = {
  args: {
    likes: SAMPLE_LIKES.slice(0, 3),
    onSelect: (id) => console.log('Selected:', id),
  },
}

export const SingleLike: Story = {
  args: {
    likes: [SAMPLE_LIKES[0]],
    onSelect: (id) => console.log('Selected:', id),
  },
}

export const Empty: Story = {
  args: {
    likes: [],
  },
}

export const Mobile: Story = {
  args: {
    likes: SAMPLE_LIKES,
    onSelect: (id) => console.log('Selected:', id),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}
