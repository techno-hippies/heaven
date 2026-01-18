import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { VisibilitySelect, type Visibility } from './visibility-select'

const meta: Meta<typeof VisibilitySelect> = {
  title: 'Components/VisibilitySelect',
  component: VisibilitySelect,
  decorators: [
    (Story) => (
      <div class="max-w-md p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof VisibilitySelect>

/** Public selected */
export const Public: Story = {
  render: () => {
    const [value, setValue] = createSignal<Visibility>('public')
    return (
      <VisibilitySelect
        value={value()}
        onChange={setValue}
      />
    )
  },
}

/** Match selected */
export const Match: Story = {
  render: () => {
    const [value, setValue] = createSignal<Visibility>('match')
    return (
      <VisibilitySelect
        value={value()}
        onChange={setValue}
      />
    )
  },
}

/** Private selected */
export const Private: Story = {
  render: () => {
    const [value, setValue] = createSignal<Visibility>('private')
    return (
      <VisibilitySelect
        value={value()}
        onChange={setValue}
      />
    )
  },
}

/** With label */
export const WithLabel: Story = {
  render: () => {
    const [value, setValue] = createSignal<Visibility>('public')
    return (
      <VisibilitySelect
        value={value()}
        onChange={setValue}
        label="Who can see your gender?"
      />
    )
  },
}
