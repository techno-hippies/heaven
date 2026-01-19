import type { Meta, StoryObj } from 'storybook-solidjs'
import { SurveyPage } from './Survey'

const meta = {
  title: 'Pages/Survey',
  component: SurveyPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SurveyPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
