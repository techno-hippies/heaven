import type { Component } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../types'
import { ChoiceSelect } from '@/ui/choice-select'
import { StrictFilter } from '@/components/strict-filter'

export interface RelationshipStructurePrefStepData {
  relationshipStylePreferences?: string[]
  relationshipStyleStrict?: boolean
}

const PREFERENCE_OPTIONS = [
  { value: '1', label: 'Monogamous' },
  { value: '2', label: 'Non-monogamous' },
]

export const RelationshipStructurePrefStep: Component<StepComponentProps<RelationshipStructurePrefStepData>> = (props) => {
  return (
    <div class="space-y-6">
      <ChoiceSelect
        multiple
        options={PREFERENCE_OPTIONS}
        value={props.data.relationshipStylePreferences || []}
        onChange={(value) => props.onChange({ ...props.data, relationshipStylePreferences: value as string[] })}
      />

      <StrictFilter
        enabled={props.data.relationshipStyleStrict || false}
        onChange={(value) => props.onChange({ ...props.data, relationshipStyleStrict: value })}
      />
    </div>
  )
}

export const relationshipStructurePrefStepMeta: StepMetadata = {
  id: 'relationship-structure-pref',
  title: 'What are you open to?',
  subtitle: 'Select all that apply',
  required: false,
  validate: (data) => {
    const d = data as unknown as RelationshipStructurePrefStepData
    return (d.relationshipStylePreferences?.length ?? 0) > 0
  },
}
