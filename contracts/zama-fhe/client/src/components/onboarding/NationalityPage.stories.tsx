import type { Meta, StoryObj } from 'storybook-solidjs'
import { NationalityPage } from './NationalityPage'

const meta = {
  title: 'Onboarding/07 - Nationality',
  component: NationalityPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    step: 7,
    totalSteps: 12,
    verifiedNationality: 'US',
    nationalityName: 'United States',
  },
} satisfies Meta<typeof NationalityPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
