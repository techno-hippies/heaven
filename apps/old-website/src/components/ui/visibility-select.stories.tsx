import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { VisibilitySelect, type Visibility } from './visibility-select'
import { ChoiceSelect } from './choice-select'
import { GENDER_IDENTITY_LABELS } from '@/components/profile/ProfileBadge'

const meta: Meta<typeof VisibilitySelect> = {
  title: 'UI/VisibilitySelect',
  component: VisibilitySelect,
  decorators: [
    (Story) => (
      <div class="max-w-sm p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof VisibilitySelect>

const toOptions = (labels: Record<number, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))

/** Public selected */
export const Public: Story = {
  args: {
    value: 'public',
  },
}

/** Match selected */
export const Match: Story = {
  args: {
    value: 'match',
  },
}

/** Private selected */
export const Private: Story = {
  args: {
    value: 'private',
  },
}

/** Interactive */
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = createSignal<Visibility>('public')
    return <VisibilitySelect value={value()} onChange={setValue} />
  },
}

/** Gender field with visibility */
export const GenderWithVisibility: Story = {
  render: () => {
    const [gender, setGender] = createSignal('')
    const [visibility, setVisibility] = createSignal<Visibility>('public')

    return (
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold text-foreground mb-4">Gender</h3>
          <ChoiceSelect
            options={toOptions(GENDER_IDENTITY_LABELS)}
            value={gender()}
            onChange={(v) => setGender(v as string)}
          />
        </div>

        <div>
          <h4 class="text-sm font-medium text-muted-foreground mb-2">Who can see this?</h4>
          <VisibilitySelect value={visibility()} onChange={setVisibility} />
        </div>
      </div>
    )
  },
}
