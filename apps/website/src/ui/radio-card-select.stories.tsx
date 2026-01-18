import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { RadioCardSelect, type RadioCardOption } from './radio-card-select'
import { Icon } from '@/icons'

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
  { value: 'option1', label: 'Option One' },
  { value: 'option2', label: 'Option Two' },
  { value: 'option3', label: 'Option Three' },
]

const visibilityOptions: RadioCardOption[] = [
  {
    value: 'public',
    label: 'Public',
    description: 'Shown on your profile',
    icon: <Icon name="globe" class="w-5 h-5" />,
  },
  {
    value: 'match',
    label: 'Shared with matches',
    description: 'Revealed after you match',
    icon: <Icon name="heart" class="w-5 h-5" />,
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only used for matching',
    icon: <Icon name="lock-simple" class="w-5 h-5" />,
  },
]

const tldOptions: RadioCardOption[] = [
  { value: 'heaven', label: '.heaven', metadata: 'Free' },
  { value: 'star', label: '.star', metadata: '$5' },
  { value: 'spiral', label: '.spiral', metadata: '$5' },
]

/** Default minimal options */
export const Default: Story = {
  render: () => {
    const [value, setValue] = createSignal('option1')
    return (
      <RadioCardSelect
        options={simpleOptions}
        value={value()}
        onChange={setValue}
      />
    )
  },
}

/** With label */
export const WithLabel: Story = {
  render: () => {
    const [value, setValue] = createSignal('option2')
    return (
      <RadioCardSelect
        options={simpleOptions}
        value={value()}
        onChange={setValue}
        label="Choose an option"
      />
    )
  },
}

/** Visibility selector with icons and descriptions */
export const Visibility: Story = {
  render: () => {
    const [value, setValue] = createSignal('public')
    return (
      <RadioCardSelect
        options={visibilityOptions}
        value={value()}
        onChange={setValue}
        label="Who can see this?"
      />
    )
  },
}

/** TLD selector with metadata */
export const TldSelect: Story = {
  render: () => {
    const [value, setValue] = createSignal('heaven')
    return (
      <RadioCardSelect
        options={tldOptions}
        value={value()}
        onChange={setValue}
        label="Choose your domain"
      />
    )
  },
}

/** Disabled state */
export const Disabled: Story = {
  render: () => {
    const [value, setValue] = createSignal('option1')
    return (
      <RadioCardSelect
        options={simpleOptions}
        value={value()}
        onChange={setValue}
        label="Disabled Select"
        disabled
      />
    )
  },
}

/** With one option disabled */
export const PartiallyDisabled: Story = {
  render: () => {
    const [value, setValue] = createSignal('available')
    return (
      <RadioCardSelect
        options={[
          { value: 'available', label: 'Available' },
          { value: 'unavailable', label: 'Unavailable', disabled: true },
        ]}
        value={value()}
        onChange={setValue}
        label="Mixed Availability"
      />
    )
  },
}
