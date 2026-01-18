import { Component, createSignal, Match, Show, Switch } from 'solid-js'
import { Icon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input, InputWithCopy } from '@/components/ui/input'
import { PageLayout } from '@/components/ui/page-layout'

export type ClaimStep = 'choose' | 'bio-edit' | 'enter-code' | 'verifying' | 'error' | 'success'

export interface ShadowProfile {
  id: string
  pseudonym: string
  avatarUrl: string
  bio?: string
  platform: 'dateme' | 'acx' | 'cuties' | 'manifold'
  sourceUrl: string
}

export interface ClaimPageProps {
  profile: ShadowProfile
  step: ClaimStep
  code?: string
  expiresAt?: Date
  error?: string
  onChooseBioEdit?: () => void
  onChooseEnterCode?: () => void
  onVerify?: () => void
  onSubmitCode?: (code: string) => void
  onRetry?: () => void
  onCreatePasskey?: () => void
  class?: string
}

const PLATFORM_LABELS: Record<string, string> = {
  dateme: 'dateme.directory',
  acx: 'ACX',
  cuties: 'cuties.dating',
  manifold: 'manifold.love',
}

export const ClaimPage: Component<ClaimPageProps> = (props) => {
  const [inputCode, setInputCode] = createSignal('')

  const platformLabel = () => PLATFORM_LABELS[props.profile.platform] || props.profile.platform

  const timeRemaining = () => {
    if (!props.expiresAt) return null
    const diff = props.expiresAt.getTime() - Date.now()
    if (diff <= 0) return 'Expired'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const footerContent = () => {
    switch (props.step) {
      case 'bio-edit':
        return (
          <Button size="xl" class="flex-1" onClick={props.onVerify}>
            Verify
          </Button>
        )
      case 'enter-code':
        return (
          <Button
            size="xl"
            class="flex-1"
            onClick={() => props.onSubmitCode?.(inputCode())}
            disabled={inputCode().length < 6}
          >
            Verify
          </Button>
        )
      case 'error':
        return (
          <Button variant="secondary" size="xl" class="flex-1" onClick={props.onRetry}>
            Try again
          </Button>
        )
      case 'success':
        return (
          <Button size="xl" class="flex-1" onClick={props.onCreatePasskey}>
            Create Passkey
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <PageLayout class={props.class} footer={footerContent()}>
      <div class="flex flex-col lg:min-h-screen lg:flex-row lg:items-center lg:justify-center lg:p-12 lg:gap-12">

        {/* Profile Preview */}
        <div class="relative w-full lg:w-[420px] lg:flex-shrink-0 aspect-square lg:rounded-3xl overflow-hidden bg-secondary">
          <img
            src={props.profile.avatarUrl}
            alt={props.profile.pseudonym}
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div class="absolute bottom-0 left-0 right-0 p-6 lg:hidden">
            <h1 class="text-3xl font-bold text-white">{props.profile.pseudonym}</h1>
            <p class="text-lg text-white/70 mt-0.5">{platformLabel()}</p>
          </div>
        </div>

        {/* Content */}
        <div class="flex-1 lg:max-w-md">
          {/* Desktop header */}
          <div class="hidden lg:block">
            <h1 class="text-4xl font-bold text-foreground">{props.profile.pseudonym}</h1>
            <p class="text-xl text-muted-foreground mt-1">{platformLabel()}</p>
          </div>

          <div class="px-6 py-6 lg:px-0 lg:mt-5">
            <Switch>
              {/* Step: Choose Method */}
              <Match when={props.step === 'choose'}>
                <h2 class="text-2xl font-bold">Claim this profile</h2>
                <p class="text-lg text-muted-foreground mt-2">Prove you own this account</p>

                <div class="mt-6 space-y-3">
                  <button
                    class="w-full p-4 rounded-2xl bg-secondary hover:bg-secondary/80 transition-all text-left flex items-center gap-4"
                    onClick={props.onChooseBioEdit}
                  >
                    <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="pencil" class="text-xl text-primary" />
                    </div>
                    <div class="flex-1">
                      <div class="text-lg font-semibold">Add code to bio</div>
                      <div class="text-base text-muted-foreground">Recommended</div>
                    </div>
                    <Icon name="caret-right" class="text-xl text-muted-foreground" />
                  </button>

                  <button
                    class="w-full p-4 rounded-2xl bg-secondary hover:bg-secondary/80 transition-all text-left flex items-center gap-4"
                    onClick={props.onChooseEnterCode}
                  >
                    <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="link" class="text-xl text-primary" />
                    </div>
                    <div class="flex-1">
                      <div class="text-lg font-semibold">I have a code</div>
                      <div class="text-base text-muted-foreground">From DM or email</div>
                    </div>
                    <Icon name="caret-right" class="text-xl text-muted-foreground" />
                  </button>
                </div>
              </Match>

              {/* Step: Bio Edit */}
              <Match when={props.step === 'bio-edit'}>
                <h2 class="text-2xl font-bold">Add to your bio</h2>
                <p class="text-lg text-muted-foreground mt-2">
                  Add this code anywhere in your {platformLabel()} bio
                </p>

                <div class="mt-6">
                  <InputWithCopy value={props.code || ''} />
                </div>

                <Show when={timeRemaining()}>
                  <div class="flex items-center gap-2 mt-4 text-base text-muted-foreground">
                    <Icon name="timer" class="text-lg" />
                    <span>Expires in {timeRemaining()}</span>
                  </div>
                </Show>

                <p class="text-base text-muted-foreground mt-4">
                  You can remove the code after verification
                </p>

                {/* Desktop button */}
                <div class="hidden lg:block mt-8">
                  <Button size="xl" class="w-full" onClick={props.onVerify}>
                    Verify
                  </Button>
                </div>
              </Match>

              {/* Step: Enter Code */}
              <Match when={props.step === 'enter-code'}>
                <h2 class="text-2xl font-bold">Enter your code</h2>
                <p class="text-lg text-muted-foreground mt-2">From DM or email</p>

                <div class="mt-6">
                  <Input
                    placeholder="NEO-XXXXXX"
                    value={inputCode()}
                    onInput={(e) => setInputCode(e.currentTarget.value.toUpperCase())}
                    class="text-center font-mono text-xl tracking-wider"
                  />
                </div>

                {/* Desktop button */}
                <div class="hidden lg:block mt-8">
                  <Button
                    size="xl"
                    class="w-full"
                    onClick={() => props.onSubmitCode?.(inputCode())}
                    disabled={inputCode().length < 6}
                  >
                    Verify
                  </Button>
                </div>
              </Match>

              {/* Step: Verifying */}
              <Match when={props.step === 'verifying'}>
                <div class="flex flex-col items-center justify-center py-12">
                  <Icon name="circle-notch" class="text-5xl text-primary animate-spin" />
                  <p class="mt-4 text-lg text-muted-foreground">Checking...</p>
                </div>
              </Match>

              {/* Step: Error */}
              <Match when={props.step === 'error'}>
                <div class="flex flex-col items-center text-center py-8">
                  <div class="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Icon name="x-circle" class="text-4xl text-destructive" />
                  </div>
                  <h2 class="text-2xl font-bold mt-6">Verification failed</h2>
                  <p class="text-lg text-muted-foreground mt-2">{props.error || 'Code not found'}</p>
                </div>

                {/* Desktop button */}
                <div class="hidden lg:block mt-8">
                  <Button variant="secondary" size="xl" class="w-full" onClick={props.onRetry}>
                    Try again
                  </Button>
                </div>
              </Match>

              {/* Step: Success */}
              <Match when={props.step === 'success'}>
                <div class="flex flex-col items-center text-center py-8">
                  <div class="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                    <Icon name="check" weight="bold" class="text-4xl text-white" />
                  </div>
                  <h2 class="text-2xl font-bold mt-6">Verified</h2>
                  <p class="text-lg text-muted-foreground mt-2">Create a passkey to secure your profile</p>
                </div>

                <div class="mt-4 p-4 rounded-2xl bg-secondary/50">
                  <div class="flex items-start gap-3">
                    <Icon name="shield-check" class="text-xl text-muted-foreground mt-0.5" />
                    <p class="text-base text-muted-foreground">
                      Passkeys use your device's biometrics. Your key never leaves your device.
                    </p>
                  </div>
                </div>

                {/* Desktop button */}
                <div class="hidden lg:block mt-8">
                  <Button size="xl" class="w-full" onClick={props.onCreatePasskey}>
                    Create Passkey
                  </Button>
                </div>
              </Match>
            </Switch>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default ClaimPage
