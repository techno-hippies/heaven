/**
 * Auth Page
 *
 * Handles WebAuthn authentication for Tauri desktop apps.
 * Opens in system browser, handles passkey auth, POSTs result back to localhost callback.
 *
 * Query params:
 * - callback: URL to POST result to (http://127.0.0.1:PORT/callback)
 */

import { Component, createSignal, onMount, Switch, Match } from 'solid-js'
import { Button } from '@/ui/button'
import { Spinner } from '@/ui/spinner'
import { registerWithWebAuthn, authenticateWithWebAuthn, type PKPInfo, type AuthData } from '@/lib/lit'

type AuthStatus = 'idle' | 'authenticating' | 'success' | 'error'

export const Auth: Component = () => {
  const [status, setStatus] = createSignal<AuthStatus>('idle')
  const [error, setError] = createSignal<string | null>(null)
  const [authMode, setAuthMode] = createSignal<'signin' | 'register'>('signin')

  // Parse params from hash (URL format: /#/auth?callback=...)
  const getHashParams = () => {
    const hash = window.location.hash
    const queryIndex = hash.indexOf('?')
    if (queryIndex === -1) return new URLSearchParams()
    return new URLSearchParams(hash.substring(queryIndex + 1))
  }

  const hashParams = getHashParams()
  const callbackUrl = () => hashParams.get('callback') || undefined

  // Send result to Tauri via POST
  const sendCallback = async (data: Record<string, unknown>) => {
    const url = callbackUrl()
    if (!url) return false
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.ok
    } catch (e) {
      console.error('[Auth] Callback failed:', e)
      return false
    }
  }

  const handleAuthSuccess = async (pkpInfo: PKPInfo, authData: AuthData, isNewUser: boolean) => {
    const sent = await sendCallback({
      pkpPublicKey: pkpInfo.publicKey,
      pkpAddress: pkpInfo.ethAddress,
      pkpTokenId: pkpInfo.tokenId,
      authMethodType: authData.authMethodType,
      authMethodId: authData.authMethodId,
      accessToken: authData.accessToken,
      isNewUser,
    })

    if (sent) {
      setStatus('success')
      // Auto-close after delay
      setTimeout(() => window.close(), 1500)
    } else {
      setError('Failed to send result to app')
      setStatus('error')
    }
  }

  // Guard against double-calls
  let inFlight = false

  const performSignIn = async () => {
    if (inFlight) return
    inFlight = true

    setAuthMode('signin')
    setStatus('authenticating')
    setError(null)

    try {
      const result = await authenticateWithWebAuthn()
      await handleAuthSuccess(result.pkpInfo, result.authData, false)
    } catch (e: unknown) {
      const err = e as Error
      console.error('[Auth] Sign in failed:', err)
      setError(err.message || 'Sign in failed')
      setStatus('error')
      await sendCallback({ error: err.message || 'Sign in failed' })
    } finally {
      inFlight = false
    }
  }

  const performRegister = async () => {
    if (inFlight) return
    inFlight = true

    setAuthMode('register')
    setStatus('authenticating')
    setError(null)

    try {
      const result = await registerWithWebAuthn()
      await handleAuthSuccess(result.pkpInfo, result.authData, true)
    } catch (e: unknown) {
      const err = e as Error
      console.error('[Auth] Registration failed:', err)
      setError(err.message || 'Registration failed')
      setStatus('error')
      await sendCallback({ error: err.message || 'Registration failed' })
    } finally {
      inFlight = false
    }
  }

  // Check for missing callback
  onMount(() => {
    if (!callbackUrl()) {
      setError('Missing callback parameter')
      setStatus('error')
    }
  })

  return (
    <div class="min-h-screen bg-background flex items-center justify-center p-6">
      <div class="w-full max-w-md">
        <div class="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <Switch>
            {/* Authenticating */}
            <Match when={status() === 'authenticating'}>
              <div class="text-center space-y-6">
                <Spinner size="lg" class="mx-auto" />
                <div>
                  <h2 class="text-2xl font-bold text-foreground">
                    {authMode() === 'register' ? 'Creating Account...' : 'Signing In...'}
                  </h2>
                  <p class="text-muted-foreground mt-2">
                    Complete the passkey prompt
                  </p>
                </div>
              </div>
            </Match>

            {/* Success */}
            <Match when={status() === 'success'}>
              <div class="text-center space-y-6">
                <div class="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <svg class="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-foreground">Success!</h2>
                  <p class="text-muted-foreground mt-2">You can close this window.</p>
                </div>
              </div>
            </Match>

            {/* Error */}
            <Match when={status() === 'error'}>
              <div class="text-center space-y-6">
                <div class="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                  <svg class="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-foreground">Authentication Failed</h2>
                  <p class="text-destructive mt-2">{error()}</p>
                </div>
                <div class="space-y-3">
                  <Button
                    onClick={() => authMode() === 'register' ? performRegister() : performSignIn()}
                    size="lg"
                    class="w-full"
                  >
                    Try Again
                  </Button>
                  <Button onClick={() => setStatus('idle')} variant="outline" size="lg" class="w-full">
                    Back
                  </Button>
                </div>
              </div>
            </Match>

            {/* Idle */}
            <Match when={status() === 'idle'}>
              <div class="text-center space-y-6">
                <img
                  src="/images/heaven-stacked-logo.png"
                  alt="Heaven"
                  class="w-24 h-auto mx-auto"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                <div>
                  <h2 class="text-2xl font-bold text-foreground">Heaven</h2>
                  <p class="text-muted-foreground mt-2">Sign in with your passkey</p>
                </div>
                <div class="space-y-3">
                  <Button onClick={performSignIn} size="lg" class="w-full">
                    Sign In with Passkey
                  </Button>
                  <Button onClick={performRegister} variant="outline" size="lg" class="w-full">
                    Create New Account
                  </Button>
                </div>
                <p class="text-muted-foreground/60 text-xs">Matches are made in Heaven</p>
              </div>
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  )
}

export default Auth
