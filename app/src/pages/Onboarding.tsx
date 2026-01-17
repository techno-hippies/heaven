import { Component, Match, Show, Switch, createEffect, createSignal, on, onCleanup } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { useNavigate } from '@solidjs/router'
import { AuthModal } from '@/components/auth'
import { useAuth } from '@/contexts/AuthContext'
import { injected } from '@wagmi/connectors'
import { wagmiConfig, connect } from '@/providers/Web3Provider'
import {
  createOnboardingStore,
  clearOnboardingData,
  createPhotoUrl,
  type OnboardingData,
} from '@/lib/onboarding/store'
import {
  DEALBREAKER_TOTAL_STEPS,
  PROFILE_TOTAL_STEPS,
  getDealbreakerStepIndex,
  getDealbreakerStepNumber,
  getProfileStepIndex,
  getProfileStepNumber,
} from '@/lib/onboarding/steps'
import { CommitScreen } from '@/pages/onboarding/CommitScreen'
import { DEALBREAKER_STEPS, PROFILE_STEPS } from '@/pages/onboarding/steps'
import { useWriteDirectory, type RegisterProfileParams } from '@/lib/contracts/useDirectory'
import { GENDER_IDENTITY_LABELS, REGION_BUCKET_LABELS } from '@/components/profile/ProfileBadge'

const SEEKING_REGION_OPTIONS = Object.entries(REGION_BUCKET_LABELS)
  .filter(([key]) => key !== '9')
  .map(([value, label]) => ({ value, label }))

const ALL_GENDERS_COUNT = Object.keys(GENDER_IDENTITY_LABELS).length
const ALL_REGIONS_COUNT = SEEKING_REGION_OPTIONS.length

export const OnboardingPage: Component = () => {
  const navigate = useNavigate()
  const auth = useAuth()
  const directory = useWriteDirectory()

  const {
    data,
    isLoading,
    updateData,
    setPhase,
    setCommitStatus,
    setCommitError,
    nextProfileStep,
    prevProfileStep,
    nextDealbreakerStep,
    prevDealbreakerStep,
  } = createOnboardingStore()

  const phase = () => data().phase

  const profileStepIndex = () => Math.max(0, getProfileStepIndex(data().profileStepId))
  const profileStepNumber = () => getProfileStepNumber(data().profileStepId)
  const profileStepConfig = () => PROFILE_STEPS[profileStepIndex()] ?? PROFILE_STEPS[0]

  const dealbreakerStepIndex = () => Math.max(0, getDealbreakerStepIndex(data().dealbreakersStepId))
  const dealbreakerStepNumber = () => getDealbreakerStepNumber(data().dealbreakersStepId)
  const dealbreakerStepConfig = () => DEALBREAKER_STEPS[dealbreakerStepIndex()] ?? DEALBREAKER_STEPS[0]

  const [photoState, setPhotoState] = createSignal<'empty' | 'uploading' | 'success'>('empty')
  const [photoUrl, setPhotoUrl] = createSignal<string>()

  createEffect(
    on(
      () => data().photoBlob,
      (blob) => {
        const existingUrl = photoUrl()
        if (existingUrl) URL.revokeObjectURL(existingUrl)

        if (blob) {
          setPhotoUrl(createPhotoUrl(blob))
          setPhotoState('success')
        } else {
          setPhotoUrl(undefined)
          setPhotoState('empty')
        }
      }
    )
  )

  onCleanup(() => {
    const url = photoUrl()
    if (url) URL.revokeObjectURL(url)
  })

  const handleExitOnboarding = () => {
    navigate('/')
  }

  const handleProfileBack = () => {
    if (profileStepIndex() > 0) {
      prevProfileStep()
    }
  }

  const handleProfileContinue = () => {
    if (profileStepIndex() < PROFILE_TOTAL_STEPS - 1) {
      nextProfileStep()
    }
  }

  const normalizeDealbreakers = () => {
    const current = data()
    if ((current.seekingGenders?.length ?? 0) >= ALL_GENDERS_COUNT) {
      updateData('seekingGenders', [])
    }
    if ((current.seekingRegions?.length ?? 0) >= ALL_REGIONS_COUNT) {
      updateData('seekingRegions', [])
    }
    if (current.seekingAgeMin === '18' && current.seekingAgeMax === '50') {
      updateData('seekingAgeMin', undefined)
      updateData('seekingAgeMax', undefined)
    }
  }

  const handleDealbreakersBack = () => {
    if (dealbreakerStepIndex() > 0) {
      prevDealbreakerStep()
    }
  }

  const handleDealbreakersNext = () => {
    normalizeDealbreakers()
    if (dealbreakerStepIndex() < DEALBREAKER_TOTAL_STEPS - 1) {
      nextDealbreakerStep()
    } else {
      handleFinishOnboarding()
    }
  }

  const handleFinishOnboarding = async () => {
    localStorage.setItem('neodate:onboarded', 'true')
    await clearOnboardingData()
    navigate('/')
  }

  const handlePhotoSelect = (file: File) => {
    setPhotoState('uploading')
    setTimeout(() => {
      updateData('photoBlob', file)
      setPhotoState('success')
    }, 500)
  }

  const handlePhotoRemove = () => {
    updateData('photoBlob', undefined)
    setPhotoState('empty')
  }

  const mapToDirectoryParams = (d: OnboardingData): RegisterProfileParams => {
    const publicOrHidden = (value: string | undefined, visibility: string): number => {
      if (visibility !== 'public' || !value) return 0
      return Number(value)
    }

    return {
      regionBucket: d.region ? Number(d.region) : 0,
      genderIdentity: publicOrHidden(d.gender, d.genderVisibility),
      lookingFor: publicOrHidden(d.lookingFor, d.lookingForVisibility),
      bodyBucket: 0,
      fitnessBucket: 0,
      smoking: 0,
      drinking: 0,
      modelVersion: 1,
    }
  }

  const commitProfile = async () => {
    setCommitStatus('pending')
    setCommitError(null)

    try {
    const params = mapToDirectoryParams(data())
    console.log('[Onboarding] Committing to Directory:', params)

    const pkpInfo = auth.pkpInfo()
    const authData = auth.authData()
    const eoaAddress = auth.eoaAddress()
    const options = pkpInfo && authData ? { pkpInfo, authData } : undefined

    console.log('[Onboarding] Commit signer:', eoaAddress ?? pkpInfo?.ethAddress ?? 'none')
    console.log('[Onboarding] Signing method:', eoaAddress ? 'EOA (wallet)' : 'PKP (passkey)')

      await directory.register(params, options)
      console.log('[Onboarding] Directory profile created!')
      setCommitStatus('success')
    } catch (e) {
      console.error('[Onboarding] Failed to commit profile:', e)
      setCommitStatus('error')
      setCommitError(e instanceof Error ? e.message : 'Failed to create profile')
    }
  }

  createEffect(() => {
    if (phase() !== 'commit' || data().commitStatus !== 'success') return
    const timeout = setTimeout(() => {
      setPhase('dealbreakers')
    }, 800)

    onCleanup(() => clearTimeout(timeout))
  })

  const [authModalOpen, setAuthModalOpen] = createSignal(false)

  const startCommit = () => {
    setPhase('commit')
    commitProfile()
  }

  const handleCreateProfile = () => {
    if (auth.isAuthenticated()) {
      startCommit()
    } else {
      setAuthModalOpen(true)
    }
  }

  const handleAuthSuccess = () => {
    startCommit()
  }

  const handleCreateAccount = async () => {
    try {
      await auth.register()
    } catch (error) {
      console.error('[Onboarding] Passkey registration failed:', error)
    }
  }

  const handleSignIn = async () => {
    try {
      await auth.signIn()
    } catch (error) {
      console.error('[Onboarding] Passkey sign in failed:', error)
    }
  }

  const handleConnectWallet = async () => {
    auth.expectWalletConnection()
    try {
      await connect(wagmiConfig, { connector: injected() })
    } catch (error) {
      console.error('[Onboarding] Wallet connection failed:', error)
    }
  }

  return (
    <Show
      when={!isLoading()}
      fallback={
        <div class="flex items-center justify-center h-screen bg-background">
          <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <Switch>
        <Match when={phase() === 'profile'}>
          <Dynamic
            component={profileStepConfig().component}
            data={data}
            updateData={updateData}
            stepNumber={profileStepNumber()}
            totalSteps={PROFILE_TOTAL_STEPS}
            onBack={profileStepIndex() === 0 ? handleExitOnboarding : handleProfileBack}
            onContinue={handleProfileContinue}
            onCreateProfile={handleCreateProfile}
            photoState={photoState()}
            photoUrl={photoUrl()}
            onPhotoSelect={handlePhotoSelect}
            onPhotoRemove={handlePhotoRemove}
          />

          <AuthModal
            open={authModalOpen()}
            onOpenChange={setAuthModalOpen}
            onSuccess={handleAuthSuccess}
            isAuthenticating={auth.isAuthenticating()}
            isAuthenticated={auth.isAuthenticated()}
            authError={auth.authError()}
            authStatus={auth.authStatus()}
            eoaAddress={auth.eoaAddress()}
            onRegister={handleCreateAccount}
            onSignIn={handleSignIn}
            onConnectWallet={handleConnectWallet}
          />
        </Match>

        <Match when={phase() === 'commit'}>
          <CommitScreen
            status={data().commitStatus}
            error={data().commitError}
            onStart={commitProfile}
            onRetry={commitProfile}
          />
        </Match>

        <Match when={phase() === 'dealbreakers'}>
          <Dynamic
            component={dealbreakerStepConfig().component}
            data={data}
            updateData={updateData}
            stepNumber={dealbreakerStepNumber()}
            totalSteps={DEALBREAKER_TOTAL_STEPS}
            onBack={dealbreakerStepIndex() === 0 ? undefined : handleDealbreakersBack}
            onContinue={handleDealbreakersNext}
          />
        </Match>
      </Switch>
    </Show>
  )
}

export default OnboardingPage
