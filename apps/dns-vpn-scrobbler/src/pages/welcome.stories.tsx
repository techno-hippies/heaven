import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { WelcomePage } from './welcome'
import { createSignal } from 'solid-js'

const meta: Meta<typeof WelcomePage> = {
  title: 'Pages/Welcome',
  component: WelcomePage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    authState: {
      control: 'select',
      options: ['idle', 'authenticating', 'error'],
    },
    activeMethod: {
      control: 'select',
      options: ['passkey', 'wallet', undefined],
    },
  },
}

export default meta
type Story = StoryObj<typeof WelcomePage>

/** Default idle state with both auth options */
export const Default: Story = {
  args: {
    authState: 'idle',
  },
}

/** Authenticating with passkey - shows loading spinner with fingerprint */
export const AuthenticatingPasskey: Story = {
  args: {
    authState: 'authenticating',
    activeMethod: 'passkey',
  },
}

/** Authenticating with wallet - shows loading spinner with wallet icon */
export const AuthenticatingWallet: Story = {
  args: {
    authState: 'authenticating',
    activeMethod: 'wallet',
  },
}

/** Error state with retry button */
export const Error: Story = {
  args: {
    authState: 'error',
    error: 'Passkey verification was cancelled or timed out.',
  },
}

/** Error state with generic message */
export const ErrorGeneric: Story = {
  args: {
    authState: 'error',
  },
}

/** Interactive demo showing the full auth flow */
export const Interactive: Story = {
  render: () => {
    const [authState, setAuthState] = createSignal<'idle' | 'authenticating' | 'error'>('idle')
    const [activeMethod, setActiveMethod] = createSignal<'passkey' | 'wallet' | undefined>(undefined)
    const [error, setError] = createSignal<string | undefined>(undefined)

    const simulateAuth = (method: 'passkey' | 'wallet') => {
      setActiveMethod(method)
      setAuthState('authenticating')
      setError(undefined)

      // Simulate auth delay then random success/failure
      setTimeout(() => {
        if (Math.random() > 0.5) {
          // Success - in real app would redirect to dashboard
          setAuthState('idle')
          setActiveMethod(undefined)
          alert(`Successfully authenticated with ${method}!`)
        } else {
          // Failure
          setAuthState('error')
          setError(
            method === 'passkey'
              ? 'Passkey verification was cancelled or timed out.'
              : 'Wallet connection was rejected.'
          )
        }
      }, 2000)
    }

    const handleDismissError = () => {
      setAuthState('idle')
      setActiveMethod(undefined)
      setError(undefined)
    }

    return (
      <WelcomePage
        authState={authState()}
        activeMethod={activeMethod()}
        error={error()}
        onPasskeyAuth={() => simulateAuth('passkey')}
        onWalletAuth={() => simulateAuth('wallet')}
        onDismissError={handleDismissError}
      />
    )
  },
}
