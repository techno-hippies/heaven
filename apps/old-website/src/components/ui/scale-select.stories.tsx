import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { ScaleSelect, type ScaleSelectProps } from './scale-select'

const meta: Meta<typeof ScaleSelect> = {
  title: 'UI/ScaleSelect',
  component: ScaleSelect,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'number', min: 1, max: 5 },
      description: 'Selected value',
    },
    range: {
      control: 'object',
      description: 'Min and max range [min, max]',
    },
    scaleLabels: {
      control: 'object',
      description: 'Labels for left and right ends',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Interactive wrapper
const ScaleSelectDemo = (props: ScaleSelectProps) => {
  const [value, setValue] = createSignal<number | null>(props.value)
  return (
    <div class="w-80">
      <ScaleSelect
        {...props}
        value={value()}
        onChange={(v) => setValue(v)}
      />
      <p class="mt-4 text-sm text-muted-foreground text-center">
        Selected: {value() !== null ? value() : 'None'}
      </p>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <ScaleSelectDemo
      value={null}
      range={[1, 5]}
      scaleLabels={['Low', 'High']}
    />
  ),
}

export const WithValue: Story = {
  render: () => (
    <ScaleSelectDemo
      value={3}
      range={[1, 5]}
      scaleLabels={['Very introverted', 'Very extroverted']}
    />
  ),
}

export const IntrovertExtrovert: Story = {
  render: () => (
    <ScaleSelectDemo
      value={null}
      range={[1, 5]}
      scaleLabels={['Very introverted', 'Very extroverted']}
    />
  ),
}

export const AffectionLevel: Story = {
  render: () => (
    <ScaleSelectDemo
      value={4}
      range={[1, 5]}
      scaleLabels={['Reserved', 'Very affectionate']}
    />
  ),
}

export const NoLabels: Story = {
  render: () => (
    <ScaleSelectDemo
      value={2}
      range={[1, 5]}
    />
  ),
}
