import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { VisibilitySelect, type Visibility } from '@/components/ui/visibility-select'

const meta: Meta = {
  title: 'Survey/Question',
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj

/** Big 5: Extraversion */
export const Extraversion: Story = {
  render: () => {
    const [value, setValue] = createSignal('')
    const [visibility, setVisibility] = createSignal<Visibility>('public')

    return (
      <div class="w-[360px] space-y-6 p-4">
        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
            Personality
          </p>
          <h2 class="text-xl font-bold">How do you recharge?</h2>
          <p class="text-sm text-muted-foreground mt-1">
            This helps us find people with compatible social energy.
          </p>
        </div>

        <ChoiceSelect
          options={[
            { value: 'alone', label: 'Time alone' },
            { value: 'partner', label: 'Quiet time with partner' },
            { value: 'small', label: 'Small gatherings' },
            { value: 'social', label: 'Big social events' },
          ]}
          value={value()}
          onChange={(v) => setValue(v as string)}
        />

        <div>
          <p class="text-sm text-muted-foreground mb-2">Who can see this?</p>
          <VisibilitySelect value={visibility()} onChange={setVisibility} />
        </div>
      </div>
    )
  },
}

/** Big 5: Openness (scale) */
export const Openness: Story = {
  render: () => {
    const [value, setValue] = createSignal('')
    const [visibility, setVisibility] = createSignal<Visibility>('match')

    return (
      <div class="w-[360px] space-y-6 p-4">
        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
            Personality
          </p>
          <h2 class="text-xl font-bold">How spontaneous are you?</h2>
          <p class="text-sm text-muted-foreground mt-1">
            Do you prefer routine or adventure?
          </p>
        </div>

        <ChoiceSelect
          options={[
            { value: '1', label: 'Love routines' },
            { value: '2', label: 'Mostly planned' },
            { value: '3', label: 'Balanced' },
            { value: '4', label: 'Mostly spontaneous' },
            { value: '5', label: 'Very spontaneous' },
          ]}
          value={value()}
          onChange={(v) => setValue(v as string)}
        />

        <div>
          <p class="text-sm text-muted-foreground mb-2">Who can see this?</p>
          <VisibilitySelect value={visibility()} onChange={setVisibility} />
        </div>
      </div>
    )
  },
}

/** Attachment Style (matchOnly default) */
export const AttachmentStyle: Story = {
  render: () => {
    const [value, setValue] = createSignal('')
    const [visibility, setVisibility] = createSignal<Visibility>('match')

    return (
      <div class="w-[360px] space-y-6 p-4">
        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
            Relationship
          </p>
          <h2 class="text-xl font-bold">What's your attachment style?</h2>
          <p class="text-sm text-muted-foreground mt-1">
            Understanding attachment helps find compatible partners.
          </p>
        </div>

        <ChoiceSelect
          options={[
            { value: 'secure', label: 'Secure' },
            { value: 'anxious', label: 'Anxious' },
            { value: 'avoidant', label: 'Avoidant' },
            { value: 'fearful', label: 'Fearful-avoidant' },
            { value: 'unsure', label: 'Not sure' },
          ]}
          value={value()}
          onChange={(v) => setValue(v as string)}
        />

        <div>
          <p class="text-sm text-muted-foreground mb-2">Who can see this?</p>
          <VisibilitySelect value={visibility()} onChange={setVisibility} />
        </div>
      </div>
    )
  },
}

/** Love Languages (multi-select) */
export const LoveLanguages: Story = {
  render: () => {
    const [value, setValue] = createSignal<string[]>([])
    const [visibility, setVisibility] = createSignal<Visibility>('public')

    return (
      <div class="w-[360px] space-y-6 p-4">
        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
            Love Languages
          </p>
          <h2 class="text-xl font-bold">How do you express love?</h2>
          <p class="text-sm text-muted-foreground mt-1">
            Select all that apply.
          </p>
        </div>

        <ChoiceSelect
          multiple
          options={[
            { value: 'words', label: 'Words of affirmation' },
            { value: 'acts', label: 'Acts of service' },
            { value: 'gifts', label: 'Receiving gifts' },
            { value: 'time', label: 'Quality time' },
            { value: 'touch', label: 'Physical touch' },
          ]}
          value={value()}
          onChange={(v) => setValue(v as string[])}
        />

        <div>
          <p class="text-sm text-muted-foreground mb-2">Who can see this?</p>
          <VisibilitySelect value={visibility()} onChange={setVisibility} />
        </div>
      </div>
    )
  },
}
