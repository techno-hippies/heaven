import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { Select, MultiSelect } from './Select'

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const basicOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
]

const smokingOptions = [
  { value: 0, label: 'Non-smoker' },
  { value: 1, label: 'Social smoker' },
  { value: 2, label: 'Regular smoker' },
  { value: 3, label: 'Trying to quit' },
]

const relationshipOptions = [
  { value: 1, label: 'Strictly monogamous', description: 'One partner only' },
  { value: 2, label: 'Mostly monogamous', description: 'Open to exceptions' },
  { value: 3, label: 'Open relationship', description: 'Emotionally exclusive, sexually open' },
  { value: 4, label: 'Polyamorous', description: 'Multiple romantic relationships' },
  { value: 5, label: 'Relationship anarchy', description: 'No hierarchy or rules' },
]

const kidsOptions = [
  { value: 1, label: "Don't have, don't want" },
  { value: 2, label: "Don't have, want someday" },
  { value: 3, label: "Don't have, open to it" },
  { value: 4, label: 'Have kids' },
  { value: 5, label: 'Have kids, want more' },
]

export const Default: Story = {
  args: {
    options: basicOptions,
    placeholder: 'Select a fruit...',
  },
}

export const WithLabel: Story = {
  args: {
    options: smokingOptions,
    label: 'Smoking',
    placeholder: 'Select your preference...',
  },
}

export const WithDescriptions: Story = {
  args: {
    options: relationshipOptions,
    label: 'Relationship Style',
    placeholder: 'What are you looking for?',
  },
}

export const WithError: Story = {
  args: {
    options: kidsOptions,
    label: 'Kids',
    placeholder: 'Select...',
    error: 'This field is required',
  },
}

export const Disabled: Story = {
  args: {
    options: basicOptions,
    placeholder: 'Disabled select',
    disabled: true,
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = createSignal<string | number>('')
    return (
      <div class="w-64 space-y-4">
        <Select
          options={smokingOptions}
          label="Smoking"
          value={value()}
          onChange={setValue}
          placeholder="Select..."
        />
        <p class="text-sm text-muted-foreground">
          Selected: {value() || 'none'}
        </p>
      </div>
    )
  },
}

// MultiSelect stories
export const MultiSelectDefault: StoryObj<typeof MultiSelect> = {
  render: () => (
    <div class="w-80">
      <MultiSelect
        options={[
          { value: 'serious', label: 'Serious relationship' },
          { value: 'casual', label: 'Casual dating' },
          { value: 'friends', label: 'New friends' },
          { value: 'unsure', label: 'Not sure yet' },
        ]}
        label="What are you looking for?"
        placeholder="Select all that apply..."
      />
    </div>
  ),
}

export const MultiSelectWithMax: StoryObj<typeof MultiSelect> = {
  render: () => (
    <div class="w-80">
      <MultiSelect
        options={[
          { value: 'hiking', label: 'Hiking' },
          { value: 'cooking', label: 'Cooking' },
          { value: 'gaming', label: 'Gaming' },
          { value: 'music', label: 'Music' },
          { value: 'travel', label: 'Travel' },
          { value: 'fitness', label: 'Fitness' },
          { value: 'reading', label: 'Reading' },
          { value: 'art', label: 'Art' },
        ]}
        label="Interests (max 3)"
        placeholder="Select up to 3..."
        max={3}
      />
    </div>
  ),
}

export const MultiSelectControlled: StoryObj<typeof MultiSelect> = {
  render: () => {
    const [values, setValues] = createSignal<(string | number)[]>([])
    return (
      <div class="w-80 space-y-4">
        <MultiSelect
          options={kidsOptions}
          label="Compatible with"
          value={values()}
          onChange={setValues}
          placeholder="Select preferences..."
        />
        <p class="text-sm text-muted-foreground">
          Selected: {values().length > 0 ? values().join(', ') : 'none'}
        </p>
      </div>
    )
  },
}

export const PreferenceForm: Story = {
  render: () => (
    <div class="w-80 space-y-6 p-6 rounded-xl bg-card">
      <h3 class="text-lg font-semibold">Your Preferences</h3>
      <Select
        options={smokingOptions}
        label="Smoking"
        placeholder="Select..."
      />
      <Select
        options={relationshipOptions}
        label="Relationship Style"
        placeholder="Select..."
      />
      <Select
        options={kidsOptions}
        label="Kids"
        placeholder="Select..."
      />
      <MultiSelect
        options={[
          { value: 'serious', label: 'Serious relationship' },
          { value: 'casual', label: 'Casual dating' },
          { value: 'friends', label: 'New friends' },
        ]}
        label="Looking For"
        placeholder="Select all that apply..."
      />
    </div>
  ),
}
