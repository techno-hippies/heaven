import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { ChoiceSelect } from './choice-select'

const meta: Meta<typeof ChoiceSelect> = {
  title: 'UI/ChoiceSelect',
  component: ChoiceSelect,
}

export default meta
type Story = StoryObj<typeof ChoiceSelect>

/** Simple single-select example */
export const SingleSelect: Story = {
  render: () => {
    const [value, setValue] = createSignal('')
    return (
      <div class="max-w-sm">
        <ChoiceSelect
          label="Choose one"
          options={[
            { value: '1', label: 'Option 1' },
            { value: '2', label: 'Option 2' },
            { value: '3', label: 'Option 3' },
          ]}
          value={value()}
          onChange={(v) => setValue(v as string)}
        />
      </div>
    )
  },
}

/** Multi-select example */
export const MultiSelect: Story = {
  render: () => {
    const [value, setValue] = createSignal<string[]>([])
    return (
      <div class="max-w-sm">
        <ChoiceSelect
          label="Choose multiple"
          multiple
          options={[
            { value: '1', label: 'Option 1' },
            { value: '2', label: 'Option 2' },
            { value: '3', label: 'Option 3' },
            { value: '4', label: 'Option 4' },
          ]}
          value={value()}
          onChange={(v) => setValue(v as string[])}
        />
      </div>
    )
  },
}

/** Grid layout with 2 columns */
export const TwoColumns: Story = {
  render: () => {
    const [value, setValue] = createSignal('')
    return (
      <div class="max-w-md">
        <ChoiceSelect
          label="Grid layout"
          columns={2}
          options={[
            { value: '1', label: 'Yes' },
            { value: '2', label: 'No' },
            { value: '3', label: 'Maybe' },
            { value: '4', label: 'Not sure' },
          ]}
          value={value()}
          onChange={(v) => setValue(v as string)}
        />
      </div>
    )
  },
}

/** Longer labels */
export const LongLabels: Story = {
  render: () => {
    const [value, setValue] = createSignal('')
    return (
      <div class="max-w-sm">
        <ChoiceSelect
          label="Preferences"
          options={[
            { value: 'never', label: 'Never' },
            { value: 'sometimes', label: 'Sometimes' },
            { value: 'often', label: 'Often' },
            { value: 'always', label: 'Always' },
          ]}
          value={value()}
          onChange={(v) => setValue(v as string)}
        />
      </div>
    )
  },
}
