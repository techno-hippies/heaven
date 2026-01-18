import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { LocationSearch, type LocationResult } from './location-search'

const meta = {
  title: 'Components/LocationSearch',
  component: LocationSearch,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof LocationSearch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [location, setLocation] = createSignal<LocationResult | null>(null)
    return (
      <div class="w-full max-w-md mx-auto space-y-4">
        <h3 class="text-lg font-semibold">Where are you based?</h3>
        <LocationSearch
          value={location()}
          onChange={setLocation}
          placeholder="Search city or area..."
        />
        <div class="p-4 bg-muted rounded-lg">
          <p class="text-xs text-muted-foreground mb-1">Selected:</p>
          <pre class="text-xs overflow-auto">{JSON.stringify(location(), null, 2)}</pre>
        </div>
      </div>
    )
  },
}

export const WithPreselected: Story = {
  render: () => {
    const [location, setLocation] = createSignal<LocationResult | null>({
      provider: 'photon',
      osm_type: 'relation',
      osm_id: 1682248,
      label: 'Zurich, Switzerland',
      lat: 47.3744489,
      lng: 8.5410422,
      country_code: 'ch',
    })
    return (
      <div class="w-full max-w-md mx-auto space-y-4">
        <h3 class="text-lg font-semibold">Where are you based?</h3>
        <LocationSearch
          value={location()}
          onChange={setLocation}
          placeholder="Search city or area..."
        />
        <div class="p-4 bg-muted rounded-lg">
          <p class="text-xs text-muted-foreground mb-1">Selected:</p>
          <pre class="text-xs overflow-auto">{JSON.stringify(location(), null, 2)}</pre>
        </div>
      </div>
    )
  },
}
