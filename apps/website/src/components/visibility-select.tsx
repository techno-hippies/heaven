import { type Component } from 'solid-js'
import { RadioCardSelect, type RadioCardOption } from '@/ui/radio-card-select'

export type Visibility = 'public' | 'match' | 'private'

export interface VisibilitySelectProps {
  /** Current visibility */
  value: Visibility
  /** Called when visibility changes */
  onChange?: (value: Visibility) => void
  /** Optional label */
  label?: string
  /** Additional class names */
  class?: string
}

const OPTIONS: RadioCardOption<Visibility>[] = [
  {
    value: 'public',
    label: 'Public',
    description: 'Shown on your profile',
  },
  {
    value: 'match',
    label: 'Shared on match',
    description: 'Revealed after you match',
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only used for matching',
  },
]

export const VisibilitySelect: Component<VisibilitySelectProps> = (props) => {
  return (
    <RadioCardSelect<Visibility>
      options={OPTIONS}
      value={props.value}
      onChange={props.onChange}
      label={props.label}
      class={props.class}
    />
  )
}

export default VisibilitySelect
