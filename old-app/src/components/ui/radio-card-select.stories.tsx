import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { RadioCardSelect, type RadioCardOption } from './radio-card-select'
import { Icon } from '@/components/icons'

const meta: Meta<typeof RadioCardSelect> = {
  title: 'UI/RadioCardSelect',
  component: RadioCardSelect,
  decorators: [
    (Story) => (
      <div class="max-w-md p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof RadioCardSelect>

const simpleOptions: RadioCardOption[] = [
  { value: 'option1', label: 'Option One', description: 'Description for option one' },
  { value: 'option2', label: 'Option Two', description: 'Description for option two' },
  { value: 'option3', label: 'Option Three', description: 'Description for option three' },
]

const optionsWithIcons: RadioCardOption[] = [
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can see this',
    icon: <Icon name="lock-simple" class="w-4 h-4 text-muted-foreground" />,
  },
  {
    value: 'public',
    label: 'Public',
    description: 'Everyone can see this',
    icon: <Icon name="globe" class="w-4 h-4 text-muted-foreground" />,
  },
]

/** Default with first option selected */
export const Default: Story = {
  args: {
    options: simpleOptions,
    value: 'option1',
  },
}

/** With label and helper text */
export const WithLabel: Story = {
  args: {
    options: simpleOptions,
    value: 'option2',
    label: 'Choose an option',
    helperText: 'Select the option that best fits your needs',
  },
}

/** With icons */
export const WithIcons: Story = {
  args: {
    options: optionsWithIcons,
    value: 'private',
    label: 'Visibility',
  },
}

/** With warning message */
export const WithWarning: Story = {
  args: {
    options: simpleOptions,
    value: 'option1',
    label: 'Danger Zone',
    warning: 'Changing this setting may have unintended consequences.',
  },
}

/** Disabled state */
export const Disabled: Story = {
  args: {
    options: simpleOptions,
    value: 'option1',
    label: 'Disabled Select',
    disabled: true,
  },
}

/** With one option disabled */
export const PartiallyDisabled: Story = {
  args: {
    options: [
      { value: 'available', label: 'Available', description: 'This option is available' },
      {
        value: 'unavailable',
        label: 'Unavailable',
        description: 'This option is not available',
        disabled: true,
      },
    ],
    value: 'available',
    label: 'Mixed Availability',
  },
}

/** Interactive example */
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = createSignal('option1')
    return (
      <div class="space-y-4">
        <RadioCardSelect
          options={simpleOptions}
          value={value()}
          onChange={setValue}
          label="Interactive Select"
          helperText="Click to change selection"
        />
        <p class="text-sm text-muted-foreground">Selected: {value()}</p>
      </div>
    )
  },
}

/** Full example with all features */
export const FullExample: Story = {
  render: () => {
    const [value, setValue] = createSignal('private')
    return (
      <RadioCardSelect
        options={optionsWithIcons}
        value={value()}
        onChange={setValue}
        label="Data Sharing"
        helperText="Control who can access your information"
        warning="Changes take effect immediately and cannot be undone."
      />
    )
  },
}
