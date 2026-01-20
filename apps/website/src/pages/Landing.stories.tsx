import type { Meta, StoryObj } from 'storybook-solidjs'
import { MemoryRouter } from '@solidjs/router'
import { LandingPage } from './Landing'

const meta = {
  title: 'Pages/Landing',
  component: LandingPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof LandingPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onConnect: () => console.log('Connect clicked'),
  },
}
