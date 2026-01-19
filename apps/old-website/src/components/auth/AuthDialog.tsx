/**
 * Authentication Dialog for passkey (WebAuthn) and wallet login/registration
 * Uses Lit Protocol PKP for decentralized identity
 */

import { createSignal, createEffect, Show, type Component } from 'solid-js'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icons'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { wagmiConfig, connect } from '@/providers/Web3Provider'
import { injected } from '@wagmi/connectors'

type AuthState = 'idle' | 'authenticating' | 'complete' | 'error'
type AuthMethod = 'passkey' | 'wallet' | null

export const AuthDialog: Component = () => {
  const auth = useAuth()
  const [state, setState] = createSignal<AuthState>('idle')
  const [method, setMethod] = createSignal<AuthMethod>(null)
  const [action, setAction] = createSignal<'register' | 'signIn' | 'wallet' | null>(null)

  // Sync with auth context state
  createEffect(() => {
    if (auth.isAuthenticating()) {
      setState('authenticating')
    } else if (auth.authError()) {
      setState('error')
    } else if (auth.isAuthenticated() && action()) {
      setState('complete')
      // Auto-close after success
      setTimeout(() => {
        auth.closeAuthDialog()
        setState('idle')
        setAction(null)
        setMethod(null)
      }, 1000)
    }
  })

  // Reset state when dialog opens
  createEffect(() => {
    if (auth.isAuthDialogOpen()) {
      setState('idle')
      setAction(null)
      setMethod(null)
    }
  })

  async function handleRegister() {
    setAction('register')
    try {
      await auth.register()
    } catch {
      // Error is handled by context
    }
  }

  async function handleSignIn() {
    setAction('signIn')
    try {
      await auth.signIn()
    } catch {
      // Error is handled by context
    }
  }

  async function handleConnectWallet() {
    setAction('wallet')
    setMethod('wallet')
    auth.expectWalletConnection()

    try {
      // Trigger wallet connection via wagmi
      await connect(wagmiConfig, { connector: injected() })
      // The watchAccount in AuthContext will handle the rest
    } catch (error) {
      console.error('[AuthDialog] Wallet connection failed:', error)
      // Error will be handled by the context
    }
  }

  function handleSelectPasskey() {
    setMethod('passkey')
  }

  function handleBack() {
    setMethod(null)
    setAction(null)
  }

  // Get title based on state
  function getTitle() {
    if (state() === 'authenticating') {
      if (action() === 'wallet') return 'Connecting Wallet'
      return 'Complete the Passkey Prompt'
    }
    if (state() === 'complete') return 'Welcome!'
    if (state() === 'error') return 'Authentication Failed'
    if (method() === 'passkey') return 'Sign In with Passkey'
    return 'Sign In'
  }

  // Get description based on state
  function getDescription() {
    if (state() === 'authenticating') {
      if (action() === 'wallet') {
        return auth.authStatus() || 'Please approve the connection in your wallet...'
      }
      return 'A passkey prompt should appear on your device. Follow the instructions to continue.'
    }
    if (state() === 'complete') return "You're now connected to Neodate."
    if (state() === 'error') return auth.authError() || 'Something went wrong. Please try again.'
    if (method() === 'passkey') {
      return "Use your device's passkey (Face ID, Touch ID, or Windows Hello) for secure authentication."
    }
    return 'Choose how you want to connect to Neodate.'
  }

  // Get icon based on state
  function getIcon() {
    if (state() === 'authenticating') return 'circle-notch'
    if (state() === 'complete') return 'check-circle'
    if (state() === 'error') return 'x-circle'
    if (method() === 'passkey') return 'fingerprint'
    if (action() === 'wallet') return 'wallet'
    return 'user-circle'
  }

  return (
    <Dialog open={auth.isAuthDialogOpen()} onOpenChange={(open) => !open && auth.closeAuthDialog()}>
      <DialogContent class="max-w-sm">
        <DialogHeader class="text-center items-center">
          {/* Icon */}
          <div
            class={cn(
              'w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors',
              state() === 'complete' ? 'bg-emerald-500/10' : 'bg-primary/10',
              state() === 'error' && 'bg-destructive/10'
            )}
          >
            <Icon
              name={getIcon()}
              class={cn(
                'text-3xl',
                state() === 'authenticating' && 'animate-spin text-primary',
                state() === 'complete' && 'text-emerald-500',
                state() === 'error' && 'text-destructive',
                state() === 'idle' && 'text-primary'
              )}
              weight={state() === 'complete' ? 'fill' : 'regular'}
            />
          </div>

          <DialogTitle class="text-xl">{getTitle()}</DialogTitle>
          <DialogDescription class="mt-2">{getDescription()}</DialogDescription>
        </DialogHeader>

        {/* Method Selection (initial state, no method selected) */}
        <Show when={(state() === 'idle' || state() === 'error') && !method()}>
          <div class="flex flex-col gap-3 mt-6">
            <Button
              onClick={handleSelectPasskey}
              variant="default"
              class="w-full py-4 h-auto flex items-center gap-3"
            >
              <Icon name="fingerprint" class="text-2xl" />
              <span>Continue with Passkey</span>
            </Button>

            <div class="flex items-center gap-4">
              <div class="flex-1 h-px bg-border" />
              <span class="text-muted-foreground">or</span>
              <div class="flex-1 h-px bg-border" />
            </div>

            <Button
              onClick={handleConnectWallet}
              variant="outline"
              class="w-full py-4 h-auto flex items-center gap-3"
            >
              <Icon name="wallet" class="text-2xl" />
              <span>Connect Wallet</span>
            </Button>
          </div>

          <p class="text-xs text-muted-foreground text-center mt-8">
            Secured by Lit Protocol
          </p>
        </Show>

        {/* Passkey Create/Sign In Choice */}
        <Show when={(state() === 'idle' || state() === 'error') && method() === 'passkey'}>
          <div class="flex flex-col gap-3 mt-6">
            <Button onClick={handleRegister} variant="default" class="w-full py-4 h-auto">
              Create Account
            </Button>
            <Button onClick={handleSignIn} variant="outline" class="w-full py-4 h-auto">
              Sign In
            </Button>
          </div>

          <button
            onClick={handleBack}
            class="text-muted-foreground hover:text-foreground mt-6 flex items-center justify-center gap-1"
          >
            <Icon name="arrow-left" class="text-base" />
            <span>Back</span>
          </button>
        </Show>

        {/* Wallet connecting state - show wallet address if connected */}
        <Show when={state() === 'authenticating' && action() === 'wallet' && auth.eoaAddress()}>
          <div class="mt-6 p-4 bg-muted rounded-lg text-center">
            <p class="text-xs text-muted-foreground mb-1">Connected wallet</p>
            <p class="font-mono">
              {auth.eoaAddress()?.slice(0, 6)}...{auth.eoaAddress()?.slice(-4)}
            </p>
          </div>
        </Show>
      </DialogContent>
    </Dialog>
  )
}
