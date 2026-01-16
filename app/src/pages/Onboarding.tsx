import { Component, createSignal, createEffect, onMount, onCleanup, Match, Switch, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { PhotoUpload } from '@/components/ui/photo-upload'
import { Button } from '@/components/ui/button'
import {
  RELATIONSHIP_STATUS_LABELS,
  REGION_BUCKET_LABELS,
  GENDER_IDENTITY_LABELS,
  LOOKING_FOR_LABELS,
  RELATIONSHIP_STRUCTURE_LABELS,
  KIDS_LABELS,
  RELIGION_LABELS,
  GROUP_PLAY_MODE_LABELS,
} from '@/components/profile/ProfileBadge'
import { useAuth } from '@/contexts/AuthContext'
import { Icon } from '@/components/icons'
import { cn } from '@/lib/utils'
import { wagmiConfig, connect } from '@/providers/Web3Provider'
import { injected } from '@wagmi/connectors'
import {
  type OnboardingData,
  defaultOnboardingData,
  loadOnboardingData,
  saveOnboardingData,
  clearOnboardingData,
  createPhotoUrl,
} from '@/lib/onboarding-store'

const toOptions = (labels: Record<number, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))

const TOTAL_STEPS = 9

export const OnboardingPage: Component = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = createSignal(true)
  const [isComplete, setIsComplete] = createSignal(false)

  // Photo upload state
  const [photoState, setPhotoState] = createSignal<'empty' | 'uploading' | 'success'>('empty')
  const [photoUrl, setPhotoUrl] = createSignal<string>()

  // Profile data from IDB
  const [data, setData] = createSignal<OnboardingData>({ ...defaultOnboardingData })

  // Load from IDB on mount
  onMount(() => {
    console.log('[Onboarding] onMount triggered')
    loadOnboardingData()
      .then((stored) => {
        console.log('[Onboarding] Loaded:', stored)
        setData(stored)

        // Restore photo URL from blob
        if (stored.photoBlob) {
          console.log('[Onboarding] Restoring photo blob')
          setPhotoUrl(createPhotoUrl(stored.photoBlob))
          setPhotoState('success')
        }

        console.log('[Onboarding] Done loading, setting isLoading=false')
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('[Onboarding] Failed to load:', error)
        setIsLoading(false)
      })
  })

  // Cleanup blob URL on unmount
  onCleanup(() => {
    const url = photoUrl()
    if (url) URL.revokeObjectURL(url)
  })

  // Save to IDB on data changes (debounced via effect)
  createEffect(() => {
    const current = data()
    if (!isLoading()) {
      saveOnboardingData(current)
    }
  })

  const step = () => data().currentStep

  const updateData = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  const handleBack = () => {
    if (step() > 1) {
      updateData('currentStep', step() - 1)
    }
  }

  const handleContinue = () => {
    if (step() < TOTAL_STEPS) {
      updateData('currentStep', step() + 1)
    } else {
      // Complete onboarding
      setIsComplete(true)
    }
  }

  const handlePhotoSelect = (file: File) => {
    setPhotoState('uploading')
    // TODO: Upload to R2 via worker
    setTimeout(() => {
      setPhotoState('success')
      // Revoke old URL if exists
      const oldUrl = photoUrl()
      if (oldUrl) URL.revokeObjectURL(oldUrl)
      // Store blob and create new URL
      updateData('photoBlob', file)
      setPhotoUrl(URL.createObjectURL(file))
    }, 500)
  }

  const handlePhotoRemove = () => {
    setPhotoState('empty')
    const oldUrl = photoUrl()
    if (oldUrl) URL.revokeObjectURL(oldUrl)
    updateData('photoBlob', undefined)
    setPhotoUrl(undefined)
  }

  const handleStartBrowsing = async () => {
    // TODO: Save onboarding data to backend
    localStorage.setItem('neodate:onboarded', 'true')
    await clearOnboardingData()
    navigate('/')
  }

  // Account creation screen component
  const AccountCreationScreen = () => {
    const auth = useAuth()
    const [method, setMethod] = createSignal<'passkey' | 'wallet' | null>(null)

    // Watch for successful auth and navigate
    createEffect(() => {
      if (auth.isAuthenticated()) {
        handleStartBrowsing()
      }
    })

    const handleSelectPasskey = () => {
      setMethod('passkey')
    }

    const handleBack = () => {
      setMethod(null)
    }

    const handleCreateAccount = async () => {
      try {
        await auth.register()
        // Navigation handled by createEffect above
      } catch (error) {
        console.error('[Onboarding] Passkey registration failed:', error)
      }
    }

    const handleSignIn = async () => {
      try {
        await auth.signIn()
        // Navigation handled by createEffect above
      } catch (error) {
        console.error('[Onboarding] Passkey sign in failed:', error)
      }
    }

    const handleConnectWallet = async () => {
      setMethod('wallet')
      auth.expectWalletConnection()

      try {
        await connect(wagmiConfig, { connector: injected() })
        // The watchAccount in AuthContext handles the rest
      } catch (error) {
        console.error('[Onboarding] Wallet connection failed:', error)
      }
    }

    // Wallet connecting screen
    if (method() === 'wallet') {
      return (
        <div class="flex flex-col items-center h-screen bg-background">
          <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div class="max-w-2xl mx-auto space-y-6">
              {/* Icon */}
              <div class={cn(
                'w-20 h-20 mx-auto rounded-full flex items-center justify-center',
                auth.authError() ? 'bg-destructive/10' : 'bg-primary/10'
              )}>
                <Icon
                  name={auth.authError() ? 'x-circle' : 'circle-notch'}
                  class={cn(
                    'text-4xl',
                    auth.authError() ? 'text-destructive' : 'text-primary animate-spin'
                  )}
                />
              </div>

              <div class="space-y-3">
                <h1 class="text-3xl font-bold text-foreground">
                  {auth.authError() ? 'Connection Failed' : 'Connecting Wallet'}
                </h1>
                <p class="text-lg text-muted-foreground">
                  {auth.authError() || auth.authStatus() || 'Please approve the connection in your wallet...'}
                </p>
              </div>

              {/* Show wallet address if connected */}
              <Show when={auth.eoaAddress() && !auth.authError()}>
                <div class="p-4 bg-muted rounded-lg">
                  <p class="text-xs text-muted-foreground mb-1">Connected wallet</p>
                  <p class="font-mono">
                    {auth.eoaAddress()?.slice(0, 6)}...{auth.eoaAddress()?.slice(-4)}
                  </p>
                </div>
              </Show>

              {/* Error: show retry options */}
              <Show when={auth.authError()}>
                <div class="flex flex-col gap-3 pt-4 w-full max-w-sm mx-auto">
                  <Button
                    variant="default"
                    size="xl"
                    class="w-full flex items-center justify-center gap-3"
                    onClick={handleConnectWallet}
                  >
                    <Icon name="wallet" class="text-2xl" />
                    <span>Try Again</span>
                  </Button>
                </div>

                <button
                  onClick={handleBack}
                  class="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 mx-auto"
                >
                  <Icon name="arrow-left" class="text-base" />
                  <span>Back</span>
                </button>
              </Show>
            </div>
          </div>
        </div>
      )
    }

    // Passkey choice screen (Create Account / Sign In)
    if (method() === 'passkey') {
      return (
        <div class="flex flex-col items-center h-screen bg-background">
          <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div class="max-w-2xl mx-auto space-y-6">
              {/* Icon */}
              <div class={cn(
                'w-20 h-20 mx-auto rounded-full flex items-center justify-center',
                auth.authError() ? 'bg-destructive/10' : 'bg-primary/10'
              )}>
                <Icon
                  name={auth.isAuthenticating() ? 'circle-notch' : auth.authError() ? 'x-circle' : 'fingerprint'}
                  class={cn(
                    'text-4xl',
                    auth.isAuthenticating() && 'animate-spin text-primary',
                    auth.authError() && 'text-destructive',
                    !auth.isAuthenticating() && !auth.authError() && 'text-primary'
                  )}
                />
              </div>

              <div class="space-y-3">
                <h1 class="text-3xl font-bold text-foreground">
                  {auth.isAuthenticating() ? 'Complete the Passkey Prompt' : auth.authError() ? 'Authentication Failed' : 'Sign in with Passkey'}
                </h1>
                <p class="text-lg text-muted-foreground">
                  {auth.authError() || (auth.isAuthenticating()
                    ? 'A passkey prompt should appear on your device. Follow the instructions to continue.'
                    : "Use your device's passkey (Face ID, Touch ID, or Windows Hello) for secure authentication."
                  )}
                </p>
              </div>

              {/* Auth options - hide while authenticating */}
              <Show when={!auth.isAuthenticating()}>
                <div class="flex flex-col gap-3 pt-4 w-full max-w-sm mx-auto">
                  <Button
                    variant="default"
                    size="xl"
                    class="w-full"
                    onClick={handleCreateAccount}
                    disabled={auth.isAuthenticating()}
                  >
                    Create Account
                  </Button>

                  <Button
                    variant="outline"
                    size="xl"
                    class="w-full"
                    onClick={handleSignIn}
                    disabled={auth.isAuthenticating()}
                  >
                    Sign In
                  </Button>
                </div>

                {/* Back button */}
                <button
                  onClick={handleBack}
                  class="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 mx-auto"
                >
                  <Icon name="arrow-left" class="text-base" />
                  <span>Back</span>
                </button>
              </Show>
            </div>
          </div>
        </div>
      )
    }

    // Method selection screen
    return (
      <div class="flex flex-col items-center h-screen bg-background">
        <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div class="max-w-2xl mx-auto space-y-6">
            {/* Icon */}
            <div class="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="lock-simple" class="text-4xl text-primary" />
            </div>

            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">Create your account</h1>
              <p class="text-lg text-muted-foreground">
                Your profile is ready. Now secure it with a passkey or wallet.
              </p>
            </div>

            {/* Auth options */}
            <div class="flex flex-col gap-3 pt-4 w-full max-w-sm mx-auto">
              <Button
                variant="default"
                size="xl"
                class="w-full flex items-center justify-center gap-3"
                onClick={handleSelectPasskey}
                disabled={auth.isAuthenticating()}
              >
                <Icon name="fingerprint" class="text-2xl" />
                <span>Continue with Passkey</span>
              </Button>

              <div class="flex items-center gap-4 py-2">
                <div class="flex-1 h-px bg-border" />
                <span class="text-muted-foreground text-sm">or</span>
                <div class="flex-1 h-px bg-border" />
              </div>

              <Button
                variant="outline"
                size="xl"
                class="w-full flex items-center justify-center gap-3"
                onClick={handleConnectWallet}
                disabled={auth.isAuthenticating()}
              >
                <Icon name="wallet" class="text-2xl" />
                <span>Connect Wallet</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div class="w-full px-6 pb-6">
          <p class="text-sm text-muted-foreground text-center">
            Secured by Lit Protocol. Your identity is portable across apps.
          </p>
        </div>
      </div>
    )
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
      <Show when={isComplete()} fallback={<Switch>
        {/* Step 1: Relationship Status */}
      <Match when={step() === 1}>
        <OnboardingStep
          title="What's your relationship status?"
          step={1}
          totalSteps={TOTAL_STEPS}
          canContinue={!!data().relationshipStatus}
          visibility={data().relationshipStatusVisibility}
          onVisibilityChange={(v) => updateData('relationshipStatusVisibility', v)}
          onContinue={handleContinue}
        >
          <ChoiceSelect
            options={toOptions(RELATIONSHIP_STATUS_LABELS)}
            value={data().relationshipStatus ?? ''}
            onChange={(v) => updateData('relationshipStatus', v as string)}
          />
        </OnboardingStep>
      </Match>

      {/* Step 2: Photo */}
      <Match when={step() === 2}>
        <OnboardingStep
          title="Photo"
          subtitle="Your main avatar is public and portable on Ethereum. You can use this identity across many apps."
          step={2}
          totalSteps={TOTAL_STEPS}
          canContinue={!!photoUrl()}
          onBack={handleBack}
          onContinue={handleContinue}
        >
          <PhotoUpload
            state={photoState()}
            previewUrl={photoUrl()}
            onFileSelect={handlePhotoSelect}
            onRemove={handlePhotoRemove}
            isAvatar
          />
        </OnboardingStep>
      </Match>

      {/* Step 3: Region */}
      <Match when={step() === 3}>
        <OnboardingStep
          title="Where are you?"
          step={3}
          totalSteps={TOTAL_STEPS}
          canContinue={!!data().region}
          onBack={handleBack}
          onContinue={handleContinue}
        >
          <ChoiceSelect
            options={toOptions(REGION_BUCKET_LABELS)}
            value={data().region ?? ''}
            onChange={(v) => updateData('region', v as string)}
          />
        </OnboardingStep>
      </Match>

      {/* Step 4: Gender */}
      <Match when={step() === 4}>
        <OnboardingStep
          title="How do you identify?"
          step={4}
          totalSteps={TOTAL_STEPS}
          canContinue={!!data().gender}
          onBack={handleBack}
          visibility={data().genderVisibility}
          onVisibilityChange={(v) => updateData('genderVisibility', v)}
          onContinue={handleContinue}
        >
          <ChoiceSelect
            options={toOptions(GENDER_IDENTITY_LABELS)}
            value={data().gender ?? ''}
            onChange={(v) => updateData('gender', v as string)}
          />
        </OnboardingStep>
      </Match>

      {/* Step 5: Looking For */}
      <Match when={step() === 5}>
        <OnboardingStep
          title="What are you looking for?"
          step={5}
          totalSteps={TOTAL_STEPS}
          canContinue={!!data().lookingFor}
          onBack={handleBack}
          visibility={data().lookingForVisibility}
          onVisibilityChange={(v) => updateData('lookingForVisibility', v)}
          onContinue={handleContinue}
        >
          <ChoiceSelect
            options={toOptions(LOOKING_FOR_LABELS)}
            value={data().lookingFor ?? ''}
            onChange={(v) => updateData('lookingFor', v as string)}
          />
        </OnboardingStep>
      </Match>

      {/* Step 6: Relationship Structure */}
      <Match when={step() === 6}>
        <OnboardingStep
          title="What's your relationship style?"
          step={6}
          totalSteps={TOTAL_STEPS}
          canContinue={!!data().relationshipStructure}
          onBack={handleBack}
          visibility={data().relationshipStructureVisibility}
          onVisibilityChange={(v) => updateData('relationshipStructureVisibility', v)}
          onContinue={handleContinue}
        >
          <ChoiceSelect
            options={toOptions(RELATIONSHIP_STRUCTURE_LABELS)}
            value={data().relationshipStructure ?? ''}
            onChange={(v) => updateData('relationshipStructure', v as string)}
          />
        </OnboardingStep>
      </Match>

      {/* Step 7: Kids */}
      <Match when={step() === 7}>
        <OnboardingStep
          title="Do you have kids?"
          step={7}
          totalSteps={TOTAL_STEPS}
          canContinue={!!data().kids}
          onBack={handleBack}
          visibility={data().kidsVisibility}
          onVisibilityChange={(v) => updateData('kidsVisibility', v)}
          onContinue={handleContinue}
        >
          <ChoiceSelect
            options={toOptions(KIDS_LABELS)}
            value={data().kids ?? ''}
            onChange={(v) => updateData('kids', v as string)}
          />
        </OnboardingStep>
      </Match>

      {/* Step 8: Religion */}
      <Match when={step() === 8}>
        <OnboardingStep
          title="What do you believe?"
          step={8}
          totalSteps={TOTAL_STEPS}
          canContinue={!!data().religion}
          onBack={handleBack}
          visibility={data().religionVisibility}
          onVisibilityChange={(v) => updateData('religionVisibility', v)}
          onContinue={handleContinue}
        >
          <ChoiceSelect
            options={toOptions(RELIGION_LABELS)}
            value={data().religion ?? ''}
            onChange={(v) => updateData('religion', v as string)}
          />
        </OnboardingStep>
      </Match>

      {/* Step 9: Group Play */}
      <Match when={step() === 9}>
        <OnboardingStep
          title="Into group play?"
          step={9}
          totalSteps={TOTAL_STEPS}
          canContinue={!!data().groupPlay}
          onBack={handleBack}
          visibility={data().groupPlayVisibility}
          onVisibilityChange={(v) => updateData('groupPlayVisibility', v)}
          onContinue={handleContinue}
          continueText="Complete profile"
        >
          <ChoiceSelect
            options={toOptions(GROUP_PLAY_MODE_LABELS)}
            value={data().groupPlay ?? ''}
            onChange={(v) => updateData('groupPlay', v as string)}
          />
        </OnboardingStep>
      </Match>
    </Switch>}>
        <AccountCreationScreen />
      </Show>
    </Show>
  )
}

export default OnboardingPage
