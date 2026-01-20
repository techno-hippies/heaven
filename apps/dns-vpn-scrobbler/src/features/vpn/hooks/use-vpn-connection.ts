import { createSignal, onCleanup, onMount } from 'solid-js'
import { invoke } from '@tauri-apps/api/core'
import { listen, UnlistenFn } from '@tauri-apps/api/event'
import type {
  WgKeypair,
  VpnStatus,
  SystemReadiness,
  VpnAuthResult,
  VpnConnectionState,
} from './types'
import * as api from '../lib/api'

/** Polling interval for VPN status (ms) */
const STATUS_POLL_INTERVAL = 10000

/** Signer function type (from PKP) */
export type SignMessageFn = (message: string) => Promise<string>

/**
 * Hook for managing VPN connection state.
 * Handles auth flow, connection toggle, and status polling.
 */
export function useVpnConnection() {
  const [state, setState] = createSignal<VpnConnectionState>('checking')
  const [status, setStatus] = createSignal<VpnStatus>({
    connected: false,
    interfaceExists: false,
    configSaved: false,
    wallet: null,
  })
  const [systemReady, setSystemReady] = createSignal<SystemReadiness>({
    ready: true,
    error: null,
  })
  const [error, setError] = createSignal<string | null>(null)
  const [keypair, setKeypair] = createSignal<WgKeypair | null>(null)

  /** Check current VPN status */
  const checkStatus = async () => {
    try {
      const vpnStatus = await invoke<VpnStatus>('vpn_status')
      console.log('[VPN] checkStatus result:', vpnStatus)
      setStatus(vpnStatus)

      // Update state based on status
      if (vpnStatus.connected) {
        setState('connected')
      } else if (vpnStatus.configSaved) {
        setState('disconnected')
      } else {
        setState('idle')
      }
    } catch (e) {
      console.error('[VPN] Failed to check status:', e)
    }
  }

  /** Check system prerequisites */
  const checkSystem = async () => {
    try {
      const ready = await invoke<SystemReadiness>('check_vpn_system_ready')
      setSystemReady(ready)
    } catch (e) {
      console.error('Failed to check system:', e)
    }
  }

  onMount(async () => {
    // Check system prerequisites
    await checkSystem()

    // Get initial status
    await checkStatus()

    // Listen for auth events
    const unlisteners: UnlistenFn[] = []

    listen<VpnAuthResult>('vpn-auth-complete', async (event) => {
      const { config, wallet } = event.payload

      if (config && wallet && keypair()) {
        try {
          // Build full config with private key
          const fullConfig = buildConfig(config, keypair()!.privateKey)

          // Persist config
          await invoke('persist_vpn_config', {
            configContent: fullConfig,
            wallet,
          })

          // Auto-activate
          setState('activating')
          await invoke('vpn_up')
          await checkStatus()
        } catch (e) {
          console.error('Failed to activate VPN after auth:', e)
          setError(e instanceof Error ? e.message : String(e))
          setState('error')
        }
      }
    }).then((fn) => unlisteners.push(fn))

    listen<VpnAuthResult>('vpn-auth-error', (event) => {
      setError(event.payload.error || 'Authentication failed')
      setState('error')
    }).then((fn) => unlisteners.push(fn))

    // Poll status periodically
    const pollInterval = setInterval(checkStatus, STATUS_POLL_INTERVAL)

    onCleanup(() => {
      unlisteners.forEach((fn) => fn())
      clearInterval(pollInterval)
    })
  })

  /** Setup VPN device using PKP to sign SIWE */
  const setupDevice = async (walletAddress: string, signMessage: SignMessageFn) => {
    if (state() === 'authenticating') return

    setError(null)
    setState('authenticating')

    try {
      console.log('[VPN] Setting up device for', walletAddress)

      // 1. Generate WireGuard keypair
      const kp = await invoke<WgKeypair>('generate_wg_keypair')
      setKeypair(kp)
      console.log('[VPN] Generated WG keypair')

      // 2. Get SIWE challenge from server
      const challenge = await api.getChallenge(walletAddress)
      console.log('[VPN] Got challenge')

      // 3. Sign with PKP
      const signature = await signMessage(challenge.message)
      console.log('[VPN] Signed challenge')

      // 4. Verify and get JWT
      const auth = await api.verifySignature(challenge.message, signature)
      console.log('[VPN] Verified, got token')

      // 5. Create device (register WG peer)
      const device = await api.createDevice(auth.token, 'heaven-vpn', kp.publicKey)
      console.log('[VPN] Created device:', device.device_id, 'IP:', device.vpn_ip)

      // 6. Get WireGuard config
      const { config } = await api.getWgConfig(auth.token, device.device_id)
      console.log('[VPN] Got config')

      // 7. Merge private key into config and persist
      const fullConfig = config.replace('YOUR_PRIVATE_KEY', kp.privateKey)
      await invoke('persist_vpn_config', {
        configContent: fullConfig,
        wallet: walletAddress,
      })
      console.log('[VPN] Config persisted')

      // 8. Auto-connect
      setState('activating')
      await invoke('vpn_up')
      await checkStatus()
      console.log('[VPN] Connected!')
    } catch (e) {
      console.error('[VPN] Setup failed:', e)
      setError(e instanceof Error ? e.message : String(e))
      setState('error')
    }
  }

  /** Start VPN auth flow (legacy browser-based, kept for fallback) */
  const startAuth = async () => {
    if (state() === 'authenticating') return

    setError(null)
    setState('authenticating')

    try {
      // Generate keypair
      const kp = await invoke<WgKeypair>('generate_wg_keypair')
      setKeypair(kp)

      // Start auth (opens browser)
      await invoke('start_vpn_auth', { wgPubkey: kp.publicKey })
    } catch (e) {
      console.error('Failed to start VPN auth:', e)
      setError(e instanceof Error ? e.message : String(e))
      setState('error')
    }
  }

  /** Connect VPN (requires saved config) */
  const connect = async () => {
    console.log('[VPN] connect() called, status:', status())
    if (!status().configSaved) {
      console.log('[VPN] No config saved, cannot connect')
      return
    }

    setError(null)
    setState('activating')

    try {
      console.log('[VPN] Invoking vpn_up...')
      await invoke('vpn_up')
      console.log('[VPN] vpn_up succeeded')
      await checkStatus()
    } catch (e) {
      console.error('[VPN] Failed to connect:', e)
      setError(e instanceof Error ? e.message : String(e))
      setState('error')
    }
  }

  /** Disconnect VPN */
  const disconnect = async () => {
    console.log('[VPN] disconnect() called, status:', status())
    setError(null)
    setState('deactivating')

    try {
      console.log('[VPN] Invoking vpn_down...')
      await invoke('vpn_down')
      console.log('[VPN] vpn_down succeeded')
      await checkStatus()
    } catch (e) {
      console.error('[VPN] Failed to disconnect:', e)
      setError(e instanceof Error ? e.message : String(e))
      setState('error')
    }
  }

  /** Toggle VPN connection */
  const toggle = async () => {
    console.log('[VPN] toggle() called, state:', state(), 'status:', status())
    if (status().connected || status().interfaceExists) {
      console.log('[VPN] Currently connected, disconnecting...')
      await disconnect()
    } else if (status().configSaved) {
      console.log('[VPN] Config exists, connecting...')
      await connect()
    } else {
      console.log('[VPN] No config, starting auth...')
      await startAuth()
    }
  }

  /** Forget device (clear config and logout) */
  const forgetDevice = async () => {
    try {
      // Disconnect first if needed
      if (status().connected) {
        await disconnect()
      }

      await invoke('forget_vpn_device')
      setKeypair(null)
      await checkStatus()
    } catch (e) {
      console.error('Failed to forget device:', e)
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  /** Export config to file */
  const exportConfig = async (config: string, filename: string = 'heaven-vpn.conf') => {
    try {
      await invoke('export_wg_config', { configContent: config, filename })
    } catch (e) {
      console.error('Failed to export config:', e)
    }
  }

  /** Debug: Create a test config for development */
  const createTestConfig = async () => {
    try {
      console.log('[VPN] Creating test config...')
      const kp = await invoke<WgKeypair>('generate_wg_keypair')

      // Basic test config - won't actually connect but tests the flow
      const testConfig = `[Interface]
PrivateKey = ${kp.privateKey}
Address = 10.0.0.2/24
DNS = 1.1.1.1

[Peer]
PublicKey = TEST_SERVER_PUBKEY_REPLACE_ME
AllowedIPs = 0.0.0.0/0
Endpoint = 127.0.0.1:51820
PersistentKeepalive = 25
`
      await invoke('persist_vpn_config', {
        configContent: testConfig,
        wallet: '0xTEST',
      })
      console.log('[VPN] Test config created')
      await checkStatus()
    } catch (e) {
      console.error('[VPN] Failed to create test config:', e)
    }
  }

  return {
    // State
    state,
    status,
    systemReady,
    error,

    // Derived
    isConnected: () => status().connected,
    isConfigured: () => status().configSaved,
    wallet: () => status().wallet,

    // Actions
    connect,
    disconnect,
    toggle,
    setupDevice,
    startAuth,
    forgetDevice,
    exportConfig,
    checkStatus,

    // Debug
    createTestConfig,
  }
}

/** Build full WireGuard config by replacing placeholder with private key */
function buildConfig(serverConfig: string, privateKey: string): string {
  return serverConfig.replace('YOUR_PRIVATE_KEY', privateKey)
}
