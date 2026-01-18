import type { Component } from 'solid-js'
import { useParams } from '@solidjs/router'

export const OnboardingPage: Component = () => {
  const params = useParams<{ stepId?: string }>()

  return (
    <div class="flex items-center justify-center min-h-screen p-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-4">Onboarding</h1>
        <p class="text-muted-foreground">
          {params.stepId ? `Step: ${params.stepId}` : 'Get started with Neodate'}
        </p>
      </div>
    </div>
  )
}

export default OnboardingPage
