import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { ChoiceSelect } from './choice-select'
import {
  GENDER_IDENTITY_LABELS,
  LOOKING_FOR_LABELS,
  SMOKING_LABELS,
  DRINKING_LABELS,
  BODY_BUCKET_LABELS,
  FITNESS_BUCKET_LABELS,
  KIDS_LABELS,
  KIDS_TIMELINE_LABELS,
  RELATIONSHIP_STRUCTURE_LABELS,
  RELIGION_LABELS,
  KINK_LEVEL_LABELS,
} from '@/components/profile/ProfileBadge'

const meta: Meta<typeof ChoiceSelect> = {
  title: 'UI/ChoiceSelect',
  component: ChoiceSelect,
}

export default meta
type Story = StoryObj<typeof ChoiceSelect>

/** Helper to convert label map to options */
const toOptions = (labels: Record<number, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))

/** Gender Identity (Directory.sol) */
export const GenderIdentity: Story = {
  render: () => {
    const [value, setValue] = createSignal('')
    return (
      <div class="max-w-sm">
        <ChoiceSelect
          label="Gender"
          options={toOptions(GENDER_IDENTITY_LABELS)}
          value={value()}
          onChange={(v) => setValue(v as string)}
        />
      </div>
    )
  },
}

/** Looking For (Directory.sol) */
export const LookingFor: Story = {
  render: () => {
    const [value, setValue] = createSignal<string[]>([])
    return (
      <div class="max-w-sm">
        <ChoiceSelect
          label="Looking for"
          multiple
          options={toOptions(LOOKING_FOR_LABELS)}
          value={value()}
          onChange={(v) => setValue(v as string[])}
        />
      </div>
    )
  },
}

/** Smoking (Directory.sol) */
export const Smoking: Story = {
  render: () => {
    const [value, setValue] = createSignal('')
    return (
      <div class="max-w-sm">
        <ChoiceSelect
          label="Smoking"
          options={toOptions(SMOKING_LABELS)}
          value={value()}
          onChange={(v) => setValue(v as string)}
        />
      </div>
    )
  },
}

/** Drinking (Directory.sol) */
export const Drinking: Story = {
  render: () => {
    const [value, setValue] = createSignal('')
    return (
      <div class="max-w-sm">
        <ChoiceSelect
          label="Drinking"
          options={toOptions(DRINKING_LABELS)}
          value={value()}
          onChange={(v) => setValue(v as string)}
        />
      </div>
    )
  },
}

/** Body Type (Directory.sol) */
export const BodyType: Story = {
  render: () => {
    const [value, setValue] = createSignal('')
    return (
      <div class="max-w-sm">
        <ChoiceSelect
          label="Body type"
          options={toOptions(BODY_BUCKET_LABELS)}
          value={value()}
          onChange={(v) => setValue(v as string)}
        />
      </div>
    )
  },
}

/** Fitness Level (Directory.sol) */
export const FitnessLevel: Story = {
  render: () => {
    const [value, setValue] = createSignal('')
    return (
      <div class="max-w-sm">
        <ChoiceSelect
          label="Fitness level"
          options={toOptions(FITNESS_BUCKET_LABELS)}
          value={value()}
          onChange={(v) => setValue(v as string)}
        />
      </div>
    )
  },
}

/** Kids (Dating.sol - private) */
export const Kids: Story = {
  render: () => {
    const [value, setValue] = createSignal('')
    return (
      <div class="max-w-sm">
        <ChoiceSelect
          label="Kids"
          options={toOptions(KIDS_LABELS)}
          value={value()}
          onChange={(v) => setValue(v as string)}
        />
      </div>
    )
  },
}

/** Kids Timeline (Dating.sol - private) */
export const KidsTimeline: Story = {
  render: () => {
    const [value, setValue] = createSignal('')
    return (
      <div class="max-w-sm">
        <ChoiceSelect
          label="Kids timeline"
          options={toOptions(KIDS_TIMELINE_LABELS)}
          value={value()}
          onChange={(v) => setValue(v as string)}
        />
      </div>
    )
  },
}

/** Relationship Structure (Dating.sol - private) */
export const RelationshipStructure: Story = {
  render: () => {
    const [value, setValue] = createSignal('')
    return (
      <div class="max-w-sm">
        <ChoiceSelect
          label="Relationship structure"
          options={toOptions(RELATIONSHIP_STRUCTURE_LABELS)}
          value={value()}
          onChange={(v) => setValue(v as string)}
        />
      </div>
    )
  },
}

/** Religion (Dating.sol - private) */
export const Religion: Story = {
  render: () => {
    const [value, setValue] = createSignal('')
    return (
      <div class="max-w-sm">
        <ChoiceSelect
          label="Religion"
          options={toOptions(RELIGION_LABELS)}
          value={value()}
          onChange={(v) => setValue(v as string)}
        />
      </div>
    )
  },
}

/** Kink Level (Dating.sol - private) */
export const KinkLevel: Story = {
  render: () => {
    const [value, setValue] = createSignal('')
    return (
      <div class="max-w-sm">
        <ChoiceSelect
          label="Kink level"
          options={toOptions(KINK_LEVEL_LABELS)}
          value={value()}
          onChange={(v) => setValue(v as string)}
        />
      </div>
    )
  },
}
