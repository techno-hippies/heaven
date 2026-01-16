import {
  createContext,
  useContext,
  createSignal,
  onMount,
  onCleanup,
  type ParentProps,
  type Accessor,
} from 'solid-js'
import type { WalletClient } from 'viem'
import type { PKPInfo, AuthData } from '@/lib/lit'
import { clearAuthContext } from '@/lib/lit'
import { clearVoiceAuthCache } from '@/lib/voice/api'
import {
  wagmiConfig,
  getWalletClient,
  watchAccount,
  disconnect as disconnectWagmi,
} from '@/providers/Web3Provider'

// Lazy load Lit SDK to reduce initial bundle size
type LitModule = typeof import('@/lib/lit')
let litPromise: Promise<LitModule> | null = null

async function loadLit(): Promise<LitModule> {
  if (!litPromise) {
    litPromise = import('@/lib/lit')
  }
  return litPromise
}

export interface AuthContextType {
  // State accessors
  pkpInfo: Accessor<PKPInfo | null>
  pkpAddress: Accessor<`0x${string}` | null>
  authData: Accessor<AuthData | null>
  isAuthenticated: Accessor<boolean>
  isAuthenticating: Accessor<boolean>
  authError: Accessor<string | null>
  authStatus: Accessor<string>

  // EOA wallet state
  eoaAddress: Accessor<`0x${string}` | null>
  isWalletConnected: Accessor<boolean>

  // Actions
  register: () => Promise<void>
  signIn: () => Promise<void>
  connectWithEoa: (walletClient: WalletClient) => Promise<void>
  expectWalletConnection: () => void
  logout: () => void
  signMessage: (message: string) => Promise<string>
  openAuthDialog: () => void
  closeAuthDialog: () => void

  // Dialog state
  isAuthDialogOpen: Accessor<boolean>
}

const AuthContext = createContext<AuthContextType>()

export function AuthProvider(props: ParentProps) {
  // State signals
  const [pkpInfo, setPkpInfo] = createSignal<PKPInfo | null>(null)
  const [authData, setAuthData] = createSignal<AuthData | null>(null)
  const [isAuthenticating, setIsAuthenticating] = createSignal(false)
  const [authError, setAuthError] = createSignal<string | null>(null)
  const [authStatus, setAuthStatus] = createSignal('')
  const [isAuthDialogOpen, setIsAuthDialogOpen] = createSignal(false)

  // EOA wallet state
  const [eoaAddress, setEoaAddress] = createSignal<`0x${string}` | null>(null)
  const [expectingWallet, setExpectingWallet] = createSignal(false)
  const [processedEoaAddress, setProcessedEoaAddress] = createSignal<string | null>(null)

  // Derived state
  const pkpAddress = () => pkpInfo()?.ethAddress ?? null
  const isAuthenticated = () => pkpInfo() !== null
  const isWalletConnected = () => eoaAddress() !== null

  // Restore session on mount (without loading Lit SDK if no session)
  onMount(() => {
    const stored = localStorage.getItem('neodate:session')
    if (stored) {
      try {
        const session = JSON.parse(stored)
        if (Date.now() < session.expiresAt) {
          setPkpInfo(session.pkpInfo)
          setAuthData(session.authData)
        } else {
          // Expired - clear it
          localStorage.removeItem('neodate:session')
        }
      } catch {
        localStorage.removeItem('neodate:session')
      }
    }
  })

  // Watch for EOA wallet connections via wagmi
  onMount(() => {
    const unwatch = watchAccount(wagmiConfig, {
      onChange: async (account) => {
        const walletAddress = account.address
        const isConnected = account.isConnected

        console.log('[Auth] EOA account change:', {
          isConnected,
          walletAddress,
          hasPkp: !!pkpInfo(),
          isAuthenticating: isAuthenticating(),
          processedAddress: processedEoaAddress(),
          expectingWallet: expectingWallet(),
        })

        // Update EOA address state
        setEoaAddress(isConnected && walletAddress ? walletAddress : null)

        // Skip if not connected
        if (!isConnected || !walletAddress) {
          return
        }

        // Skip if already have PKP
        if (pkpInfo()) {
          console.log('[Auth] EOA skipped: already have PKP')
          return
        }

        // Skip if currently authenticating
        if (isAuthenticating()) {
          console.log('[Auth] EOA skipped: auth in progress')
          return
        }

        // Skip if already processed this address
        if (processedEoaAddress() === walletAddress) {
          console.log('[Auth] EOA skipped: already processed this address')
          return
        }

        // Skip if this is a stale wagmi auto-reconnect (user didn't click Connect Wallet)
        if (!expectingWallet()) {
          console.log('[Auth] EOA skipped: not expecting wallet connection (stale auto-reconnect)')
          disconnectWagmi(wagmiConfig)
          return
        }

        // Mark as processed and clear the expectation flag
        setProcessedEoaAddress(walletAddress)
        setExpectingWallet(false)

        console.log('[Auth] EOA connected, starting PKP flow:', walletAddress)
        setAuthStatus('Connecting wallet...')

        // Get wagmi wallet client and run EOA flow
        try {
          const walletClient = await getWalletClient(wagmiConfig)
          if (!walletClient) {
            console.error('[Auth] Failed to get wagmi wallet client')
            setAuthError('Failed to get wallet client')
            return
          }

          await connectWithEoa(walletClient)
        } catch (error) {
          console.error('[Auth] EOA flow error:', error)
          // Error handling is done in connectWithEoa
        }
      },
    })

    onCleanup(unwatch)
  })

  // Register new account with WebAuthn
  async function register(): Promise<void> {
    setIsAuthenticating(true)
    setAuthError(null)

    try {
      const lit = await loadLit()
      const result = await lit.registerWithWebAuthn()
      setPkpInfo(result.pkpInfo)
      setAuthData(result.authData)
      setIsAuthDialogOpen(false)
    } catch (error) {
      console.error('[Auth] Registration failed:', error)
      setAuthError(error instanceof Error ? error.message : 'Registration failed')
      throw error
    } finally {
      setIsAuthenticating(false)
    }
  }

  // Sign in with existing WebAuthn credential
  async function signIn(): Promise<void> {
    setIsAuthenticating(true)
    setAuthError(null)

    try {
      const lit = await loadLit()
      const result = await lit.authenticateWithWebAuthn()
      setPkpInfo(result.pkpInfo)
      setAuthData(result.authData)
      setIsAuthDialogOpen(false)
    } catch (error) {
      console.error('[Auth] Sign in failed:', error)
      setAuthError(error instanceof Error ? error.message : 'Sign in failed')
      throw error
    } finally {
      setIsAuthenticating(false)
    }
  }

  // Connect with EOA wallet
  async function connectWithEoa(walletClient: WalletClient): Promise<void> {
    setIsAuthenticating(true)
    setAuthError(null)

    try {
      const lit = await loadLit()
      const address = walletClient.account?.address

      if (!address) {
        throw new Error('No wallet address')
      }

      setAuthStatus('Checking for existing account...')

      // Check if PKP already exists for this EOA
      const existingPkp = await lit.getExistingPkpForEoa(address)

      if (existingPkp) {
        setAuthStatus('Signing in...')
        const result = await lit.loginWithEoa(walletClient)
        setPkpInfo(result.pkpInfo)
        setAuthData(result.authData)
      } else {
        setAuthStatus('Creating your account...')
        const result = await lit.registerWithEoa(walletClient)
        setPkpInfo(result.pkpInfo)
        setAuthData(result.authData)
      }

      setIsAuthDialogOpen(false)
      setAuthStatus('')
      console.log('[Auth] EOA flow complete, PKP ready')
    } catch (error) {
      console.error('[Auth] EOA flow error:', error)
      setAuthError(error instanceof Error ? error.message : 'Wallet connection failed')
      setAuthStatus('')
      throw error
    } finally {
      setIsAuthenticating(false)
    }
  }

  // Signal that user explicitly wants to connect a wallet
  function expectWalletConnection(): void {
    setExpectingWallet(true)
    setProcessedEoaAddress(null)
    setAuthError(null)
    setAuthStatus('Waiting for wallet...')
  }

  // Logout - clear session and reset clients
  function logout(): void {
    setPkpInfo(null)
    setAuthData(null)
    setAuthError(null)
    setAuthStatus('')
    setEoaAddress(null)
    setExpectingWallet(false)
    setProcessedEoaAddress(null)

    // Clear storage
    localStorage.removeItem('neodate:session')
    localStorage.removeItem('lit-auth:naga-dev:neodate')

    // Clear PKP auth context cache
    clearAuthContext()

    // Clear voice API token cache
    clearVoiceAuthCache()

    // Disconnect wagmi wallet
    disconnectWagmi(wagmiConfig)

    // Reset Lit clients if loaded
    if (litPromise) {
      loadLit().then((lit) => {
        lit.resetClient()
      })
    }
  }

  // Sign a message with PKP (re-authenticates for fresh token)
  async function signMessage(message: string): Promise<string> {
    const currentPkpInfo = pkpInfo()
    if (!currentPkpInfo) {
      throw new Error('Not authenticated')
    }

    const lit = await loadLit()

    // Get fresh auth data before signing
    const freshAuthData = await lit.refreshAuth()
    setAuthData(freshAuthData)

    // Sign with PKP
    return lit.signMessageWithPKP(currentPkpInfo, freshAuthData, message)
  }

  // Dialog controls
  function openAuthDialog(): void {
    setAuthError(null)
    setIsAuthDialogOpen(true)
  }

  function closeAuthDialog(): void {
    setIsAuthDialogOpen(false)
    setAuthError(null)
  }

  const value: AuthContextType = {
    pkpInfo,
    pkpAddress,
    authData,
    isAuthenticated,
    isAuthenticating,
    authError,
    authStatus,
    eoaAddress,
    isWalletConnected,
    register,
    signIn,
    connectWithEoa,
    expectWalletConnection,
    logout,
    signMessage,
    openAuthDialog,
    closeAuthDialog,
    isAuthDialogOpen,
  }

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
