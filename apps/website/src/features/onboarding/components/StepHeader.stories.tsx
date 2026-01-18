import type { Meta, StoryObj } from 'storybook-solidjs'
import { StepHeader } from './StepHeader'

const meta = {
  title: 'Features/Onboarding/Components/StepHeader',
  component: StepHeader,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof StepHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Simple: Story = {
  args: {
    title: "What's your name?",
  },
}

export const WithSubtitle: Story = {
  args: {
    title: "What's your name?",
    subtitle: 'This will appear on your profile',
  },
}

export const WithProgress: Story = {
  args: {
    title: 'Upload a photo',
    subtitle: 'Add at least one photo to continue',
    current: 3,
    total: 10,
  },
}

export const Required: Story = {
  args: {
    title: 'Choose your gender',
    subtitle: 'Help us find the right matches for you',
    required: true,
    current: 5,
    total: 10,
  },
}

export const FirstStep: Story = {
  args: {
    title: 'Welcome to Neodate',
    subtitle: "Let's set up your profile in just a few steps",
    current: 1,
    total: 10,
  },
}

export const LastStep: Story = {
  args: {
    title: 'Almost done!',
    subtitle: 'Review your profile before we publish it',
    current: 10,
    total: 10,
  },
}
