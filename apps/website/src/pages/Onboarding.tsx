import { createSignal, createEffect, Show, type Component } from 'solid-js'
import { useNavigate, useParams } from '@solidjs/router'
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow'
import { onboardingStepOrder, type OnboardingStepId, type OnboardingPhase } from '@/features/onboarding/config'
import { useAuth } from '@/app/providers/AuthContext'
import { registerHeavenName } from '@/lib/names-api'
import type { StepData } from '@/features/onboarding/types'
import { Spinner } from '@/ui/spinner'
import { Button } from '@/ui/button'

const IS_DEV = import.meta.env.DEV

export const OnboardingPage: Component = () => {
  const params = useParams<{ stepId?: string }>()
  const navigate = useNavigate()
  const auth = useAuth()

  const [authAttempted, setAuthAttempted] = createSignal(false)
  const [completedPhases, setCompletedPhases] = createSignal<Set<number>>(new Set())

  // Auto-authenticate when user lands on onboarding without a session
  createEffect(() => {
    // Skip if already authenticated or currently authenticating
    if (auth.isAuthenticated() || auth.isAuthenticating()) {
      return
    }

    // Skip if we already tried to authenticate
    if (authAttempted()) {
      return
    }

    // Mark that we've attempted auth (prevents loops)
    setAuthAttempted(true)

    if (IS_DEV) console.log('[Onboarding] No session, prompting for passkey authentication...')

    // Trigger passkey authentication
    auth.signIn().catch((err) => {
      console.error('[Onboarding] Auto-auth failed:', err)
      // User will see the auth prompt UI
    })
  })

  /**
   * Handle phase completion - fires optimistically (non-blocking).
   * User advances to next phase immediately; background tasks fire and forget.
   * Guard prevents duplicate execution if user backs up and re-advances.
   */
  const handlePhaseComplete = (phase: OnboardingPhase, data: StepData) => {
    // Guard: skip if this phase was already completed
    if (completedPhases().has(phase)) {
      if (IS_DEV) console.log(`[Onboarding] Phase ${phase} already completed, skipping`)
      return
    }

    // Mark phase as completed
    setCompletedPhases((prev) => new Set([...prev, phase]))

    const pkpInfo = auth.pkpInfo()
    const authData = auth.authData()

    if (!pkpInfo || !authData) {
      console.error('[Onboarding] Missing auth for phase completion')
      return
    }

    if (phase === 1) {
      // Phase 1: Register .heaven name + call DatingV3.setBasics()
      const name = data.name as string | undefined
      if (!name) {
        console.error('[Onboarding] Phase 1 complete but no name')
        return
      }

      if (IS_DEV) console.log('[Onboarding] Phase 1 complete, firing background tasks...')

      // Fire .heaven registration (non-blocking)
      registerHeavenName(name, pkpInfo, authData)
        .then((result) => {
          if (result.success) {
            if (IS_DEV) console.log('[Onboarding] .heaven name registered:', result.label)
          } else {
            console.error('[Onboarding] .heaven registration failed:', result.error)
            // TODO: Show non-blocking toast/banner with retry
          }
        })
        .catch((err) => {
          console.error('[Onboarding] .heaven registration error:', err)
        })

      // TODO: Fire DatingV3.setBasics() Lit Action
      // - Encrypt age/gender/desiredMask with Zama FHE SDK
      // - Call dating-setbasics-sponsor-v1 Lit Action
      if (IS_DEV) console.log('[Onboarding] TODO: Call DatingV3.setBasics() Lit Action')
    }

    if (phase === 2) {
      // Phase 2: Upload encrypted profile to IPFS, update .heaven CID
      if (IS_DEV) console.log('[Onboarding] Phase 2 complete, firing background tasks...')

      // TODO: Call profile-pin-v1 Lit Action
      // - Encrypt extended profile data
      // - Pin to Filebase → get CID
      // - Call updateHeavenName() with CID
      if (IS_DEV) console.log('[Onboarding] TODO: Call profile-pin-v1 Lit Action')
    }

    if (phase === 3) {
      // Phase 3: Match preferences (stored locally or in profile)
      if (IS_DEV) console.log('[Onboarding] Phase 3 complete')
      // Preferences may be stored in same IPFS profile or kept client-side
    }
  }

  /**
   * Handle final completion - called after all phases.
   */
  const handleComplete = async (data: StepData) => {
    const pkpInfo = auth.pkpInfo()
    const authData = auth.authData()
    const name = data.name as string | undefined

    // Require name and auth for navigation
    if (!name || !pkpInfo || !authData) {
      console.error('[Onboarding] Missing data for completion:', { name, hasPkp: !!pkpInfo, hasAuth: !!authData })
      return
    }

    // Phase callbacks already fired optimistically.
    // Just navigate home - registration happens in background.
    if (IS_DEV) console.log('[Onboarding] All phases complete, navigating home')
    navigate('/')
  }

  return (
    <>
      {/* Loading while authenticating */}
      <Show when={auth.isAuthenticating()}>
        <div class="flex flex-col items-center justify-center h-screen gap-4">
          <Spinner size="lg" />
          <p class="text-muted-foreground">Signing in with your passkey...</p>
        </div>
      </Show>

      {/* Auth prompt if not authenticated */}
      <Show when={!auth.isAuthenticating() && !auth.isAuthenticated()}>
        <div class="flex flex-col items-center justify-center h-screen gap-4 p-6">
          <div class="text-center max-w-md">
            <h1 class="text-2xl font-bold text-foreground mb-2">Sign in to continue</h1>
            <p class="text-muted-foreground mb-6">
              Use your passkey to access your profile and complete onboarding.
            </p>
            <Show when={auth.authError()}>
              <p class="text-destructive text-sm mb-4">{auth.authError()}</p>
            </Show>
            <div class="flex flex-col gap-3">
              <Button onClick={() => auth.signIn()}>
                Sign in with passkey
              </Button>
              <Button variant="ghost" onClick={() => navigate('/')}>
                Go back
              </Button>
            </div>
          </div>
        </div>
      </Show>

      {/* Main onboarding flow */}
      <Show when={!auth.isAuthenticating() && auth.isAuthenticated()}>
        <OnboardingFlow
          initialStepId={params.stepId as OnboardingStepId | undefined}
          stepIds={[...onboardingStepOrder]}
          onPhaseComplete={handlePhaseComplete}
          onComplete={handleComplete}
        />
      </Show>
    </>
  )
}

export default OnboardingPage
