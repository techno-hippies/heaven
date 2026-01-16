import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { Toggle, SwitchGroup } from './Toggle'

const meta = {
  title: 'UI/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    description: { control: 'text' },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
    },
  },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithLabel: Story = {
  args: {
    label: 'Enable notifications',
  },
}

export const WithDescription: Story = {
  args: {
    label: 'Auto photo reveal',
    description: 'Automatically share photos with matches',
  },
}

export const Checked: Story = {
  args: {
    checked: true,
    label: 'Active',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled toggle',
  },
}

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
    label: 'Disabled but checked',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Small toggle',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Large toggle',
  },
}

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = createSignal(false)
    return (
      <div class="space-y-4">
        <Toggle
          checked={checked()}
          onChange={setChecked}
          label={checked() ? 'On' : 'Off'}
        />
        <p class="text-sm text-muted-foreground">
          Current value: {checked() ? 'true' : 'false'}
        </p>
      </div>
    )
  },
}

export const PrivacySettings: Story = {
  render: () => (
    <div class="w-[320px] space-y-1 rounded-xl bg-card p-4">
      <h3 class="text-lg font-semibold mb-4">Privacy Settings</h3>
      <div class="divide-y divide-border">
        <SwitchGroup
          label="Show age"
          description="Display your exact age or range"
        >
          <Toggle defaultChecked />
        </SwitchGroup>
        <SwitchGroup
          label="Show location"
          description="Let others see your city"
        >
          <Toggle defaultChecked />
        </SwitchGroup>
        <SwitchGroup
          label="Auto photo reveal"
          description="Share photos automatically on match"
        >
          <Toggle />
        </SwitchGroup>
        <SwitchGroup
          label="Read receipts"
          description="Show when you've read messages"
        >
          <Toggle />
        </SwitchGroup>
      </div>
    </div>
  ),
}
