import type { Component } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../../types'
import { Input } from '@/ui/input'

export interface AgeStepData {
  age?: string
}

export const AgeStep: Component<StepComponentProps<AgeStepData>> = (props) => {
  const handleInput = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement
    let value = target.value

    // Only allow numbers, max 2 digits
    value = value.replace(/\D/g, '').slice(0, 2)

    props.onChange({ age: value })
  }

  const isValid = () => {
    if (!props.data.age) return false
    const age = parseInt(props.data.age, 10)
    return age >= 18 && age <= 99
  }

  return (
    <div class="space-y-8">
      <div class="space-y-2">
        <Input
          type="text"
          inputmode="numeric"
          placeholder="18"
          value={props.data.age || ''}
          onInput={handleInput}
          class="text-center text-3xl font-bold"
        />
        {props.data.age && !isValid() && (
          <p class="text-base text-destructive text-center">
            Age must be between 18 and 99
          </p>
        )}
      </div>
    </div>
  )
}

export const ageStepMeta: StepMetadata = {
  id: 'age',
  title: "What's your age?",
  required: true,
  validate: (data) => {
    const stepData = data as unknown as AgeStepData
    if (!stepData?.age) return false
    const age = parseInt(stepData.age, 10)
    return age >= 18 && age <= 99
  },
}
