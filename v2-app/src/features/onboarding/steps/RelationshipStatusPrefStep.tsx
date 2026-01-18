import type { Component } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../types'
import { ChoiceSelect } from '@/ui/choice-select'
import { StrictFilter } from '@/components/strict-filter'

export interface RelationshipStatusPrefStepData {
  relationshipStatusPreferences?: string[]
  relationshipStatusStrict?: boolean
}

const PREFERENCE_OPTIONS = [
  { value: '1', label: 'Single' },
  { value: '2', label: 'Partnered' },
  { value: '3', label: 'Separated / In transition' },
]

export const RelationshipStatusPrefStep: Component<StepComponentProps<RelationshipStatusPrefStepData>> = (props) => {
  return (
    <div class="space-y-6">
      <ChoiceSelect
        multiple
        options={PREFERENCE_OPTIONS}
        value={props.data.relationshipStatusPreferences || []}
        onChange={(value) => props.onChange({ ...props.data, relationshipStatusPreferences: value as string[] })}
      />

      <StrictFilter
        enabled={props.data.relationshipStatusStrict || false}
        onChange={(value) => props.onChange({ ...props.data, relationshipStatusStrict: value })}
      />
    </div>
  )
}

export const relationshipStatusPrefStepMeta: StepMetadata = {
  id: 'relationship-status-pref',
  title: 'Who are you open to dating?',
  subtitle: 'Select all that apply',
  required: false,
  validate: (data) => {
    const d = data as unknown as RelationshipStatusPrefStepData
    return (d.relationshipStatusPreferences?.length ?? 0) > 0
  },
}
