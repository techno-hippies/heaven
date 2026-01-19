import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { AuthModal } from './AuthModal'
import { Button } from '@/ui/button'

const meta: Meta<typeof AuthModal> = {
  title: 'Components/Auth/AuthModal',
  component: AuthModal,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof AuthModal>

/**
 * Desktop view (>=640px) - shows as centered Dialog.
 * Resize browser or use Storybook viewport to see responsive behavior.
 */
export const Desktop: Story = {
  parameters: {
    viewport: { defaultViewport: 'tablet' },
  },
  render: () => {
    const [open, setOpen] = createSignal(true)

    return (
      <AuthModal
        open={open()}
        onOpenChange={setOpen}
        isAuthenticating={false}
        isAuthenticated={false}
        authError={null}
        authStatus={null}
        eoaAddress={null}
        onRegister={async () => {}}
        onSignIn={async () => {}}
        onConnectWallet={async () => {}}
      />
    )
  },
}

/**
 * Mobile view (<640px) - shows as bottom Drawer.
 */
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => {
    const [open, setOpen] = createSignal(true)

    return (
      <AuthModal
        open={open()}
        onOpenChange={setOpen}
        isAuthenticating={false}
        isAuthenticated={false}
        authError={null}
        authStatus={null}
        eoaAddress={null}
        onRegister={async () => {}}
        onSignIn={async () => {}}
        onConnectWallet={async () => {}}
      />
    )
  },
}

/**
 * Interactive demo - click button to open.
 */
export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false)
    const [isAuthenticating, setIsAuthenticating] = createSignal(false)
    const [isAuthenticated, setIsAuthenticated] = createSignal(false)
    const [authError] = createSignal<string | null>(null)
    const [authStatus, setAuthStatus] = createSignal<string | null>(null)

    const simulateAuth = async () => {
      setIsAuthenticating(true)
      setAuthStatus('Creating your account...')
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsAuthenticating(false)
      setIsAuthenticated(true)
    }

    const handleSuccess = () => {
      // Reset for demo
      setTimeout(() => {
        setIsAuthenticated(false)
        setAuthStatus(null)
      }, 1000)
    }

    return (
      <div class="flex flex-col items-center gap-4">
        <p class="text-muted-foreground text-sm">
          Resize browser to see Drawer (mobile) vs Dialog (desktop)
        </p>
        <Button onClick={() => setOpen(true)}>Create Profile</Button>

        <AuthModal
          open={open()}
          onOpenChange={setOpen}
          onSuccess={handleSuccess}
          isAuthenticating={isAuthenticating()}
          isAuthenticated={isAuthenticated()}
          authError={authError()}
          authStatus={authStatus()}
          eoaAddress={null}
          onRegister={simulateAuth}
          onSignIn={simulateAuth}
          onConnectWallet={simulateAuth}
        />
      </div>
    )
  },
}

/**
 * Authenticating state (passkey prompt).
 */
export const Authenticating: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)

    return (
      <AuthModal
        open={open()}
        onOpenChange={setOpen}
        isAuthenticating={true}
        isAuthenticated={false}
        authError={null}
        authStatus={null}
        eoaAddress={null}
        onRegister={async () => {}}
        onSignIn={async () => {}}
        onConnectWallet={async () => {}}
      />
    )
  },
}

/**
 * Wallet connecting state.
 */
export const WalletConnecting: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)

    return (
      <AuthModal
        open={open()}
        onOpenChange={setOpen}
        isAuthenticating={true}
        isAuthenticated={false}
        authError={null}
        authStatus="Please approve the connection in your wallet..."
        eoaAddress="0x1234567890abcdef1234567890abcdef12345678"
        onRegister={async () => {}}
        onSignIn={async () => {}}
        onConnectWallet={async () => {}}
        initialAction="wallet"
      />
    )
  },
}

/**
 * Error state.
 */
export const Error: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)

    return (
      <AuthModal
        open={open()}
        onOpenChange={setOpen}
        isAuthenticating={false}
        isAuthenticated={false}
        authError="User rejected the request. Please try again."
        authStatus={null}
        eoaAddress={null}
        onRegister={async () => {}}
        onSignIn={async () => {}}
        onConnectWallet={async () => {}}
      />
    )
  },
}

/**
 * Success state (briefly shown before closing).
 */
export const Success: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)

    return (
      <AuthModal
        open={open()}
        onOpenChange={setOpen}
        isAuthenticating={false}
        isAuthenticated={true}
        authError={null}
        authStatus={null}
        eoaAddress={null}
        onRegister={async () => {}}
        onSignIn={async () => {}}
        onConnectWallet={async () => {}}
      />
    )
  },
}
