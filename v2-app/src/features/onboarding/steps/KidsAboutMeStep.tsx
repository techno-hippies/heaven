import type { Component } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../types'
import { ChoiceSelect } from '@/ui/choice-select'
import { VisibilitySelect, type Visibility } from '@/components/visibility-select'

export interface KidsAboutMeStepData {
  kidsStatus?: string
  kidsVisibility?: Visibility
}

const STATUS_OPTIONS = [
  { value: '1', label: "Don't have children" },
  { value: '2', label: 'Have children' },
  { value: '0', label: 'Prefer not to say' },
]

export const KidsAboutMeStep: Component<StepComponentProps<KidsAboutMeStepData>> = (props) => {
  return (
    <div class="space-y-6">
      <ChoiceSelect
        options={STATUS_OPTIONS}
        value={props.data.kidsStatus || ''}
        onChange={(value) => props.onChange({ ...props.data, kidsStatus: value as string })}
      />

      <VisibilitySelect
        value={props.data.kidsVisibility || 'match'}
        onChange={(value) => props.onChange({ ...props.data, kidsVisibility: value })}
      />
    </div>
  )
}

export const kidsAboutMeStepMeta: StepMetadata = {
  id: 'kids-about-me',
  title: 'Do you have children?',
  required: false,
  validate: (data) => {
    const d = data as unknown as KidsAboutMeStepData
    return !!d.kidsStatus
  },
}
