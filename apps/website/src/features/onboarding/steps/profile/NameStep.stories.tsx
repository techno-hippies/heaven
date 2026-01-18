import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { NameStep, type NameStepData, nameStepMeta } from './NameStep'
import { StepHeader } from '../../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Profile/NameStep',
  component: NameStep,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof NameStep>

export default meta
type Story = StoryObj<typeof meta>

const StoryWrapper = (props: { data: NameStepData }) => {
  const [data, setData] = createSignal<NameStepData>(props.data)
  return (
    <div class="w-full px-6 py-6">
      <div class="max-w-2xl mx-auto space-y-6">
        <StepHeader title={nameStepMeta.title} subtitle={nameStepMeta.subtitle} />
        <NameStep
          data={data()}
          onChange={(updates) => setData({ ...data(), ...updates })}
        />
        <div class="mt-8 p-4 bg-muted rounded-lg">
          <p class="text-xs text-muted-foreground">State:</p>
          <pre class="text-xs">{JSON.stringify(data(), null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}

/**
 * Empty state - enter a name to see pricing
 */
export const Default: Story = {
  render: () => <StoryWrapper data={{}} />,
}

/**
 * 5+ chars on .heaven = FREE
 * This is the ideal state for most users
 */
export const FreeName: Story = {
  name: 'Free (5+ chars on .heaven)',
  render: () => <StoryWrapper data={{ name: 'sakura', tld: 'heaven' }} />,
}

/**
 * 4 char name on .heaven = PREMIUM
 * Shows the premium pricing warning
 */
export const PremiumShortName: Story = {
  name: 'Premium (4 chars on .heaven)',
  render: () => <StoryWrapper data={{ name: 'luna', tld: 'heaven' }} />,
}

/**
 * 5+ chars on .star (on-chain) = PAID
 * On-chain TLDs always cost ETH
 */
export const PaidOnChainTLD: Story = {
  name: 'Paid (on-chain .star)',
  render: () => <StoryWrapper data={{ name: 'alice', tld: 'star' }} />,
}

/**
 * Short name on .star = PREMIUM (higher multiplier)
 */
export const PremiumOnChainTLD: Story = {
  name: 'Premium (4 chars on .star)',
  render: () => <StoryWrapper data={{ name: 'luna', tld: 'star' }} />,
}

/**
 * Spiral emoji TLD
 */
export const SpiralTLD: Story = {
  name: 'Spiral TLD',
  render: () => <StoryWrapper data={{ name: 'cosmic', tld: 'spiral' }} />,
}

/**
 * Reserved name - cannot be registered
 * Reserved names include: admin, root, system, neodate, support, help, etc.
 */
export const ReservedName: Story = {
  name: 'Reserved Name',
  render: () => <StoryWrapper data={{ name: 'admin', tld: 'heaven' }} />,
}

/**
 * Too short name (less than minLabelLength)
 */
export const TooShort: Story = {
  name: 'Too Short (3 chars)',
  render: () => <StoryWrapper data={{ name: 'abc', tld: 'heaven' }} />,
}
