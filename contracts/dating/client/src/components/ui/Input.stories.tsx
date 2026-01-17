import type { Meta, StoryObj } from 'storybook-solidjs'
import { Input, Textarea } from './Input'

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    hint: { control: 'text' },
    disabled: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search'],
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter your name...',
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    type: 'email',
  },
}

export const WithHint: Story = {
  args: {
    label: 'Username',
    placeholder: 'Choose a username',
    hint: 'This will be visible to other users',
  },
}

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
  },
}

export const WithIcon: Story = {
  args: {
    placeholder: 'Search profiles...',
    icon: (
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    iconPosition: 'left',
  },
}

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit this',
    disabled: true,
  },
}

export const TextareaDefault: StoryObj<typeof Textarea> = {
  render: () => (
    <Textarea
      label="Bio"
      placeholder="Tell us about yourself..."
      hint="Max 500 characters"
    />
  ),
}

export const TextareaWithError: StoryObj<typeof Textarea> = {
  render: () => (
    <Textarea
      label="Bio"
      placeholder="Tell us about yourself..."
      value="x"
      error="Bio must be at least 10 characters"
    />
  ),
}

export const FormExample: Story = {
  render: () => (
    <div class="w-[320px] space-y-4">
      <Input label="Display Name" placeholder="How should we call you?" />
      <Input label="Age" type="number" placeholder="18" min={18} max={99} />
      <Input
        label="Location"
        placeholder="City, Country"
        icon={
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        }
      />
      <Textarea label="About Me" placeholder="What makes you unique?" />
    </div>
  ),
}
