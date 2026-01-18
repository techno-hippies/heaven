import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../../types'
import { LocationSearch, type LocationResult } from '@/components/location-search'
import { VisibilitySelect, type Visibility } from '@/components/visibility-select'
import { Slider } from '@/ui/slider'

export interface RegionStepData {
  location?: LocationResult | null
  locationVisibility?: Visibility
  /** Search radius in km from primary location */
  radiusKm?: number
}

const MIN_RADIUS = 5
const MAX_RADIUS = 200
const DEFAULT_RADIUS = 50

export const RegionStep: Component<StepComponentProps<RegionStepData>> = (props) => {
  const radius = () => props.data.radiusKm ?? DEFAULT_RADIUS

  return (
    <div class="space-y-6">
      <LocationSearch
        value={props.data.location}
        onChange={(location) => props.onChange({ ...props.data, location })}
        placeholder="Search your city or area..."
      />

      {/* Radius slider - only show after location is selected */}
      <Show when={props.data.location}>
        <div class="space-y-3">
          <div class="text-center">
            <p class="text-3xl font-bold text-foreground">{radius()} km</p>
            <p class="text-base text-muted-foreground">search radius</p>
          </div>
          <Slider
            min={MIN_RADIUS}
            max={MAX_RADIUS}
            step={5}
            value={radius()}
            onChange={(value) => props.onChange({ ...props.data, radiusKm: value })}
          />
          <div class="flex justify-between text-xs text-muted-foreground">
            <span>{MIN_RADIUS} km</span>
            <span>{MAX_RADIUS} km</span>
          </div>
        </div>
      </Show>

      <VisibilitySelect
        value={props.data.locationVisibility || 'public'}
        onChange={(value) => props.onChange({ ...props.data, locationVisibility: value })}
      />
    </div>
  )
}

export const regionStepMeta: StepMetadata = {
  id: 'region',
  title: 'Where are you based?',
  required: true,
  validate: (data) => {
    const d = data as unknown as RegionStepData
    return !!d.location
  },
}
