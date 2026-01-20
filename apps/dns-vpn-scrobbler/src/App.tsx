import { Component, Show } from 'solid-js'
import { WelcomePage } from '@/pages/welcome'
import { Dashboard } from '@/pages/dashboard'
import { useAuth } from '@/app/providers/AuthContext'

export const App: Component = () => {
  const auth = useAuth()

  const authState = () => {
    if (auth.isAuthenticating()) return 'authenticating'
    if (auth.authError()) return 'error'
    return 'idle'
  }

  const handleRetry = () => {
    auth.clearError()
  }

  return (
    <Show
      when={auth.isAuthenticated()}
      fallback={
        <WelcomePage
          authState={authState()}
          activeMethod={auth.authMethod() ?? undefined}
          error={auth.authError() ?? undefined}
          onPasskeyAuth={auth.loginWithPasskey}
          onWalletAuth={auth.loginWithWallet}
          onRetry={handleRetry}
        />
      }
    >
      <Dashboard />
    </Show>
  )
}
