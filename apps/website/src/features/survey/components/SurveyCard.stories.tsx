import type { Meta, StoryObj } from 'storybook-solidjs'
import { SurveyCard } from './SurveyCard'

const meta = {
  title: 'Features/Survey/SurveyCard',
  component: SurveyCard,
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
} satisfies Meta<typeof SurveyCard>

export default meta
type Story = StoryObj<typeof meta>

// ============ Categories ============

export const Lifestyle: Story = {
  args: {
    title: 'Lifestyle',
    category: 'lifestyle',
    description: 'Smoking, drinking, diet, and fitness',
  },
}

export const Intimacy: Story = {
  args: {
    title: 'Intimacy',
    category: 'intimacy',
    description: 'Preferences, boundaries, and experience',
  },
}

export const Work: Story = {
  args: {
    title: 'Work',
    category: 'work',
    description: 'Career, education, and ambition',
  },
}

export const Body: Story = {
  args: {
    title: 'Body',
    category: 'body',
    description: 'Height, body type, and fitness',
  },
}

// ============ States ============

export const Completed: Story = {
  args: {
    title: 'Lifestyle',
    category: 'lifestyle',
    description: 'Smoking, drinking, diet, and fitness',
    total: 5,
    completed: 5,
  },
}

// ============ List Demo ============

export const SurveyList: Story = {
  render: () => (
    <div class="space-y-3">
      <SurveyCard
        title="Lifestyle"
        category="lifestyle"
        description="Smoking, drinking, diet, and fitness"
        total={5}
        completed={5}
      />
      <SurveyCard
        title="Intimacy"
        category="intimacy"
        description="Preferences, boundaries, and experience"
      />
      <SurveyCard
        title="Work"
        category="work"
        description="Career, education, and ambition"
      />
      <SurveyCard
        title="Body"
        category="body"
        description="Height, body type, and fitness"
      />
    </div>
  ),
  args: {} as any,
}
