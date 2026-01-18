import type { Component } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../types'
import { ChoiceSelect } from '@/ui/choice-select'
import { VisibilitySelect, type Visibility } from '@/components/visibility-select'
import { StrictFilter } from '@/components/strict-filter'

export interface RelationshipStructureStepData {
  relationshipStyle?: string
  relationshipStylePreference?: string
  relationshipStyleVisibility?: Visibility
  relationshipStyleStrict?: boolean
}

const STYLE_OPTIONS = [
  { value: '1', label: 'Monogamous' },
  { value: '2', label: 'Non-monogamous' },
  { value: '0', label: 'Prefer not to say' },
]

const PREFERENCE_OPTIONS = [
  { value: '1', label: 'Monogamous' },
  { value: '2', label: 'Non-monogamous' },
  { value: '0', label: 'Prefer not to say' },
]

export const RelationshipStructureStep: Component<StepComponentProps<RelationshipStructureStepData>> = (props) => {
  return (
    <div class="space-y-6">
      {/* About you */}
      <ChoiceSelect
        label="You are"
        options={STYLE_OPTIONS}
        value={props.data.relationshipStyle || ''}
        onChange={(value) => props.onChange({ ...props.data, relationshipStyle: value as string })}
      />

      <VisibilitySelect
        value={props.data.relationshipStyleVisibility || 'match'}
        onChange={(value) => props.onChange({ ...props.data, relationshipStyleVisibility: value })}
      />

      <div class="border-t border-border" />

      {/* Preference */}
      <ChoiceSelect
        label="Open to dating"
        options={PREFERENCE_OPTIONS}
        value={props.data.relationshipStylePreference || ''}
        onChange={(value) => props.onChange({ ...props.data, relationshipStylePreference: value as string })}
      />

      <StrictFilter
        enabled={props.data.relationshipStyleStrict || false}
        onChange={(value) => props.onChange({ ...props.data, relationshipStyleStrict: value })}
      />
    </div>
  )
}

export const relationshipStructureStepMeta: StepMetadata = {
  id: 'relationship-structure',
  title: 'Relationship style',
  required: false,
  validate: (data) => {
    const d = data as unknown as RelationshipStructureStepData
    return !!d.relationshipStyle || !!d.relationshipStylePreference
  },
}
