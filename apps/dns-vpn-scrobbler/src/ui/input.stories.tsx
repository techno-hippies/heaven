import type { Meta, StoryObj } from 'storybook-solidjs'
import { Input, Textarea, InputWithCopy, InputWithSuffix, InputStatus } from './input'
import { Spinner } from './spinner'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: 'Enter your name...',
  },
}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'your@email.com',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
}

export const TextareaStory: StoryObj<typeof Textarea> = {
  render: () => (
    <Textarea placeholder="Tell us about yourself..." />
  ),
}

export const FormExample: Story = {
  render: () => (
    <div class="space-y-4 w-80">
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">Username</label>
        <Input placeholder="@username" />
      </div>
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">Email</label>
        <Input type="email" placeholder="you@example.com" />
      </div>
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">Bio</label>
        <Textarea placeholder="Write something about yourself..." />
      </div>
    </div>
  ),
}

// InputWithCopy stories
export const CopyableCode: StoryObj<typeof InputWithCopy> = {
  render: () => (
    <div class="w-80">
      <InputWithCopy value="NEO-X7K9M2" />
    </div>
  ),
}

export const CopyableUrl: StoryObj<typeof InputWithCopy> = {
  render: () => (
    <div class="w-96">
      <InputWithCopy value="https://heaven.app/u/sakura" />
    </div>
  ),
}

export const CopyableWallet: StoryObj<typeof InputWithCopy> = {
  render: () => (
    <div class="w-96">
      <InputWithCopy value="0x1234...abcd" />
    </div>
  ),
}

// InputWithSuffix stories
export const SuffixDefault: StoryObj<typeof InputWithSuffix> = {
  render: () => (
    <div class="w-80">
      <InputWithSuffix
        placeholder="yourname"
        suffix=".heaven"
      />
    </div>
  ),
}

export const SuffixValid: StoryObj<typeof InputWithSuffix> = {
  render: () => (
    <div class="w-80">
      <InputWithSuffix
        value="aurora"
        suffix=".heaven"
        state="valid"
      />
    </div>
  ),
}

export const SuffixInvalid: StoryObj<typeof InputWithSuffix> = {
  render: () => (
    <div class="w-80">
      <InputWithSuffix
        value="admin"
        suffix=".heaven"
        state="invalid"
      />
    </div>
  ),
}

export const SuffixStar: StoryObj<typeof InputWithSuffix> = {
  render: () => (
    <div class="w-80">
      <InputWithSuffix
        value="aurora"
        suffix=".⭐"
        state="valid"
      />
    </div>
  ),
}

// InputStatus stories
export const StatusIdle: StoryObj<typeof InputStatus> = {
  render: () => <InputStatus state="idle" />,
}

export const StatusChecking: StoryObj<typeof InputStatus> = {
  render: () => <InputStatus state="checking" />,
}

export const StatusValid: StoryObj<typeof InputStatus> = {
  render: () => <InputStatus state="valid" />,
}

export const StatusInvalid: StoryObj<typeof InputStatus> = {
  render: () => <InputStatus state="invalid" />,
}

export const StatusCustomMessages: StoryObj<typeof InputStatus> = {
  render: () => (
    <div class="space-y-2">
      <InputStatus state="valid" validMessage="Username is free!" />
      <InputStatus state="invalid" invalidMessage="Already registered" />
    </div>
  ),
}

// Spinner stories
export const SpinnerSizes: StoryObj<typeof Spinner> = {
  render: () => (
    <div class="flex items-center gap-4">
      <div class="text-center">
        <Spinner size="xs" />
        <p class="text-xs text-muted-foreground mt-2">xs</p>
      </div>
      <div class="text-center">
        <Spinner size="sm" />
        <p class="text-xs text-muted-foreground mt-2">sm</p>
      </div>
      <div class="text-center">
        <Spinner size="md" />
        <p class="text-xs text-muted-foreground mt-2">md</p>
      </div>
    </div>
  ),
}
