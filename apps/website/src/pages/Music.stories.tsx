import type { Meta, StoryObj } from 'storybook-solidjs'
import { MusicPage } from './Music'

const meta = {
  title: 'Pages/Music',
  component: MusicPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MusicPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
