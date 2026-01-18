import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal, For } from 'solid-js'
import { OptionCard, OptionCardContent } from './OptionCard'

const meta = {
  title: 'Atoms/OptionCard',
  component: OptionCard,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div class="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OptionCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <OptionCard selected={false} onClick={() => {}}>
      <OptionCardContent title="Never" />
    </OptionCard>
  ),
}

export const Selected: Story = {
  render: () => (
    <OptionCard selected={true} onClick={() => {}}>
      <OptionCardContent title="Sometimes" description="A few times a month" />
    </OptionCard>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <OptionCard selected={false} onClick={() => {}}>
      <OptionCardContent
        title="Monogamous"
        description="One partner at a time, exclusive"
      />
    </OptionCard>
  ),
}

const SMOKING_OPTIONS = [
  { value: 1, title: 'Never', description: "I don't smoke" },
  { value: 2, title: 'Sometimes', description: 'Socially or occasionally' },
  { value: 3, title: 'Regularly', description: 'Daily smoker' },
]

export const SingleSelect: Story = {
  render: () => {
    const [selected, setSelected] = createSignal(1)
    return (
      <div class="flex flex-col gap-3">
        <For each={SMOKING_OPTIONS}>
          {(option) => (
            <OptionCard
              selected={selected() === option.value}
              onClick={() => setSelected(option.value)}
            >
              <OptionCardContent title={option.title} description={option.description} />
            </OptionCard>
          )}
        </For>
      </div>
    )
  },
}

const RELATIONSHIP_OPTIONS = [
  { value: 1, title: 'Strictly monogamous', description: 'One partner, fully exclusive' },
  { value: 2, title: 'Mostly monogamous', description: 'Primary partner with flexibility' },
  { value: 3, title: 'Open relationship', description: 'Committed but open to others' },
  { value: 4, title: 'Polyamorous', description: 'Multiple romantic relationships' },
  { value: 5, title: 'Figuring it out', description: 'Open to exploring' },
]

export const RelationshipStyle: Story = {
  render: () => {
    const [selected, setSelected] = createSignal(1)
    return (
      <div class="flex flex-col gap-3">
        <For each={RELATIONSHIP_OPTIONS}>
          {(option) => (
            <OptionCard
              selected={selected() === option.value}
              onClick={() => setSelected(option.value)}
            >
              <OptionCardContent title={option.title} description={option.description} />
            </OptionCard>
          )}
        </For>
      </div>
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <OptionCard selected={false} onClick={() => {}} disabled>
      <OptionCardContent title="Disabled option" description="Cannot select" />
    </OptionCard>
  ),
}
