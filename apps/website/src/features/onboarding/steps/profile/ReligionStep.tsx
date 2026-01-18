import type { Component } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../../types'
import { ChoiceSelect } from '@/ui/choice-select'
import { VisibilitySelect, type Visibility } from '@/components/visibility-select'

export interface ReligionStepData {
  religion?: string
  religionVisibility?: Visibility
}

const RELIGION_OPTIONS = [
  { value: 'christian', label: 'Christian' },
  { value: 'catholic', label: 'Catholic' },
  { value: 'jewish', label: 'Jewish' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'hindu', label: 'Hindu' },
  { value: 'buddhist', label: 'Buddhist' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-say', label: 'Prefer not to say' },
]

export const ReligionStep: Component<StepComponentProps<ReligionStepData>> = (props) => {
  return (
    <div class="space-y-6">
      <ChoiceSelect
        options={RELIGION_OPTIONS}
        value={props.data.religion || ''}
        onChange={(value) => props.onChange({ ...props.data, religion: value as string })}
        columns={2}
      />

      <VisibilitySelect
        value={props.data.religionVisibility || 'match'}
        onChange={(value) => props.onChange({ ...props.data, religionVisibility: value })}
      />
    </div>
  )
}

export const religionStepMeta: StepMetadata = {
  id: 'religion',
  title: 'What are your spiritual beliefs?',
  required: false,
  validate: (data) => {
    const d = data as unknown as ReligionStepData
    return !!d.religion
  },
}
