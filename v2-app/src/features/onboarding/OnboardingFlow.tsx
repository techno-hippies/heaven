import { Component, createSignal, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { ProgressBar } from './components/ProgressBar'
import { BackButton } from './components/BackButton'
import { Button } from '@/ui/button'
import type { StepData } from './types'
import { stepRegistry } from './steps'

export interface OnboardingFlowProps {
  /** Initial step ID */
  initialStepId?: string
  /** Ordered list of step IDs to show */
  stepIds: string[]
  /** Called when flow is completed */
  onComplete?: (data: StepData) => void
  /** Called when user cancels */
  onCancel?: () => void
}

export const OnboardingFlow: Component<OnboardingFlowProps> = (props) => {
  const [currentIndex, setCurrentIndex] = createSignal(0)
  const [data, setData] = createSignal<StepData>({})

  const currentStepId = () => props.stepIds[currentIndex()]
  const currentStep = () => stepRegistry[currentStepId()]
  const totalSteps = () => props.stepIds.length

  const canGoBack = () => currentIndex() > 0
  const canGoNext = () => {
    const step = currentStep()
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
          <div class="space-y-2">
            <h1 class="text-3xl md:text-4xl font-bold text-foreground">
              {currentStep()?.meta.title || ''}
            </h1>
            <Show when={currentStep()?.meta.subtitle}>
              <p class="text-lg text-muted-foreground">
                {currentStep()?.meta.subtitle}
              </p>
            </Show>
          </div>
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
