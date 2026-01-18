import type { Component } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../types'
import { ChoiceSelect } from '@/ui/choice-select'
import { VisibilitySelect, type Visibility } from '@/components/visibility-select'

export interface LookingForStepData {
  lookingFor?: string
  lookingForVisibility?: Visibility
}

const OPTIONS = [
  { value: '1', label: 'Casual' },
  { value: '2', label: 'Relationship' },
]

export const LookingForStep: Component<StepComponentProps<LookingForStepData>> = (props) => {
  return (
    <div class="space-y-6">
      <ChoiceSelect
        options={OPTIONS}
        value={props.data.lookingFor || ''}
        onChange={(value) => props.onChange({ ...props.data, lookingFor: value as string })}
      />

      <VisibilitySelect
        value={props.data.lookingForVisibility || 'public'}
        onChange={(value) => props.onChange({ ...props.data, lookingForVisibility: value })}
      />
    </div>
  )
}

export const lookingForStepMeta: StepMetadata = {
  id: 'looking-for',
  title: 'What are you looking for right now?',
  required: false,
  validate: (data) => !!(data as unknown as LookingForStepData).lookingFor,
}
