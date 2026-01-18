import { type Component, createEffect } from 'solid-js'
import { For, Show } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../../types'
import { InputStatus } from '@/ui/input'
import { cn } from '@/lib/utils'
import {
  useNameRegistry,
  TLD_INFO,
  type TldId,
} from '../../hooks/useNameRegistry'

export type NameStatus = 'idle' | 'checking' | 'valid' | 'invalid' | 'reserved' | 'too-short'

export interface NameStepData {
  name?: string
  tld?: TldId
  nameStatus?: NameStatus
}

export const NameStep: Component<StepComponentProps<NameStepData>> = (props) => {
  const registry = useNameRegistry({ initialTld: props.data?.tld || 'heaven' })

  // Sync with prop data on mount
  if (props.data?.name && !registry.name()) {
    registry.setName(props.data.name)
  }

  // Sync registry status to step data for validation
  createEffect(() => {
    const status = registry.status()
    if (status !== props.data.nameStatus) {
      props.onChange({ ...props.data, nameStatus: status })
    }
  })

  const handleNameChange = (value: string) => {
    registry.setName(value)
    props.onChange({ name: value, tld: registry.selectedTld(), nameStatus: registry.status() })
  }

  const handleTldChange = (tld: TldId) => {
    registry.setSelectedTld(tld)
    props.onChange({ name: registry.name(), tld, nameStatus: registry.status() })
  }

  const statusToInputState = () => {
    const s = registry.status()
    if (s === 'valid') return 'valid' as const
    if (s === 'invalid' || s === 'reserved') return 'invalid' as const
    if (s === 'checking') return 'checking' as const
    return 'idle' as const
  }

  const statusMessage = () => {
    const s = registry.status()
    if (s === 'valid') return 'Available'
    if (s === 'invalid') return 'Taken or invalid'
    if (s === 'reserved') return 'Reserved'
    if (s === 'too-short') {
      const config = registry.tldConfig()
      return config ? `Min ${config.minLabelLength} characters` : 'Too short'
    }
    return undefined
  }

  return (
    <div class="space-y-8">
      {/* Single input: https:// + name + .tld */}
      <div class="space-y-3">
        <div class="flex items-center rounded-2xl bg-secondary border-2 border-transparent focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring transition-all">
          <span class="pl-4 text-lg text-muted-foreground whitespace-nowrap">
            https://
          </span>
          <input
            type="text"
            value={registry.name()}
            onInput={(e) => handleNameChange(e.currentTarget.value)}
            placeholder="yourname"
            autocomplete="off"
            autocapitalize="off"
            spellcheck={false}
            class="flex-1 min-w-0 bg-transparent py-3 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <span class="pr-4 text-lg text-muted-foreground whitespace-nowrap">
            {TLD_INFO[registry.selectedTld()].label}
          </span>
        </div>
        <InputStatus
          state={statusToInputState()}
          validMessage={statusMessage()}
          invalidMessage={statusMessage()}
        />
      </div>

      {/* TLD selection with dynamic pricing */}
      <div class="space-y-3">
        <p class="text-base font-medium text-muted-foreground">5+ character names are free on .heaven</p>
        <div class="flex flex-col gap-2">
          <For each={registry.tldOptions()}>
            {(tld) => {
              const isSelected = () => registry.selectedTld() === tld.id
              return (
                <button
                  type="button"
                  onClick={() => handleTldChange(tld.id)}
                  class={cn(
                    'flex items-center gap-3 p-4 rounded-2xl text-left cursor-pointer',
                    'border transition-colors',
                    isSelected()
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/30'
                  )}
                >
                  {/* Radio dot */}
                  <div
                    class={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      isSelected()
                        ? 'border-primary'
                        : 'border-muted-foreground/30'
                    )}
                  >
                    <Show when={isSelected()}>
                      <div class="w-2.5 h-2.5 rounded-full bg-primary" />
                    </Show>
                  </div>

                  {/* Content */}
                  <div class="flex-1 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-foreground">{tld.label}</span>
                    </div>
                    <span
                      class={cn(
                        'text-base',
                        tld.isFree
                          ? 'text-green-600 font-medium'
                          : 'text-muted-foreground'
                      )}
                    >
                      {tld.isFree ? 'Free' : tld.price}
                      <Show when={!tld.isFree}>
                        <span class="text-muted-foreground">/year</span>
                      </Show>
                    </span>
                  </div>
                </button>
              )
            }}
          </For>
        </div>
      </div>

    </div>
  )
}

export const nameStepMeta: StepMetadata = {
  id: 'name',
  title: 'Choose pseudonym',
  subtitle: 'Your public profile, accessible as a URL and portable across web3 apps.',
  required: true,
  validate: (data) => {
    const stepData = data as unknown as NameStepData
    return (
      !!stepData?.name &&
      !!stepData?.tld &&
      stepData.nameStatus === 'valid'
    )
  },
}
