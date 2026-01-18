import { type Component, For, Show } from 'solid-js'
import { OnboardingStep } from './OnboardingStep'
import { InputStatus } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  useNameRegistry,
  TLD_INFO,
  type TldId,
} from '@/lib/contracts/useNameRegistry'

export interface ChooseNameProps {
  /** Continue action */
  onContinue?: (name: string, tld: TldId) => void
  onBack?: () => void

  /** Step info for progress bar */
  step?: number
  totalSteps?: number

  class?: string
}

/**
 * Name selection step with dynamic pricing from V3 contract
 */
export const ChooseName: Component<ChooseNameProps> = (props) => {
  const registry = useNameRegistry({ initialTld: 'neodate' })

  const canContinue = () => registry.status() === 'valid'

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

  const handleContinue = () => {
    if (canContinue()) {
      props.onContinue?.(registry.name(), registry.selectedTld())
    }
  }

  return (
    <OnboardingStep
      sectionLabel="Profile"
      title="Choose your domain"
      subtitle="Your identity across apps, URLs, and email"
      step={props.step}
      totalSteps={props.totalSteps}
      canContinue={canContinue()}
      onContinue={handleContinue}
      onBack={props.onBack}
      class={props.class}
    >
      {/* Single input: https:// + name + .tld */}
      <div>
        <div class="flex items-center rounded-2xl bg-secondary border-2 border-transparent focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring transition-all">
          <span class="pl-4 text-lg text-muted-foreground whitespace-nowrap">
            https://
          </span>
          <input
            type="text"
            value={registry.name()}
            onInput={(e) => registry.setName(e.currentTarget.value)}
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
          class="mt-2"
        />
      </div>

      {/* TLD selection with dynamic pricing */}
      <div class="flex flex-col gap-2">
        <For each={registry.tldOptions()}>
          {(tld) => {
            const isSelected = () => registry.selectedTld() === tld.id
            return (
              <button
                type="button"
                onClick={() => registry.setSelectedTld(tld.id)}
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
                      'text-sm',
                      tld.price === 'Free'
                        ? 'text-green-600 font-medium'
                        : 'text-muted-foreground'
                    )}
                  >
                    {tld.price}
                    <Show when={tld.price !== 'Free'}>
                      <span class="text-xs text-muted-foreground/70">/yr</span>
                    </Show>
                  </span>
                </div>
              </button>
            )
          }}
        </For>
      </div>

      {/* Price breakdown for paid TLDs */}
      <Show when={registry.price() > BigInt(0)}>
        <div class="text-sm text-muted-foreground text-center">
          <Show when={registry.name().length <= 4 && registry.tldConfig()?.lengthPricingEnabled}>
            <span class="text-amber-600">
              Short names have premium pricing
            </span>
            {' · '}
          </Show>
          Total: {registry.priceFormatted()} for 1 year
        </div>
      </Show>
    </OnboardingStep>
  )
}

export default ChooseName
