import type { Component } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../types'
import { ChoiceSelect } from '@/ui/choice-select'
import { VisibilitySelect, type Visibility } from '@/components/visibility-select'

export interface RelationshipStatusStepData {
  relationshipStatus?: string
  relationshipStatusVisibility?: Visibility
}

const OPTIONS = [
  { value: '1', label: 'Single' },
  { value: '2', label: 'In a relationship' },
  { value: '3', label: 'Married' },
  { value: '4', label: 'Separated' },
  { value: '5', label: 'Divorced' },
]

export const RelationshipStatusStep: Component<StepComponentProps<RelationshipStatusStepData>> = (props) => {
  return (
    <div class="space-y-6">
      <ChoiceSelect
        options={OPTIONS}
        value={props.data.relationshipStatus || ''}
        onChange={(value) => props.onChange({ ...props.data, relationshipStatus: value as string })}
      />

      <div class="border-t border-border" />

      <VisibilitySelect
        value={props.data.relationshipStatusVisibility || 'match'}
        onChange={(value) => props.onChange({ ...props.data, relationshipStatusVisibility: value })}
        label="Who can see this?"
      />
    </div>
  )
}

export const relationshipStatusStepMeta: StepMetadata = {
  id: 'relationship-status',
  title: "What's your relationship status?",
  required: false,
  validate: (data) => !!(data as unknown as RelationshipStatusStepData).relationshipStatus,
}
