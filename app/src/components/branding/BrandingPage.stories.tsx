import type { Meta, StoryObj } from 'storybook-solidjs'
import { BrandingPage } from './BrandingPage'

const meta: Meta<typeof BrandingPage> = {
  title: 'Branding/BrandingPage',
  component: BrandingPage,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof BrandingPage>

export const Default: Story = {
  decorators: [
    (Story) => (
      <div class="min-h-screen bg-background">
        <Story />
      </div>
    ),
  ],
}
