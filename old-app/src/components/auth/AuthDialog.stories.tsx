import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icons'
import { cn } from '@/lib/utils'

const meta: Meta = {
  title: 'Auth/AuthDialog',
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj

/**
 * Initial method selection view - user chooses between Passkey or Wallet
 */
export const MethodSelection: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)

    return (
      <Dialog open={open()} onOpenChange={setOpen}>
        <DialogContent class="max-w-sm">
          <DialogHeader class="text-center items-center">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-primary/10">
              <Icon name="user-circle" class="text-3xl text-primary" />
            </div>
            <DialogTitle class="text-xl">Sign In</DialogTitle>
            <DialogDescription class="mt-2">
              Choose how you want to connect to Neodate.
            </DialogDescription>
          </DialogHeader>

          <div class="flex flex-col gap-3 mt-6">
            <Button variant="default" class="w-full py-4 h-auto flex items-center gap-3">
              <Icon name="fingerprint" class="text-2xl" />
              <span>Continue with Passkey</span>
            </Button>

            <div class="flex items-center gap-4">
              <div class="flex-1 h-px bg-border" />
              <span class="text-muted-foreground">or</span>
              <div class="flex-1 h-px bg-border" />
            </div>

            <Button variant="outline" class="w-full py-4 h-auto flex items-center gap-3">
              <Icon name="wallet" class="text-2xl" />
              <span>Connect Wallet</span>
            </Button>
          </div>

          <p class="text-xs text-muted-foreground text-center mt-8">
            Secured by Lit Protocol
          </p>
        </DialogContent>
      </Dialog>
    )
  },
}

/**
 * Passkey create/sign-in choice after selecting passkey method
 */
export const PasskeyChoice: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)

    return (
      <Dialog open={open()} onOpenChange={setOpen}>
        <DialogContent class="max-w-sm">
          <DialogHeader class="text-center items-center">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-primary/10">
              <Icon name="fingerprint" class="text-3xl text-primary" />
            </div>
            <DialogTitle class="text-xl">Sign In with Passkey</DialogTitle>
            <DialogDescription class="mt-2">
              Use your device's passkey (Face ID, Touch ID, or Windows Hello) for secure authentication.
            </DialogDescription>
          </DialogHeader>

          <div class="flex flex-col gap-3 mt-6">
            <Button variant="default" class="w-full py-4 h-auto">
              Create Account
            </Button>
            <Button variant="outline" class="w-full py-4 h-auto">
              Sign In
            </Button>
          </div>

          <button class="text-muted-foreground hover:text-foreground mt-6 flex items-center justify-center gap-1">
            <Icon name="arrow-left" class="text-base" />
            <span>Back</span>
          </button>
        </DialogContent>
      </Dialog>
    )
  },
}

/**
 * Authenticating state - passkey prompt active
 */
export const AuthenticatingPasskey: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)

    return (
      <Dialog open={open()} onOpenChange={setOpen}>
        <DialogContent class="max-w-sm">
          <DialogHeader class="text-center items-center">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-primary/10">
              <Icon name="circle-notch" class="text-3xl text-primary animate-spin" />
            </div>
            <DialogTitle class="text-xl">Complete the Passkey Prompt</DialogTitle>
            <DialogDescription class="mt-2">
              A passkey prompt should appear on your device. Follow the instructions to continue.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  },
}

/**
 * Wallet connecting state - waiting for wallet connection
 */
export const ConnectingWallet: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)

    return (
      <Dialog open={open()} onOpenChange={setOpen}>
        <DialogContent class="max-w-sm">
          <DialogHeader class="text-center items-center">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-primary/10">
              <Icon name="circle-notch" class="text-3xl text-primary animate-spin" />
            </div>
            <DialogTitle class="text-xl">Connecting Wallet</DialogTitle>
            <DialogDescription class="mt-2">
              Please approve the connection in your wallet...
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  },
}

/**
 * Wallet connected, creating PKP
 */
export const WalletConnectedCreatingPKP: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)

    return (
      <Dialog open={open()} onOpenChange={setOpen}>
        <DialogContent class="max-w-sm">
          <DialogHeader class="text-center items-center">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-primary/10">
              <Icon name="circle-notch" class="text-3xl text-primary animate-spin" />
            </div>
            <DialogTitle class="text-xl">Connecting Wallet</DialogTitle>
            <DialogDescription class="mt-2">
              Creating your account...
            </DialogDescription>
          </DialogHeader>

          <div class="mt-6 p-4 bg-muted rounded-lg text-center">
            <p class="text-xs text-muted-foreground mb-1">Connected wallet</p>
            <p class="font-mono">0x1234...5678</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  },
}

/**
 * Success state
 */
export const Success: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)

    return (
      <Dialog open={open()} onOpenChange={setOpen}>
        <DialogContent class="max-w-sm">
          <DialogHeader class="text-center items-center">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-emerald-500/10">
              <Icon name="check-circle" class="text-3xl text-emerald-500" weight="fill" />
            </div>
            <DialogTitle class="text-xl">Welcome!</DialogTitle>
            <DialogDescription class="mt-2">
              You're now connected to Neodate.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  },
}

/**
 * Error state
 */
export const Error: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)

    return (
      <Dialog open={open()} onOpenChange={setOpen}>
        <DialogContent class="max-w-sm">
          <DialogHeader class="text-center items-center">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-destructive/10">
              <Icon name="x-circle" class="text-3xl text-destructive" />
            </div>
            <DialogTitle class="text-xl">Authentication Failed</DialogTitle>
            <DialogDescription class="mt-2">
              User rejected the request. Please try again.
            </DialogDescription>
          </DialogHeader>

          <div class="flex flex-col gap-3 mt-6">
            <Button variant="default" class="w-full py-4 h-auto flex items-center gap-3">
              <Icon name="fingerprint" class="text-2xl" />
              <span>Continue with Passkey</span>
            </Button>

            <div class="flex items-center gap-4">
              <div class="flex-1 h-px bg-border" />
              <span class="text-muted-foreground">or</span>
              <div class="flex-1 h-px bg-border" />
            </div>

            <Button variant="outline" class="w-full py-4 h-auto flex items-center gap-3">
              <Icon name="wallet" class="text-2xl" />
              <span>Connect Wallet</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  },
}

/**
 * Interactive demo showing the full flow
 */
export const InteractiveDemo: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false)
    const [step, setStep] = createSignal<'select' | 'passkey' | 'authenticating' | 'success'>('select')

    const handlePasskey = () => {
      setStep('passkey')
    }

    const handleAuth = () => {
      setStep('authenticating')
      setTimeout(() => {
        setStep('success')
        setTimeout(() => {
          setOpen(false)
          setStep('select')
        }, 1500)
      }, 2000)
    }

    const handleBack = () => {
      setStep('select')
    }

    return (
      <div class="flex flex-col items-center gap-4">
        <Button onClick={() => setOpen(true)}>Open Auth Dialog</Button>
        <p class="text-muted-foreground">
          Current step: {step()}
        </p>

        <Dialog open={open()} onOpenChange={(v) => { setOpen(v); if (!v) setStep('select') }}>
          <DialogContent class="max-w-sm">
            <DialogHeader class="text-center items-center">
              <div class={cn(
                'w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors',
                step() === 'success' ? 'bg-emerald-500/10' : 'bg-primary/10'
              )}>
                <Icon
                  name={
                    step() === 'authenticating' ? 'circle-notch' :
                    step() === 'success' ? 'check-circle' :
                    step() === 'passkey' ? 'fingerprint' : 'user-circle'
                  }
                  class={cn(
                    'text-3xl',
                    step() === 'authenticating' && 'animate-spin text-primary',
                    step() === 'success' && 'text-emerald-500',
                    (step() === 'select' || step() === 'passkey') && 'text-primary'
                  )}
                  weight={step() === 'success' ? 'fill' : 'regular'}
                />
              </div>
              <DialogTitle class="text-xl">
                {step() === 'select' && 'Sign In'}
                {step() === 'passkey' && 'Sign In with Passkey'}
                {step() === 'authenticating' && 'Complete the Passkey Prompt'}
                {step() === 'success' && 'Welcome!'}
              </DialogTitle>
              <DialogDescription class="mt-2">
                {step() === 'select' && 'Choose how you want to connect to Neodate.'}
                {step() === 'passkey' && "Use your device's passkey for secure authentication."}
                {step() === 'authenticating' && 'A passkey prompt should appear on your device.'}
                {step() === 'success' && "You're now connected to Neodate."}
              </DialogDescription>
            </DialogHeader>

            {step() === 'select' && (
              <>
                <div class="flex flex-col gap-3 mt-6">
                  <Button onClick={handlePasskey} variant="default" class="w-full py-4 h-auto flex items-center gap-3">
                    <Icon name="fingerprint" class="text-2xl" />
                    <span>Continue with Passkey</span>
                  </Button>

                  <div class="flex items-center gap-4">
                    <div class="flex-1 h-px bg-border" />
                    <span class="text-muted-foreground">or</span>
                    <div class="flex-1 h-px bg-border" />
                  </div>

                  <Button variant="outline" class="w-full py-4 h-auto flex items-center gap-3">
                    <Icon name="wallet" class="text-2xl" />
                    <span>Connect Wallet</span>
                  </Button>
                </div>

                <p class="text-xs text-muted-foreground text-center mt-8">
                  Secured by Lit Protocol
                </p>
              </>
            )}

            {step() === 'passkey' && (
              <>
                <div class="flex flex-col gap-3 mt-6">
                  <Button onClick={handleAuth} variant="default" class="w-full py-4 h-auto">
                    Create Account
                  </Button>
                  <Button onClick={handleAuth} variant="outline" class="w-full py-4 h-auto">
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
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  },
}
