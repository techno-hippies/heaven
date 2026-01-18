import { Component, createEffect, createSignal, Show, onCleanup } from 'solid-js'
import { Combobox } from '@kobalte/core/combobox'
import { Icon } from '@/icons'
import { IconButton } from '@/ui/icon-button'
import { Spinner } from '@/ui/spinner'
import { cn } from '@/lib/utils'

export interface LocationResult {
  provider: 'photon' | 'nominatim'
  osm_type: string
  osm_id: number
  label: string
  lat: number
  lng: number
  bbox?: [number, number, number, number] // [minLng, minLat, maxLng, maxLat]
  country_code?: string
}

export interface LocationSearchProps {
  value?: LocationResult | null
  onChange: (location: LocationResult | null) => void
  placeholder?: string
  class?: string
  showAttribution?: boolean
  /** Clear input after selection (useful for multi-add scenarios) */
  clearOnSelect?: boolean
}

// Simple query cache
const queryCache = new Map<string, { results: LocationResult[]; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Global throttle state
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1000 // 1 second between requests (Nominatim policy)

// Allowed place types - city-level only (no states/countries)
const ALLOWED_TYPES = new Set([
  'city',
  'town',
  'village',
  'municipality',
  'suburb',
  'district',
  'borough',
  'neighbourhood',
])

async function searchPhoton(
  query: string,
  signal: AbortSignal
): Promise<LocationResult[]> {
  // Check cache first
  const cached = queryCache.get(query)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.results
  }

  // Enforce global throttle
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    )
  }
  lastRequestTime = Date.now()

  const url = new URL('https://photon.komoot.io/api/')
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '10') // Fetch extra to filter

  const response = await fetch(url.toString(), {
    signal,
    headers: {
      'User-Agent': 'Neodate/1.0 (https://neodate.love)',
    },
  })

  if (!response.ok) {
    throw new Error(`Photon API error: ${response.status}`)
  }

  const data = await response.json()

  // Filter and normalize results
  const results: LocationResult[] = []
  for (const feature of data.features || []) {
    const props = feature.properties || {}
    const type = props.type || props.osm_value || ''

    // Filter to city/town/admin level only
    if (!ALLOWED_TYPES.has(type)) continue

    const [lng, lat] = feature.geometry?.coordinates || [0, 0]

    // Build display label (deduplicate if name == state)
    const parts: string[] = []
    if (props.name) parts.push(props.name)
    if (props.state && props.state !== props.name) parts.push(props.state)
    if (props.country) parts.push(props.country)
    const label = parts.join(', ')

    if (!label || !lat || !lng) continue

    results.push({
      provider: 'photon',
      osm_type: props.osm_type || 'node',
      osm_id: props.osm_id || 0,
      label,
      lat,
      lng,
      bbox: feature.bbox,
      country_code: props.countrycode?.toLowerCase(),
    })

    if (results.length >= 6) break
  }

  // Cache results
  queryCache.set(query, { results, timestamp: Date.now() })

  return results
}

export const LocationSearch: Component<LocationSearchProps> = (props) => {
  const [query, setQuery] = createSignal('')
  const [results, setResults] = createSignal<LocationResult[]>([])
  const [isLoading, setIsLoading] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)
  const [isOpen, setIsOpen] = createSignal(false)

  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  let abortController: AbortController | undefined
  const doSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    // Cancel previous request
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    setIsLoading(true)
    setError(null)

    try {
      const searchResults = await searchPhoton(searchQuery, abortController.signal)
      setResults(searchResults)
      // Open dropdown when results arrive
      if (searchResults.length > 0) {
        setIsOpen(true)
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Search failed. Please try again.')
        console.error('Location search error:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInput = (value: string) => {
    setQuery(value)

    // Clear previous debounce
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Debounce search (300ms)
    debounceTimer = setTimeout(() => {
      doSearch(value)
    }, 300)
  }

  const handleSelect = (location: LocationResult) => {
    setQuery(props.clearOnSelect ? '' : location.label)
    setResults([])
    setIsOpen(false)
    props.onChange(location)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    props.onChange(null)
  }

  // Cleanup on unmount
  onCleanup(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
    if (abortController) abortController.abort()
  })

  createEffect(() => {
    if (props.value === null) {
      setQuery('')
    } else if (props.value && props.value.label !== query()) {
      setQuery(props.value.label)
    }
  })

  const handleComboboxChange = (location: LocationResult | null) => {
    if (!location) {
      handleClear()
      return
    }
    handleSelect(location)
  }

  const showAttribution = () => props.showAttribution ?? true

  return (
    <div class={cn('relative', props.class)}>
      <Combobox<LocationResult>
        options={results()}
        optionValue={(option) => `${option.provider}:${option.osm_id}`}
        optionTextValue="label"
        optionLabel="label"
        placeholder={props.placeholder || 'Search city or area...'}
        value={props.value ?? null}
        onChange={handleComboboxChange}
        onInputChange={handleInput}
        open={isOpen()}
        onOpenChange={setIsOpen}
        triggerMode="input"
        allowsEmptyCollection={false}
        defaultFilter={() => true}
        itemComponent={(itemProps) => (
          <Combobox.Item
            item={itemProps.item}
            class={cn(
              'px-3 py-2 text-left text-base transition-colors flex items-center gap-2',
              'cursor-pointer outline-none',
              'data-[highlighted]:bg-accent data-[selected]:bg-accent/70'
            )}
          >
            <Icon
              name="map-pin"
              class="text-muted-foreground text-[18px] flex-shrink-0"
            />
            <Combobox.ItemLabel class="truncate">
              {itemProps.item.rawValue.label}
            </Combobox.ItemLabel>
          </Combobox.Item>
        )}
      >
        <Combobox.Control
          class={cn(
            'flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3',
            'border border-transparent focus-within:ring-2 focus-within:ring-ring',
            'focus-within:border-primary/50 transition-all duration-200'
          )}
        >
          <Combobox.Input
            value={query()}
            class="flex-1 min-w-0 bg-transparent text-base text-foreground placeholder:text-muted-foreground leading-6 focus:outline-none"
          />
          {/* Fixed-size container to prevent layout shift */}
          <div class="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <Show when={isLoading()}>
              <Spinner size="sm" />
            </Show>
            <Show when={!isLoading() && (query() || props.value)}>
              <IconButton
                icon="x"
                label="Clear location"
                size="sm"
                variant="ghost"
                onClick={handleClear}
              />
            </Show>
          </div>
        </Combobox.Control>

        <Combobox.Portal>
          <Combobox.Content
            class={cn(
              'z-[100] mt-1 rounded-lg border border-border bg-background shadow-lg',
              'w-[var(--kb-popper-anchor-width)] overflow-hidden'
            )}
          >
            <Combobox.Listbox class="py-1 max-h-64 overflow-y-auto" />
            <Show when={showAttribution()}>
              <div class="px-3 py-1.5 bg-muted/50 border-t border-border">
                <p class="text-xs text-muted-foreground">
                  Data ©{' '}
                  <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="underline"
                  >
                    OpenStreetMap
                  </a>{' '}
                  contributors
                </p>
              </div>
            </Show>
          </Combobox.Content>
        </Combobox.Portal>
      </Combobox>

      <Show when={error()}>
        <p class="text-base text-destructive mt-1">{error()}</p>
      </Show>
    </div>
  )
}
