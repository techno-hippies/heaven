import { Component, createSignal, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { StepHeader } from './components/StepHeader'
import { ProgressBar } from './components/ProgressBar'
import { BackButton } from './components/BackButton'
import { Button } from '@/ui/button'
import type { StepData } from './types'
import { stepRegistry } from './steps'
import { getPhaseForStep, isLastStepInPhase, type OnboardingPhase } from './config'

export interface OnboardingFlowProps {
  /** Initial step ID */
  initialStepId?: string
  /** Ordered list of step IDs to show */
  stepIds: string[]
  /** Called when flow is completed */
  onComplete?: (data: StepData) => void
  /** Called when a phase is completed (fires before advancing to next phase) */
  onPhaseComplete?: (phase: OnboardingPhase, data: StepData) => void | Promise<void>
  /** Called when user cancels */
  onCancel?: () => void
}

export const OnboardingFlow: Component<OnboardingFlowProps> = (props) => {
  const initialIndex = () => {
    if (!props.initialStepId) return 0
    const idx = props.stepIds.indexOf(props.initialStepId)
    return idx >= 0 ? idx : 0
  }
  const [currentIndex, setCurrentIndex] = createSignal(initialIndex())
  const [data, setData] = createSignal<StepData>({})

  const currentStepId = () => props.stepIds[currentIndex()]
  const currentStep = () => stepRegistry[currentStepId()]
  const totalSteps = () => props.stepIds.length

  const canGoBack = () => currentIndex() > 0
  const canGoNext = () => {
    const step = currentStep()
    if (!step?.meta.required) return true
    if (!step?.meta.validate) return true
    return step.meta.validate(data())
  }

  const handleBack = () => {
    if (canGoBack()) {
      setCurrentIndex(currentIndex() - 1)
    } else if (props.onCancel) {
      props.onCancel()
    }
  }

  const handleNext = () => {
    const stepId = currentStepId()
    const currentPhase = getPhaseForStep(stepId)

    // Check if we're at the last step of a phase
    if (currentPhase && isLastStepInPhase(stepId) && props.onPhaseComplete) {
      // Fire phase callback (don't await - optimistic/non-blocking)
      // Wrap in Promise.resolve to handle both sync and async callbacks safely
      void Promise.resolve(props.onPhaseComplete(currentPhase, data())).catch((err) => {
        console.error(`[OnboardingFlow] Phase ${currentPhase} callback error:`, err)
      })
    }

    if (currentIndex() < totalSteps() - 1) {
      setCurrentIndex(currentIndex() + 1)
    } else if (props.onComplete) {
      props.onComplete(data())
    }
  }

  const handleDataChange = (updates: Partial<StepData>) => {
    setData({ ...data(), ...updates })
  }

  return (
    <div class="flex flex-col h-screen bg-background">
      {/* Header */}
      <div class="w-full px-6 pt-4">
        <div class="max-w-2xl mx-auto space-y-6">
          {/* Back button + Progress bar */}
          <div class="flex items-center gap-3">
            <div class="w-10 flex-shrink-0">
              <BackButton onClick={handleBack} />
            </div>
            <div class="flex-1 min-w-0">
              <ProgressBar current={currentIndex() + 1} total={totalSteps()} />
            </div>
          </div>

          {/* Title and subtitle */}
          <StepHeader
            title={currentStep()?.meta.title || ''}
            subtitle={currentStep()?.meta.subtitle}
          />
        </div>
      </div>

      {/* Content */}
      <div class="flex-1 w-full px-6 overflow-y-auto">
        <div class="max-w-2xl mx-auto py-6">
          <Show when={currentStep()}>
            <Dynamic
              component={currentStep().component}
              data={data()}
              onChange={handleDataChange}
            />
          </Show>
        </div>
      </div>

      {/* Footer with next button */}
      <div class="w-full px-6 pb-6">
        <div class="max-w-2xl mx-auto">
          <Button
            size="xl"
            class="w-full"
            disabled={!canGoNext()}
            onClick={handleNext}
          >
            {currentIndex() === totalSteps() - 1 ? 'Create Profile' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
