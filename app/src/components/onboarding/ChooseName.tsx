import { type Component, createMemo, For } from 'solid-js'
import { OnboardingStep } from './OnboardingStep'
import { InputStatus, type InputState } from '@/components/ui/input'
import { DEFAULT_TLDS, type TldOption } from '@/components/ui/tld-select'
import { cn } from '@/lib/utils'

export interface ChooseNameProps {
  /** The name entered by user (without TLD) */
  name: string
  onNameChange?: (name: string) => void

  /** Currently selected TLD id */
  selectedTld: string
  onTldChange?: (tldId: string) => void

  /** Availability status for the current name+TLD combo */
  status?: InputState

  /** Available TLD options (defaults to DEFAULT_TLDS) */
  tldOptions?: TldOption[]

  /** Continue action */
  onContinue?: () => void
  onBack?: () => void

  /** Step info for progress bar */
  step?: number
  totalSteps?: number

  class?: string
}

export const ChooseName: Component<ChooseNameProps> = (props) => {
  const status = () => props.status ?? 'idle'
  const tldOptions = () => props.tldOptions ?? DEFAULT_TLDS

  const selectedTldOption = createMemo(() =>
    tldOptions().find((t) => t.id === props.selectedTld) ?? tldOptions()[0]
  )

  const canContinue = () => props.name.length >= 3 && status() === 'valid'

  const sanitize = (value: string) => value.toLowerCase().replace(/[^a-z0-9-]/g, '')

  return (
    <OnboardingStep
      sectionLabel="Profile"
      title="Choose your domain"
      subtitle="Your identity across apps, URLs, and email"
      step={props.step}
      totalSteps={props.totalSteps}
      canContinue={canContinue()}
      onContinue={props.onContinue}
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
            value={props.name}
            onInput={(e) => props.onNameChange?.(sanitize(e.currentTarget.value))}
            placeholder="yourname"
            autocomplete="off"
            autocapitalize="off"
            spellcheck={false}
            class="flex-1 min-w-0 bg-transparent py-3 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <span class="pr-4 text-lg text-muted-foreground whitespace-nowrap">
            {selectedTldOption().label}
          </span>
        </div>
        <InputStatus
          state={status()}
          validMessage="Available"
          invalidMessage="Taken"
          class="mt-2"
        />
      </div>

      {/* TLD selection */}
      <div class="flex flex-col gap-2">
        <For each={tldOptions()}>
          {(tld) => {
            const isSelected = () => props.selectedTld === tld.id
            return (
              <button
                type="button"
                onClick={() => props.onTldChange?.(tld.id)}
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
                  {isSelected() && (
                    <div class="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>

                {/* Content */}
                <div class="flex-1 flex items-center justify-between">
                  <span class="font-medium text-foreground">{tld.label}</span>
                  <span class={cn(
                    'text-sm',
                    tld.price === 'FREE' ? 'text-green-600 font-medium' : 'text-muted-foreground'
                  )}>
                    {tld.price}
                  </span>
                </div>
              </button>
            )
          }}
        </For>
      </div>
    </OnboardingStep>
  )
}

export default ChooseName
