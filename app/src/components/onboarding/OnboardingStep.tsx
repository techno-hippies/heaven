import { type Component, type JSX, Show, For } from 'solid-js'
import { cn } from '@/lib/utils'
import { Button, IconButton } from '@/components/ui/button'
import { VisibilitySelect, type Visibility } from '@/components/ui/visibility-select'
import { FilterToggle } from '@/components/ui/filter-toggle'

export interface OnboardingStepProps {
  /** Step title */
  title: string
  /** Step subtitle */
  subtitle?: string
  /** Main content (selection UI) */
  children: JSX.Element
  /** Current step (1-indexed) */
  step?: number
  /** Total steps */
  totalSteps?: number
  /** Whether continue is enabled */
  canContinue?: boolean
  /** Called when back pressed */
  onBack?: () => void
  /** Called when continue pressed */
  onContinue?: () => void
  /** Visibility setting (omit to hide visibility picker) */
  visibility?: Visibility
  /** Called when visibility changes */
  onVisibilityChange?: (visibility: Visibility) => void
  /** Filter toggle state (omit to hide filter toggle) */
  filterEnabled?: boolean
  /** Called when filter toggle changes */
  onFilterChange?: (enabled: boolean) => void
  /** Continue button text */
  continueText?: string
  class?: string
}

export const OnboardingStep: Component<OnboardingStepProps> = (props) => {
  const step = () => props.step ?? 1
  const totalSteps = () => props.totalSteps ?? 1

  return (
    <div class={cn('flex flex-col items-center h-screen bg-background', props.class)}>
      {/* Header */}
      <div class="w-full px-4 pt-4">
        <div class="max-w-2xl mx-auto flex items-center gap-3">
          {/* Back button - only render spacer when back exists */}
          <Show when={props.onBack}>
            <div class="w-9 flex-shrink-0">
              <IconButton icon="caret-left" onClick={props.onBack} />
            </div>
          </Show>
          {/* Progress bar */}
          <div class="flex-1 flex gap-1.5">
            <For each={Array(totalSteps()).fill(0)}>
              {(_, i) => (
                <div
                  class={cn(
                    'h-1 flex-1 rounded-full',
                    i() < step() ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </For>
          </div>
        </div>
      </div>

      {/* Content */}
      <div class="w-full flex-1 px-6 pt-8 pb-6 min-h-0 overflow-y-auto">
        <div class="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 class="text-2xl font-bold text-foreground">{props.title}</h1>
            <Show when={props.subtitle}>
              <p class="text-base text-muted-foreground mt-1">{props.subtitle}</p>
            </Show>
          </div>

          {/* Main content */}
          {props.children}

          {/* Filter toggle (for preference steps) */}
          <Show when={props.filterEnabled !== undefined}>
            <FilterToggle
              enabled={props.filterEnabled!}
              onChange={props.onFilterChange}
            />
          </Show>

          {/* Visibility picker (for value steps) */}
          <Show when={props.visibility !== undefined}>
            <div>
              <p class="text-sm text-muted-foreground mb-2">Who can see this?</p>
              <VisibilitySelect
                value={props.visibility!}
                onChange={props.onVisibilityChange}
              />
            </div>
          </Show>
        </div>
      </div>

      {/* Footer */}
      <div class="w-full px-6 pb-6">
        <div class="max-w-2xl mx-auto">
          <Button
            variant="default"
            size="xl"
            class="w-full"
            disabled={!props.canContinue}
            onClick={props.onContinue}
          >
            {props.continueText ?? 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingStep
