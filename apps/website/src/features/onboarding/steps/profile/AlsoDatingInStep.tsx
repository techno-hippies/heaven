import type { Component } from 'solid-js'
import { For, Show } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../../types'
import { LocationSearch, type LocationResult } from '@/components/location-search'
import { VisibilitySelect, type Visibility } from '@/components/visibility-select'
import { IconButton } from '@/ui/icon-button'

export interface AlsoDatingInStepData {
  additionalLocations?: LocationResult[]
  additionalLocationsVisibility?: Visibility
}

const MAX_LOCATIONS = 2

export const AlsoDatingInStep: Component<StepComponentProps<AlsoDatingInStepData>> = (props) => {
  const locations = () => props.data.additionalLocations || []
  const canAddMore = () => locations().length < MAX_LOCATIONS

  const locationKey = (l: LocationResult) => `${l.osm_type}-${l.osm_id}`

  const addLocation = (location: LocationResult) => {
    if (!canAddMore()) return
    // Avoid duplicates
    const existing = locations()
    if (existing.some(l => locationKey(l) === locationKey(location))) return
    props.onChange({
      ...props.data,
      additionalLocations: [...existing, location],
    })
  }

  const removeLocation = (location: LocationResult) => {
    props.onChange({
      ...props.data,
      additionalLocations: locations().filter(l => locationKey(l) !== locationKey(location)),
    })
  }

  return (
    <div class="space-y-6">
      {/* Location chips */}
      <Show when={locations().length > 0}>
        <div class="flex flex-wrap gap-2">
          <For each={locations()}>
            {(location) => (
              <div class="flex items-center gap-2 bg-muted rounded-full pl-4 pr-2 py-2">
                <span class="text-base font-medium">{location.label}</span>
                <IconButton
                  icon="x"
                  label="Remove"
                  size="sm"
                  onClick={() => removeLocation(location)}
                  class="h-6 w-6"
                />
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* Add location search */}
      <Show when={canAddMore()}>
        <LocationSearch
          value={null}
          onChange={(location) => {
            if (location) addLocation(location)
          }}
          placeholder="Search for a city..."
          clearOnSelect
        />
      </Show>


      <VisibilitySelect
        value={props.data.additionalLocationsVisibility || 'match'}
        onChange={(value) => props.onChange({ ...props.data, additionalLocationsVisibility: value })}
      />
    </div>
  )
}

export const alsoDatingInStepMeta: StepMetadata = {
  id: 'also-dating-in',
  title: 'Where else are you often?',
  subtitle: "Add up to 2 cities you'd also date in.",
  required: false,
  validate: () => true, // Optional step, always valid
}
