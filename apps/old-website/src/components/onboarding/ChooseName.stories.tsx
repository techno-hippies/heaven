import type { Meta, StoryObj } from 'storybook-solidjs'
import { ChooseName } from './ChooseName'

const meta: Meta<typeof ChooseName> = {
  title: 'Onboarding/ChooseName',
  component: ChooseName,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ChooseName>

/**
 * Default state - uses live contract data for availability and pricing
 */
export const Default: Story = {
  name: 'Default (Live Contract)',
  render: () => {
    return (
      <ChooseName
        step={3}
        totalSteps={10}
        onBack={() => alert('Back!')}
        onContinue={(name, tld) => alert(`Registered: ${name}.${tld}`)}
      />
    )
  },
}

/**
 * Shows the component in context of the full step flow
 */
export const InContext: Story = {
  name: 'In Onboarding Context',
  render: () => {
    return (
      <div class="min-h-screen bg-background">
        <ChooseName
          step={3}
          totalSteps={10}
          onBack={() => console.log('Back')}
          onContinue={(name, tld) => console.log(`Selected: ${name}.${tld}`)}
        />
      </div>
    )
  },
}
