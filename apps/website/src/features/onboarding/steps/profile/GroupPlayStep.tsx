import type { Component } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../../types'
import { ChoiceSelect } from '@/ui/choice-select'
import { VisibilitySelect, type Visibility } from '@/components/visibility-select'

export interface GroupPlayStepData {
  groupPlay?: string
  groupPlayVisibility?: Visibility
}

const GROUP_PLAY_OPTIONS = [
  { value: 'yes', label: 'Yes, interested' },
  { value: 'sometimes', label: 'Sometimes / situational' },
  { value: 'no', label: 'Not for me' },
  { value: 'curious', label: 'Curious to explore' },
  { value: 'prefer-not-say', label: 'Prefer not to say' },
]

export const GroupPlayStep: Component<StepComponentProps<GroupPlayStepData>> = (props) => {
  return (
    <div class="space-y-6">
      <ChoiceSelect
        options={GROUP_PLAY_OPTIONS}
        value={props.data.groupPlay || ''}
        onChange={(value) => props.onChange({ ...props.data, groupPlay: value as string })}
      />

      <VisibilitySelect
        value={props.data.groupPlayVisibility || 'match'}
        onChange={(value) => props.onChange({ ...props.data, groupPlayVisibility: value })}
      />
    </div>
  )
}

export const groupPlayStepMeta: StepMetadata = {
  id: 'group-play',
  title: 'Are you open to group experiences?',
  required: false,
  validate: (data) => {
    const d = data as unknown as GroupPlayStepData
    return !!d.groupPlay
  },
}
