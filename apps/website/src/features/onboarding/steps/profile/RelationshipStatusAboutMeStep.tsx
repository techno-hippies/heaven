import type { Component } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../../types'
import { ChoiceSelect } from '@/ui/choice-select'
import { VisibilitySelect, type Visibility } from '@/components/visibility-select'

export interface RelationshipStatusAboutMeStepData {
  relationshipStatus?: string
  relationshipStatusVisibility?: Visibility
}

const STATUS_OPTIONS = [
  { value: '1', label: 'Single' },
  { value: '2', label: 'Partnered' },
  { value: '3', label: 'Separated / In transition' },
  { value: '0', label: 'Prefer not to say' },
]

export const RelationshipStatusAboutMeStep: Component<StepComponentProps<RelationshipStatusAboutMeStepData>> = (props) => {
  return (
    <div class="space-y-6">
      <ChoiceSelect
        options={STATUS_OPTIONS}
        value={props.data.relationshipStatus || ''}
        onChange={(value) => props.onChange({ ...props.data, relationshipStatus: value as string })}
      />

      <VisibilitySelect
        value={props.data.relationshipStatusVisibility || 'match'}
        onChange={(value) => props.onChange({ ...props.data, relationshipStatusVisibility: value })}
      />
    </div>
  )
}

export const relationshipStatusAboutMeStepMeta: StepMetadata = {
  id: 'relationship-status-about-me',
  title: "What's your relationship status?",
  required: false,
  validate: (data) => !!(data as unknown as RelationshipStatusAboutMeStepData).relationshipStatus,
}
