import { Component, Show } from 'solid-js'
import { Button } from '@/ui/button'
import { Alert } from '@/ui/alert'
import { Spinner } from '@/ui/spinner'

export type AuthState = 'idle' | 'authenticating' | 'error'
export type AuthMethod = 'passkey' | 'wallet'

export interface WelcomePageProps {
  /** Current authentication state */
  authState?: AuthState
  /** Which auth method is being used (when authenticating) */
  activeMethod?: AuthMethod
  /** Error message to display */
  error?: string
  /** Called when user clicks passkey button */
  onPasskeyAuth?: () => void
  /** Called when user clicks wallet button */
  onWalletAuth?: () => void
  /** Called to dismiss error */
  onDismissError?: () => void
}

export const WelcomePage: Component<WelcomePageProps> = (props) => {
  const authState = () => props.authState ?? 'idle'
  const isAuthenticating = () => authState() === 'authenticating'
  const hasError = () => authState() === 'error'
  const isPasskeyLoading = () => isAuthenticating() && props.activeMethod === 'passkey'
  const isWalletLoading = () => isAuthenticating() && props.activeMethod === 'wallet'

  return (
    <div class="min-h-screen bg-background flex flex-col relative">
      {/* Alert overlay - absolutely positioned so it doesn't affect layout */}
      <Show when={hasError()}>
        <div class="absolute top-0 left-0 right-0 p-4 z-10">
          <Alert
            variant="error"
            message={props.error || 'Something went wrong. Please try again.'}
            onDismiss={props.onDismissError}
          />
        </div>
      </Show>

      {/* Center content - logo always centered */}
      <div class="flex-1 flex flex-col items-center justify-center">
        <img
          src="/images/heaven-logo-350x350.png"
          alt="Heaven"
          class="h-40 w-auto"
        />
      </div>

      {/* Fixed bottom area - buttons always visible */}
      <div class="p-6 pt-0">
        <div class="w-full max-w-md mx-auto space-y-3">
          <Button
            class="w-full"
            size="xl"
            onClick={props.onPasskeyAuth}
            disabled={isAuthenticating()}
          >
            <Show when={isPasskeyLoading()}>
              <Spinner size="sm" class="border-primary-foreground border-t-transparent" />
            </Show>
            {isPasskeyLoading() ? 'Authenticating...' : 'Continue with Passkey'}
          </Button>

          <Button
            variant="outline"
            class="w-full"
            size="xl"
            onClick={props.onWalletAuth}
            disabled={isAuthenticating()}
          >
            <Show when={isWalletLoading()}>
              <Spinner size="sm" />
            </Show>
            {isWalletLoading() ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        </div>
      </div>
    </div>
  )
}
