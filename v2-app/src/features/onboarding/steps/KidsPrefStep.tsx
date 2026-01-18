import type { Component } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../types'
import { ChoiceSelect } from '@/ui/choice-select'
import { StrictFilter } from '@/components/strict-filter'

export interface KidsPrefStepData {
  kidsPreference?: string
  kidsStrict?: boolean
}

const PREFERENCE_OPTIONS = [
  { value: '1', label: "Don't want children" },
  { value: '2', label: 'Want children' },
  { value: '3', label: 'Open to having children' },
]

export const KidsPrefStep: Component<StepComponentProps<KidsPrefStepData>> = (props) => {
  return (
    <div class="space-y-6">
      <ChoiceSelect
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

export const kidsPrefStepMeta: StepMetadata = {
  id: 'kids-pref',
  title: 'Do you want children?',
  required: false,
  validate: (data) => {
    const d = data as unknown as KidsPrefStepData
    return !!d.kidsPreference
  },
}
