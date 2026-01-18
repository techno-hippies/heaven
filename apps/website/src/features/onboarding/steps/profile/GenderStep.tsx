import type { Component } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../../types'
import { ChoiceSelect } from '@/ui/choice-select'
import { VisibilitySelect, type Visibility } from '@/components/visibility-select'

export interface GenderStepData {
  gender?: string
  genderVisibility?: Visibility
}

// Match contract: G_MAN=1, G_WOMAN=2, G_TRANS_MAN=3, G_TRANS_WOMAN=4, G_NON_BINARY=5
const GENDER_OPTIONS = [
  { value: '1', label: 'Man' },
  { value: '2', label: 'Woman' },
  { value: '3', label: 'Trans man' },
  { value: '4', label: 'Trans woman' },
  { value: '5', label: 'Non-binary' },
]

export const GenderStep: Component<StepComponentProps<GenderStepData>> = (props) => {
  return (
    <div class="space-y-6">
      <ChoiceSelect
        options={GENDER_OPTIONS}
        value={props.data.gender || ''}
        onChange={(value) => props.onChange({ ...props.data, gender: value as string })}
      />

      <VisibilitySelect
        value={props.data.genderVisibility || 'public'}
        onChange={(value) => props.onChange({ ...props.data, genderVisibility: value })}
      />
    </div>
  )
}

export const genderStepMeta: StepMetadata = {
  id: 'gender',
  title: "What's your gender?",
  required: true,
  validate: (data) => !!(data as unknown as GenderStepData).gender,
}
