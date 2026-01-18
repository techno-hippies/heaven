import type { Component } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../../types'
import { ChoiceSelect } from '@/ui/choice-select'

export interface InterestedInStepData {
  interestedIn?: string[]
}

// Same gender options as GenderStep, but for multi-select
// Contract bitmask: [4:nb][3:trans_women][2:cis_women][1:trans_men][0:cis_men]
const GENDER_OPTIONS = [
  { value: '1', label: 'Men' },
  { value: '2', label: 'Women' },
  { value: '3', label: 'Trans men' },
  { value: '4', label: 'Trans women' },
  { value: '5', label: 'Non-binary' },
]

export const InterestedInStep: Component<StepComponentProps<InterestedInStepData>> = (props) => {
  return (
    <div class="space-y-6">
      <ChoiceSelect
        multiple
        options={GENDER_OPTIONS}
        value={props.data.interestedIn || []}
        onChange={(value) => props.onChange({ interestedIn: value as string[] })}
      />
    </div>
  )
}

/**
 * Convert interestedIn array to contract bitmask
 * Contract: MASK_CIS_MEN=0x0001, MASK_TRANS_MEN=0x0002, MASK_CIS_WOMEN=0x0004, MASK_TRANS_WOMEN=0x0008, MASK_NON_BINARY=0x0010
 */
export function toDesiredMask(interestedIn: string[]): number {
  let mask = 0
  for (const value of interestedIn) {
    switch (value) {
      case '1': mask |= 0x0001; break // Men -> cis men
      case '2': mask |= 0x0004; break // Women -> cis women
      case '3': mask |= 0x0002; break // Trans men
      case '4': mask |= 0x0008; break // Trans women
      case '5': mask |= 0x0010; break // Non-binary
    }
  }
  return mask
}

export const interestedInStepMeta: StepMetadata = {
  id: 'interested-in',
  title: 'Who do you want to date?',
  subtitle: 'Select all that apply',
  required: true,
  validate: (data) => {
    const stepData = data as unknown as InterestedInStepData
    return Array.isArray(stepData?.interestedIn) && stepData.interestedIn.length > 0
  },
}
