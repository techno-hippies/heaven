/** WireGuard keypair (base64 encoded) */
export interface WgKeypair {
  privateKey: string
  publicKey: string
}

/** VPN connection status */
export interface VpnStatus {
  connected: boolean
  interfaceExists: boolean
  configSaved: boolean
  wallet: string | null
}

/** System readiness check result */
export interface SystemReadiness {
  ready: boolean
  error: string | null
}

/** VPN auth result from browser callback */
export interface VpnAuthResult {
  config: string | null
  wallet: string | null
  error: string | null
}

/** VPN connection state for UI */
export type VpnConnectionState =
  | 'idle'
  | 'checking'
  | 'authenticating'
  | 'activating'
  | 'deactivating'
  | 'connected'
  | 'disconnected'
  | 'error'
