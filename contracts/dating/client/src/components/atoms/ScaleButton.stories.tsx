import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal, For } from 'solid-js'
import { ScaleButton } from './ScaleButton'

const meta = {
  title: 'Atoms/ScaleButton',
  component: ScaleButton,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div class="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScaleButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div class="flex gap-2">
      <ScaleButton selected={false} onClick={() => {}}>1</ScaleButton>
      <ScaleButton selected={false} onClick={() => {}}>2</ScaleButton>
      <ScaleButton selected={true} onClick={() => {}}>3</ScaleButton>
      <ScaleButton selected={false} onClick={() => {}}>4</ScaleButton>
      <ScaleButton selected={false} onClick={() => {}}>5</ScaleButton>
    </div>
  ),
}

export const NumericScale: Story = {
  render: () => {
    const [selected, setSelected] = createSignal(4)
    return (
      <div class="flex gap-2">
        <For each={[1, 2, 3, 4, 5, 6, 7]}>
          {(n) => (
            <ScaleButton selected={selected() === n} onClick={() => setSelected(n)}>
              {n}
            </ScaleButton>
          )}
        </For>
      </div>
    )
  },
}

export const KinkScale: Story = {
  render: () => {
    const [selected, setSelected] = createSignal(3)
    return (
      <div class="flex flex-col gap-4">
        <div class="flex gap-2">
          <For each={[1, 2, 3, 4, 5, 6, 7]}>
            {(n) => (
              <ScaleButton selected={selected() === n} onClick={() => setSelected(n)}>
                {n}
              </ScaleButton>
            )}
          </For>
        </div>
        <div class="flex justify-between text-base text-zinc-500 px-1">
          <span>Vanilla</span>
          <span>Open-minded</span>
          <span>Adventurous</span>
        </div>
      </div>
    )
  },
}

export const AgeRange: Story = {
  render: () => {
    const [selected, setSelected] = createSignal(2)
    const ranges = ['18-24', '25-29', '30-34', '35-39', '40-49', '50+']
    return (
      <div class="flex flex-wrap gap-2">
        <For each={ranges}>
          {(range, i) => (
            <ScaleButton
              selected={selected() === i()}
              onClick={() => setSelected(i())}
              class="flex-none w-[calc(33%-0.33rem)]"
            >
              {range}
            </ScaleButton>
          )}
        </For>
      </div>
    )
  },
}
