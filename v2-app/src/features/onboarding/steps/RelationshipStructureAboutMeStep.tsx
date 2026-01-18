import type { Component } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../types'
import { ChoiceSelect } from '@/ui/choice-select'
import { VisibilitySelect, type Visibility } from '@/components/visibility-select'

export interface RelationshipStructureAboutMeStepData {
  relationshipStyle?: string
  relationshipStyleVisibility?: Visibility
}

const STYLE_OPTIONS = [
  { value: '1', label: 'Monogamous' },
  { value: '2', label: 'Non-monogamous' },
]

export const RelationshipStructureAboutMeStep: Component<StepComponentProps<RelationshipStructureAboutMeStepData>> = (props) => {
  return (
    <div class="space-y-6">
      <ChoiceSelect
        options={STYLE_OPTIONS}
        value={props.data.relationshipStyle || ''}
        onChange={(value) => props.onChange({ ...props.data, relationshipStyle: value as string })}
      />

      <VisibilitySelect
        value={props.data.relationshipStyleVisibility || 'match'}
        onChange={(value) => props.onChange({ ...props.data, relationshipStyleVisibility: value })}
      />
    </div>
  )
}

export const relationshipStructureAboutMeStepMeta: StepMetadata = {
  id: 'relationship-structure-about-me',
  title: 'How do you date?',
  required: false,
  validate: (data) => {
    const d = data as unknown as RelationshipStructureAboutMeStepData
    return !!d.relationshipStyle
  },
}
