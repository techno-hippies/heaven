import {
  createContext,
  useContext,
  createSignal,
  onMount,
  onCleanup,
  type ParentComponent,
  type Accessor,
} from 'solid-js'
import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import type { WalletClient } from 'viem'
import type { PKPInfo, AuthData } from '@/lib/lit'
import { clearAuthContext } from '@/lib/lit'
import { clearSession, loadSession } from '@/lib/lit/storage'
import {
  appKit,
  wagmiConfig,
  getWalletClient,
  watchAccount,
  disconnect as disconnectWagmi,
} from '@/app/providers/Web3Provider'

// Auth result from browser callback (matches Rust AuthResult)
interface AuthResultPayload {
  pkpPublicKey?: string
  pkpAddress?: string
  pkpTokenId?: string
  authMethodType?: number
  authMethodId?: string
  accessToken?: string
  isNewUser?: boolean
  error?: string
}

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
  // State
  pkpInfo: Accessor<PKPInfo | null>
  pkpAddress: Accessor<`0x${string}` | null>
  authData: Accessor<AuthData | null>
  isAuthenticated: Accessor<boolean>
  isAuthenticating: Accessor<boolean>
  authError: Accessor<string | null>
  authMethod: Accessor<'passkey' | 'wallet' | null>

  // EOA state
  eoaAddress: Accessor<`0x${string}` | null>
  isWalletConnected: Accessor<boolean>

  // Actions
  loginWithPasskey: () => Promise<void>
  loginWithWallet: () => Promise<void>
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType>()

export const AuthProvider: ParentComponent = (props) => {
  const [pkpInfo, setPkpInfo] = createSignal<PKPInfo | null>(null)
  const [authData, setAuthData] = createSignal<AuthData | null>(null)
  const [isAuthenticating, setIsAuthenticating] = createSignal(false)
  const [authError, setAuthError] = createSignal<string | null>(null)
  const [authMethod, setAuthMethod] = createSignal<'passkey' | 'wallet' | null>(null)

  // EOA state
  const [eoaAddress, setEoaAddress] = createSignal<`0x${string}` | null>(null)
  const [expectingWallet, setExpectingWallet] = createSignal(false)

  // Derived
  const pkpAddress = () => pkpInfo()?.ethAddress ?? null
  const isAuthenticated = () => pkpInfo() !== null
  const isWalletConnected = () => eoaAddress() !== null

  // Restore session on mount + check Tauri persisted auth
  onMount(async () => {
    // First check Tauri's persisted auth (passkey flow)
    try {
      const isAuthed = await invoke<boolean>('is_authenticated')
      if (isAuthed) {
        const address = await invoke<string | null>('get_pkp_address')
        const publicKey = await invoke<string | null>('get_pkp_public_key')
        const authDataResponse = await invoke<{
          authMethodType?: number
          authMethodId?: string
          accessToken?: string
        } | null>('get_auth_data')

        if (address) {
          // Restore full PKPInfo
          setPkpInfo({
            ethAddress: address as `0x${string}`,
            publicKey: publicKey || '',
            tokenId: '',
          })

          // Restore authData if available
          if (authDataResponse) {
            setAuthData({
              authMethodType: authDataResponse.authMethodType || 0,
              authMethodId: authDataResponse.authMethodId || '',
              accessToken: authDataResponse.accessToken || '',
            })
            console.log('[Auth] Restored authData from Tauri storage')
          }

          setAuthMethod('passkey')
          console.log('[Auth] Restored from Tauri storage:', address)
          return
        }
      }
    } catch (err) {
      // Not in Tauri context (e.g., Storybook), fall through to session check
      console.log('[Auth] Not in Tauri context, checking local session')
    }

    // Fallback: check browser session storage
    const session = loadSession()
    if (!session) return

    setPkpInfo(session.pkpInfo)
    setAuthData(session.authData)
    setAuthMethod(session.authData.eoaAddress ? 'wallet' : 'passkey')

    // Rebuild PKP auth context
    try {
      const lit = await loadLit()
      await lit.createPKPAuthContext(session.pkpInfo, session.authData)
      console.log('[Auth] Restored session')
    } catch (err) {
      console.warn('[Auth] Failed to restore auth context:', err)
    }
  })

  // Listen for Tauri auth events (browser-based passkey flow)
  onMount(() => {
    let unlistenComplete: UnlistenFn | undefined
    let unlistenError: UnlistenFn | undefined

    const setupListeners = async () => {
      try {
        console.log('[Auth] Setting up Tauri event listeners...')
        unlistenComplete = await listen<AuthResultPayload>('auth-complete', async (event) => {
          console.log('[Auth] Received auth-complete:', event, event.payload)
          const payload = event.payload

          if (payload.pkpAddress && payload.pkpPublicKey) {
            // Save to Tauri storage (include all auth fields for Lit Protocol)
            await invoke('save_auth', {
              pkpAddress: payload.pkpAddress,
              pkpPublicKey: payload.pkpPublicKey,
              authMethodType: payload.authMethodType,
              authMethodId: payload.authMethodId,
              accessToken: payload.accessToken,
            })

            // Update state
            setPkpInfo({
              ethAddress: payload.pkpAddress as `0x${string}`,
              publicKey: payload.pkpPublicKey,
              tokenId: payload.pkpTokenId || '',
            })
            setAuthData({
              authMethodType: payload.authMethodType || 0,
              authMethodId: payload.authMethodId || '',
              accessToken: payload.accessToken || '',
            })
            setAuthMethod('passkey')
            setIsAuthenticating(false)
            console.log('[Auth] Passkey auth complete:', payload.pkpAddress)
          }
        })

        unlistenError = await listen<AuthResultPayload>('auth-error', (event) => {
          console.error('[Auth] Received auth-error:', event.payload)
          setAuthError(event.payload.error || 'Authentication failed')
          setAuthMethod(null)
          setIsAuthenticating(false)
        })
        console.log('[Auth] Tauri event listeners set up successfully')
      } catch (err) {
        // Not in Tauri context
        console.log('[Auth] Tauri event listeners not available:', err)
      }
    }

    setupListeners()

    onCleanup(() => {
      unlistenComplete?.()
      unlistenError?.()
    })
  })

  // Watch for wallet connections
  onMount(() => {
    const unwatch = watchAccount(wagmiConfig, {
      onChange: async (account) => {
        const address = account.address
        const isConnected = account.isConnected

        setEoaAddress(isConnected && address ? address : null)

        // Only process if we're expecting a wallet connection
        if (!isConnected || !address || !expectingWallet()) {
          return
        }

        // Already authenticated
        if (pkpInfo()) {
          return
        }

        setExpectingWallet(false)
        console.log('[Auth] Wallet connected:', address)

        try {
          const walletClient = await getWalletClient(wagmiConfig)
          if (!walletClient) {
            throw new Error('Failed to get wallet client')
          }
          await connectWithEoa(walletClient)
        } catch (error) {
          console.error('[Auth] Wallet auth error:', error)
          setAuthError(error instanceof Error ? error.message : 'Wallet connection failed')
          setIsAuthenticating(false)
        }
      },
    })

    onCleanup(unwatch)
  })

  // Passkey login (opens system browser for WebAuthn)
  async function loginWithPasskey(): Promise<void> {
    setIsAuthenticating(true)
    setAuthError(null)
    setAuthMethod('passkey')

    try {
      // Opens system browser to auth page, result comes via Tauri event
      await invoke('start_passkey_auth')
      console.log('[Auth] Opened browser for passkey auth')
      // Auth result will be handled by the 'auth-complete' event listener
    } catch (error) {
      console.error('[Auth] Failed to start passkey auth:', error)
      setAuthError(error instanceof Error ? error.message : 'Failed to start authentication')
      setAuthMethod(null)
      setIsAuthenticating(false)
      throw error
    }
  }

  // Wallet login (opens AppKit modal)
  async function loginWithWallet(): Promise<void> {
    setIsAuthenticating(true)
    setAuthError(null)
    setAuthMethod('wallet')
    setExpectingWallet(true)

    try {
      // Open AppKit modal (shows QR for desktop, wallet list for browser)
      await appKit.open()
    } catch (error) {
      console.error('[Auth] Failed to open wallet modal:', error)
      setAuthError(error instanceof Error ? error.message : 'Failed to open wallet')
      setAuthMethod(null)
      setExpectingWallet(false)
      setIsAuthenticating(false)
    }
  }

  // Internal: complete EOA auth after wallet connects
  async function connectWithEoa(walletClient: WalletClient): Promise<void> {
    try {
      const lit = await loadLit()
      const address = walletClient.account?.address

      if (!address) {
        throw new Error('No wallet address')
      }

      // Check if PKP exists for this EOA
      const existingPkp = await lit.getExistingPkpForEoa(address)

      let result
      if (existingPkp) {
        console.log('[Auth] Logging in with existing PKP')
        result = await lit.loginWithEoa(walletClient)
      } else {
        console.log('[Auth] Registering new PKP for EOA')
        result = await lit.registerWithEoa(walletClient)
      }

      setPkpInfo(result.pkpInfo)
      setAuthData(result.authData)
      console.log('[Auth] EOA auth complete:', result.pkpInfo.ethAddress)
    } catch (error) {
      console.error('[Auth] EOA auth failed:', error)
      setAuthError(error instanceof Error ? error.message : 'Wallet authentication failed')
      setAuthMethod(null)
      throw error
    } finally {
      setIsAuthenticating(false)
    }
  }

  function logout(): void {
    setPkpInfo(null)
    setAuthData(null)
    setAuthError(null)
    setAuthMethod(null)
    setEoaAddress(null)
    setExpectingWallet(false)

    // Clear Tauri persisted auth
    invoke('sign_out').catch(() => {
      // Not in Tauri context
    })

    clearSession()
    clearAuthContext()
    disconnectWagmi(wagmiConfig)

    if (litPromise) {
      loadLit().then((lit) => lit.resetClient())
    }
  }

  function clearError(): void {
    setAuthError(null)
  }

  const value: AuthContextType = {
    pkpInfo,
    pkpAddress,
    authData,
    isAuthenticated,
    isAuthenticating,
    authError,
    authMethod,
    eoaAddress,
    isWalletConnected,
    loginWithPasskey,
    loginWithWallet,
    logout,
    clearError,
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
