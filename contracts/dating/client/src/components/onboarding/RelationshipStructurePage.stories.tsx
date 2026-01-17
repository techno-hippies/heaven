import type { Meta, StoryObj } from 'storybook-solidjs'
import { RelationshipStructurePage } from './RelationshipStructurePage'

const meta = {
  title: 'Onboarding/08 - Relationship Structure',
  component: RelationshipStructurePage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    step: 8,
    totalSteps: 12,
  },
} satisfies Meta<typeof RelationshipStructurePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
