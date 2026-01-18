import type { Component } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../../types'
import { ChoiceSelect } from '@/ui/choice-select'
import { VisibilitySelect, type Visibility } from '@/components/visibility-select'

export interface FamilyPlansStepData {
  familyPlans?: string
  familyPlansVisibility?: Visibility
}

const FAMILY_PLANS_OPTIONS = [
  { value: 'yes', label: 'Yes, I want children' },
  { value: 'no', label: "No, I don't want children" },
  { value: 'open', label: 'Open to it' },
  { value: 'not-sure', label: 'Not sure yet' },
  { value: 'prefer-not-say', label: 'Prefer not to say' },
]

export const FamilyPlansStep: Component<StepComponentProps<FamilyPlansStepData>> = (props) => {
  return (
    <div class="space-y-6">
      <ChoiceSelect
        options={FAMILY_PLANS_OPTIONS}
        value={props.data.familyPlans || ''}
        onChange={(value) => props.onChange({ ...props.data, familyPlans: value as string })}
      />

      <VisibilitySelect
        value={props.data.familyPlansVisibility || 'match'}
        onChange={(value) => props.onChange({ ...props.data, familyPlansVisibility: value })}
      />
    </div>
  )
}

export const familyPlansStepMeta: StepMetadata = {
  id: 'family-plans',
  title: 'Do you want children?',
  required: false,
  validate: (data) => {
    const d = data as unknown as FamilyPlansStepData
    return !!d.familyPlans
  },
}
