import type { Meta, StoryObj } from 'storybook-solidjs'
import { LandingPage } from './LandingPage'

const meta = {
  title: 'Landing/LandingPage',
  component: LandingPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof LandingPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
