/**
 * PKP (Programmable Key Pair) Information
 */
export interface PKPInfo {
  publicKey: string // Hex-encoded public key (pubkey from PKPData)
  ethAddress: `0x${string}` // EVM-compatible address
  tokenId: string // NFT token ID (converted from bigint)
}

/**
 * Authentication Data (WebAuthn or EOA)
 */
export interface AuthData {
  authMethodType: number // Type identifier for the auth method (1=EOA, 3=WebAuthn)
  authMethodId: string // Unique identifier for the credential
  accessToken: string // JWT for session
  /** EOA address for users who signed up with external wallet (authMethodType: 1) */
  eoaAddress?: `0x${string}`
}

/**
 * Persisted Session Data
 */
export interface SessionData {
  pkpInfo: PKPInfo
  authData: AuthData
  expiresAt: number // Unix timestamp
}

/**
 * Current authentication status
 */
export interface AuthStatus {
  isAuthenticated: boolean
  pkpInfo: PKPInfo | null
  authData: AuthData | null
  expiresAt: number | null
}
