/**
 * Responsive Auth Modal
 * - Mobile (<640px): Bottom sheet (Drawer) with drag-to-dismiss
 * - Desktop (≥640px): Centered dialog (Dialog)
 */

import { createSignal, createEffect, onMount, onCleanup, Show, type Component } from 'solid-js'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icons'
import { cn } from '@/lib/utils'

type AuthState = 'idle' | 'authenticating' | 'complete' | 'error'
type AuthMethod = 'passkey' | 'wallet' | null

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called when auth completes successfully */
  onSuccess?: () => void
  /** Auth context methods */
  isAuthenticating: boolean
  isAuthenticated: boolean
  authError: string | null
  authStatus: string | null
  eoaAddress: string | null
  onRegister: () => Promise<void>
  onSignIn: () => Promise<void>
  onConnectWallet: () => Promise<void>
}

export const AuthModal: Component<AuthModalProps> = (props) => {
  const [state, setState] = createSignal<AuthState>('idle')
  const [method, setMethod] = createSignal<AuthMethod>(null)
  const [action, setAction] = createSignal<'register' | 'signIn' | 'wallet' | null>(null)
  const [isMobile, setIsMobile] = createSignal(false)

  // Detect screen size
  onMount(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    onCleanup(() => window.removeEventListener('resize', checkMobile))
  })

  // Sync with auth state
  createEffect(() => {
    if (props.isAuthenticating) {
      setState('authenticating')
    } else if (props.authError) {
      setState('error')
    } else if (props.isAuthenticated && action()) {
      setState('complete')
      // Auto-close and call onSuccess after brief delay
      setTimeout(() => {
        props.onOpenChange(false)
        props.onSuccess?.()
        // Reset state
        setState('idle')
        setAction(null)
        setMethod(null)
      }, 800)
    }
  })

  // Reset state when sheet opens
  createEffect(() => {
    if (props.open) {
      setState('idle')
      setAction(null)
      setMethod(null)
    }
  })

  async function handleRegister() {
    setAction('register')
    try {
      await props.onRegister()
    } catch {
      // Error handled via props
    }
  }

  async function handleSignIn() {
    setAction('signIn')
    try {
      await props.onSignIn()
    } catch {
      // Error handled via props
    }
  }

  async function handleConnectWallet() {
    setAction('wallet')
    setMethod('wallet')
    try {
      await props.onConnectWallet()
    } catch {
      // Error handled via props
    }
  }

  function handleSelectPasskey() {
    setMethod('passkey')
  }

  function handleBack() {
    setMethod(null)
    setAction(null)
  }

  // Dynamic content based on state
  function getTitle() {
    if (state() === 'authenticating') {
      if (action() === 'wallet') return 'Connecting Wallet'
      return 'Complete the Passkey Prompt'
    }
    if (state() === 'complete') return 'Welcome!'
    if (state() === 'error') return 'Authentication Failed'
    if (method() === 'passkey') return 'Sign In with Passkey'
    return 'Create Your Account'
  }

  function getDescription() {
    if (state() === 'authenticating') {
      if (action() === 'wallet') {
        return props.authStatus || 'Please approve the connection in your wallet...'
      }
      return 'A passkey prompt should appear on your device. Follow the instructions to continue.'
    }
    if (state() === 'complete') return 'Your account is ready!'
    if (state() === 'error') return props.authError || 'Something went wrong. Please try again.'
    if (method() === 'passkey') {
      return "Use your device's passkey (Face ID, Touch ID, or Windows Hello) for secure authentication."
    }
    return 'Secure your profile with a passkey or wallet. Your identity is portable across apps.'
  }

  function getIcon() {
    if (state() === 'authenticating') return 'circle-notch'
    if (state() === 'complete') return 'check-circle'
    if (state() === 'error') return 'x-circle'
    if (method() === 'passkey') return 'fingerprint'
    if (action() === 'wallet') return 'wallet'
    return 'user-circle'
  }

  // Icon component - used in header
  const AuthIcon = () => (
    <div
      class={cn(
        'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
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
  )

  // Shared content component (buttons/actions only)
  const AuthContent = () => (
    <>
      {/* Method Selection (initial state, no method selected) */}
      <Show when={(state() === 'idle' || state() === 'error') && !method()}>
        <div class="flex flex-col gap-3">
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

        <p class="text-muted-foreground text-center mt-6">
          Secured by Lit Protocol
        </p>
      </Show>

      {/* Passkey Create/Sign In Choice */}
      <Show when={(state() === 'idle' || state() === 'error') && method() === 'passkey'}>
        <div class="flex flex-col gap-3">
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
      <Show when={state() === 'authenticating' && action() === 'wallet' && props.eoaAddress}>
        <div class="p-4 bg-muted rounded-lg text-center">
          <p class="text-muted-foreground mb-1">Connected wallet</p>
          <p class="font-mono">
            {props.eoaAddress?.slice(0, 6)}...{props.eoaAddress?.slice(-4)}
          </p>
        </div>
      </Show>
    </>
  )

  return (
    <Show
      when={isMobile()}
      fallback={
        // Desktop: Dialog
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
          <DialogContent class="max-w-sm">
            <DialogHeader class="text-center items-center pt-4">
              <DialogTitle class="text-xl">{getTitle()}</DialogTitle>
              <DialogDescription class="mt-2">{getDescription()}</DialogDescription>
            </DialogHeader>
            <div class="flex justify-center mt-2">
              <AuthIcon />
            </div>
            <div class="mt-2">
              <AuthContent />
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Mobile: Drawer */}
      <Drawer open={props.open} onOpenChange={props.onOpenChange}>
        <DrawerContent>
          <DrawerHeader class="text-center items-center pt-4">
            <DrawerTitle class="text-xl">{getTitle()}</DrawerTitle>
            <DrawerDescription class="mt-2">{getDescription()}</DrawerDescription>
          </DrawerHeader>
          <div class="flex justify-center mt-2">
            <AuthIcon />
          </div>
          <div class="mt-2 pb-6">
            <AuthContent />
          </div>
        </DrawerContent>
      </Drawer>
    </Show>
  )
}
