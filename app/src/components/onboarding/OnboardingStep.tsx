import { type Component, type JSX, Show, For } from 'solid-js'
import { cn } from '@/lib/utils'
import { Button, IconButton } from '@/components/ui/button'
import { VisibilitySelect, type Visibility } from '@/components/ui/visibility-select'

export interface OnboardingStepProps {
  /**
   * Page variant:
   * - 'flow': Progress bar + back button (for onboarding sequences)
   * - 'modal': Close button + optional header title (for optional/dismissible flows)
   */
  variant?: 'flow' | 'modal'
  /** Header title (modal variant only - centered in header bar) */
  headerTitle?: string
  /** Step title (main content area) - optional for preview screens */
  title?: string
  /** Step subtitle */
  subtitle?: string
  /** Section label (e.g., "Profile", "Dealbreakers", "Preferences") */
  sectionLabel?: string
  /** Main content (selection UI) */
  children: JSX.Element
  /** Current step (1-indexed) */
  step?: number
  /** Total steps */
  totalSteps?: number
  /** Whether continue is enabled */
  canContinue?: boolean
  /** Called when back/close pressed */
  onBack?: () => void
  /** Called when continue pressed */
  onContinue?: () => void
  /** Called when skip pressed (omit to hide skip button) */
  onSkip?: () => void
  /** Skip button text */
  skipText?: string
  /** Visibility setting (omit to hide visibility picker) */
  visibility?: Visibility
  /** Called when visibility changes */
  onVisibilityChange?: (visibility: Visibility) => void
  /** Continue button text */
  continueText?: string
  class?: string
}

export const OnboardingStep: Component<OnboardingStepProps> = (props) => {
  const variant = () => props.variant ?? 'flow'
  const step = () => props.step ?? 1
  const totalSteps = () => props.totalSteps ?? 1
  const showProgress = () => variant() === 'flow' && totalSteps() > 0

  return (
    <div class={cn('flex flex-col items-center h-screen bg-background', props.class)}>
      {/* Header */}
      <div class="w-full px-6 pt-4">
        <div class="max-w-2xl mx-auto flex items-center gap-3">
          {/* Back/Close button - only render when needed */}
          <Show when={props.onBack}>
            <div class="w-9 flex-shrink-0">
              <IconButton
                icon={variant() === 'modal' ? 'x' : 'caret-left'}
                onClick={props.onBack}
              />
            </div>
          </Show>

          {/* Progress bar (flow variant) or Header title (modal variant) */}
          <Show
            when={showProgress()}
            fallback={
              <Show when={variant() === 'modal'}>
                <div class="flex-1 text-center">
                  <Show when={props.headerTitle}>
                    <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {props.headerTitle}
                    </p>
                  </Show>
                </div>
              </Show>
            }
          >
            <div class="flex-1 min-w-0">
              <div
                class="grid w-full gap-1.5"
                style={`grid-template-columns: repeat(${totalSteps()}, 1fr);`}
              >
                <For each={Array(totalSteps()).fill(0)}>
                  {(_, i) => (
                    <div
                      class={cn(
                        'h-1 rounded-full',
                        i() < step() ? 'bg-primary' : 'bg-muted'
                      )}
                    />
                  )}
                </For>
              </div>
            </div>
          </Show>

          {/* Right spacer for symmetry in modal variant */}
          <Show when={variant() === 'modal'}>
            <div class="w-9 flex-shrink-0" />
          </Show>
        </div>
      </div>

      {/* Content */}
      <div class="w-full flex-1 px-6 pt-8 pb-6 min-h-0 overflow-y-auto">
        <div class="max-w-2xl mx-auto space-y-6">
          {/* Title area */}
          <div>
            <Show when={props.sectionLabel}>
              <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                {props.sectionLabel}
              </p>
            </Show>
            <h1 class="text-2xl font-bold text-foreground">{props.title}</h1>
            <Show when={props.subtitle}>
              <p class="text-base text-muted-foreground mt-1">{props.subtitle}</p>
            </Show>
          </div>

          {/* Main content */}
          {props.children}

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

      {/* Footer - always side-by-side [Skip] [Continue] */}
      <div class="w-full px-6 pb-6">
        <div class="max-w-2xl mx-auto flex gap-3">
          <Show when={props.onSkip}>
            <Button
              variant="secondary"
              size="xl"
              class="flex-1"
              onClick={props.onSkip}
            >
              {props.skipText ?? 'Skip'}
            </Button>
          </Show>
          <Button
            variant="default"
            size="xl"
            class="flex-1"
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
