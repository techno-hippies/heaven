/**
 * Auth dialog wired to app auth context.
 * Renders as Drawer on mobile and Dialog on desktop via AuthModal.
 */

import type { Component } from 'solid-js'
import { injected } from '@wagmi/connectors'
import { useAuth } from '@/app/providers/AuthContext'
import { connect, wagmiConfig } from '@/app/providers/Web3Provider'
import { AuthModal } from './AuthModal'

export const AuthDialog: Component = () => {
  const auth = useAuth()

  const handleConnectWallet = async () => {
    auth.expectWalletConnection()

    try {
      await connect(wagmiConfig, { connector: injected() })
      // The watchAccount in AuthContext will handle the rest
    } catch (error) {
      console.error('[AuthDialog] Wallet connection failed:', error)
      // Error will be handled by the context
    }
  }

  return (
    <AuthModal
      open={auth.isAuthDialogOpen()}
      onOpenChange={(open) => {
        if (!open) {
          auth.closeAuthDialog()
        }
      }}
      isAuthenticating={auth.isAuthenticating()}
      isAuthenticated={auth.isAuthenticated()}
      authError={auth.authError()}
      authStatus={auth.authStatus() || null}
      eoaAddress={auth.eoaAddress()}
      onRegister={auth.register}
      onSignIn={auth.signIn}
      onConnectWallet={handleConnectWallet}
    />
  )
}
