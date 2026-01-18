import type { Component } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../../types'
import { ChoiceSelect } from '@/ui/choice-select'
import { StrictFilter } from '@/components/strict-filter'

export interface RelationshipStructurePrefStepData {
  /** Relationship structure preferences (can select multiple) */
  relationshipStructurePref?: string[]
  /** Strict filter - only show matching structures */
  relationshipStructureStrict?: boolean
}

const STRUCTURE_OPTIONS = [
  { value: 'mono', label: 'Monogamous' },
  { value: 'non-mono', label: 'Non-monogamous' },
]

export const RelationshipStructurePrefStep: Component<StepComponentProps<RelationshipStructurePrefStepData>> = (props) => {
  return (
    <div class="space-y-6">
      <ChoiceSelect
        multiple
        options={STRUCTURE_OPTIONS}
        value={props.data.relationshipStructurePref || []}
        onChange={(value) => props.onChange({ ...props.data, relationshipStructurePref: value as string[] })}
      />

      <StrictFilter
        enabled={props.data.relationshipStructureStrict ?? true}
        onChange={(value) => props.onChange({ ...props.data, relationshipStructureStrict: value })}
      />
    </div>
  )
}

export const relationshipStructurePrefStepMeta: StepMetadata = {
  id: 'relationship-structure-pref',
  title: 'What structure do you want?',
  required: true,
  validate: (data) => {
    const d = data as unknown as RelationshipStructurePrefStepData
    return (d.relationshipStructurePref?.length ?? 0) > 0
  },
}
