import { type Component, onMount } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../../types'
import { RangeSlider } from '@/ui/range-slider'
import { StrictFilter } from '@/components/strict-filter'

export interface SeekingAgeStepData {
  ageMin?: number
  ageMax?: number
  ageStrict?: boolean
}

const MIN_AGE = 18
const MAX_AGE = 99
const DEFAULT_MIN = 18
const DEFAULT_MAX = 45

export const SeekingAgeStep: Component<StepComponentProps<SeekingAgeStepData>> = (props) => {
  // Persist defaults on mount if not already set
  onMount(() => {
    if (props.data.ageMin === undefined || props.data.ageMax === undefined) {
      props.onChange({
        ...props.data,
        ageMin: props.data.ageMin ?? DEFAULT_MIN,
        ageMax: props.data.ageMax ?? DEFAULT_MAX,
      })
    }
  })

  const ageMin = () => props.data.ageMin ?? DEFAULT_MIN
  const ageMax = () => props.data.ageMax ?? DEFAULT_MAX

  return (
    <div class="space-y-6">
      {/* Age range display */}
      <div class="text-center">
        <p class="text-4xl font-bold text-foreground">
          {ageMin()} - {ageMax()}
        </p>
        <p class="text-muted-foreground mt-1">years old</p>
      </div>

      <RangeSlider
        min={MIN_AGE}
        max={MAX_AGE}
        value={[ageMin(), ageMax()]}
        onChange={([min, max]) => props.onChange({ ...props.data, ageMin: min, ageMax: max })}
      />

      <StrictFilter
        enabled={props.data.ageStrict ?? true}
        onChange={(value) => props.onChange({ ...props.data, ageStrict: value })}
      />
    </div>
  )
}

export const seekingAgeStepMeta: StepMetadata = {
  id: 'seeking-age',
  title: 'Age range',
  required: true,
  validate: (data) => {
    const d = data as unknown as SeekingAgeStepData
    return d.ageMin !== undefined && d.ageMax !== undefined
  },
}
