import type { Component } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../types'
import { ChoiceSelect } from '@/ui/choice-select'
import { VisibilitySelect, type Visibility } from '@/components/visibility-select'
import { StrictFilter } from '@/components/strict-filter'

export interface KidsStepData {
  kidsStatus?: string
  kidsPreference?: string
  kidsVisibility?: Visibility
  kidsStrict?: boolean
}

const STATUS_OPTIONS = [
  { value: '1', label: "Don't have children" },
  { value: '2', label: 'Have children' },
  { value: '0', label: 'Prefer not to say' },
]

const PREFERENCE_OPTIONS = [
  { value: '1', label: "Don't want children" },
  { value: '2', label: 'Want children' },
  { value: '3', label: 'Open to children' },
  { value: '0', label: 'Prefer not to say' },
]

export const KidsStep: Component<StepComponentProps<KidsStepData>> = (props) => {
  return (
    <div class="space-y-6">
      {/* About you */}
      <ChoiceSelect
        label="You"
        options={STATUS_OPTIONS}
        value={props.data.kidsStatus || ''}
        onChange={(value) => props.onChange({ ...props.data, kidsStatus: value as string })}
      />

      <VisibilitySelect
        value={props.data.kidsVisibility || 'match'}
        onChange={(value) => props.onChange({ ...props.data, kidsVisibility: value })}
      />

      <div class="border-t border-border" />

      {/* Preference */}
      <ChoiceSelect
        label="Open to"
        options={PREFERENCE_OPTIONS}
        value={props.data.kidsPreference || ''}
        onChange={(value) => props.onChange({ ...props.data, kidsPreference: value as string })}
      />

      <StrictFilter
        enabled={props.data.kidsStrict || false}
        onChange={(value) => props.onChange({ ...props.data, kidsStrict: value })}
      />
    </div>
  )
}

export const kidsStepMeta: StepMetadata = {
  id: 'kids',
  title: 'What about children?',
  required: false,
  validate: (data) => {
    const d = data as unknown as KidsStepData
    return !!d.kidsStatus || !!d.kidsPreference
  },
}
