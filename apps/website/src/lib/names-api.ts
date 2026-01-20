/**
 * Heaven Names Registry API client
 *
 * Used to check if a PKP has a registered .heaven name and register new names.
 */

import { signMessageWithPKP } from './lit/signer-pkp'
import type { PKPInfo, AuthData } from './lit/types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787'

export interface ReverseNameResponse {
  label: string
  label_display: string | null
  expires_at: number
  status: 'active' | 'expired'
}

export interface AvailabilityResponse {
  available: boolean
  label: string
  reason?: string
}

export interface RegisterResponse {
  success: boolean
  label?: string
  expires_at?: number
  error?: string
}

export interface UpdateResponse {
  success: boolean
  error?: string
}

/**
 * Check if a PKP address has a registered .heaven name.
 * Returns the name info if found, null if not.
 */
export async function getNameForPkp(
  pkpAddress: string
): Promise<ReverseNameResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/api/names/reverse/${pkpAddress}`)

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      console.error('[Names API] Error checking name:', response.status)
      return null
    }

    return await response.json()
  } catch (err) {
    console.error('[Names API] Network error:', err)
    return null
  }
}

/**
 * Check if a PKP has completed onboarding (has an active .heaven name).
 * Validates both status and expiry time to ensure the name is truly active.
 */
export async function hasCompletedOnboarding(pkpAddress: string): Promise<boolean> {
  const nameInfo = await getNameForPkp(pkpAddress)

  if (!nameInfo) {
    return false
  }

  // Only consider it complete if status is active AND not expired
  // (double-check expiry in case server-side status wasn't updated)
  const now = Math.floor(Date.now() / 1000)
  return nameInfo.status === 'active' && nameInfo.expires_at > now
}

/**
 * Check if a label is available for registration.
 */
export async function checkNameAvailability(
  label: string
): Promise<AvailabilityResponse> {
  const response = await fetch(`${API_BASE}/api/names/available/${label}`)
  return await response.json()
}

/**
 * Generate a cryptographically secure random nonce.
 * Client generates nonce; server enforces uniqueness via UNIQUE constraint.
 */
function generateNonce(bytes = 16): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

type HeavenAction = 'register' | 'update'

/**
 * Build the canonical message for heaven registry actions.
 * Must match exactly what the server expects (see buildHeavenMessage in Worker).
 *
 * Server uses: timestamp (issued_at) and timestamp+120 (expires_at)
 * For register and update actions, profile_cid is included for integrity.
 */
function buildHeavenMessage(params: {
  action: HeavenAction
  label: string
  pkp: string
  nonce: string
  timestamp: number
  profileCid?: string
}): string {
  const expiresAt = params.timestamp + 120 // 2 minute window (matches server)
  return [
    'heaven-registry:v1',
    `action=${params.action}`,
    'tld=heaven',
    `label=${params.label}`,
    `pkp=${params.pkp}`,
    `nonce=${params.nonce}`,
    `issued_at=${params.timestamp}`,
    `expires_at=${expiresAt}`,
    `profile_cid=${params.profileCid ?? ''}`,
  ].join('\n')
}

/**
 * Register a .heaven name for a PKP.
 *
 * Flow:
 * 1. Check availability
 * 2. Generate nonce locally
 * 3. Build canonical message (matching server format)
 * 4. Sign with PKP
 * 5. POST to /api/names/register
 *
 * @param label - The desired name (without .heaven suffix)
 * @param pkpInfo - PKP info from auth context
 * @param authData - Auth data from auth context
 * @param profileCid - Optional IPFS CID for profile data
 * @returns Registration result
 */
export async function registerHeavenName(
  label: string,
  pkpInfo: PKPInfo,
  authData: AuthData,
  profileCid?: string
): Promise<RegisterResponse> {
  const pkpAddress = pkpInfo.ethAddress.toLowerCase()

  // 1. Check availability first
  const availability = await checkNameAvailability(label)
  if (!availability.available) {
    return {
      success: false,
      error: availability.reason || 'Name not available',
    }
  }

  // 2. Generate nonce locally (server enforces uniqueness)
  const nonce = generateNonce()
  const timestamp = Math.floor(Date.now() / 1000)

  // 3. Build the canonical message (must match server's buildHeavenMessage)
  const message = buildHeavenMessage({
    action: 'register',
    label: label.toLowerCase(),
    pkp: pkpAddress,
    nonce,
    timestamp,
    profileCid,
  })

  console.log('[Names API] Signing message:', message)

  // 4. Sign with PKP using EIP-191 personal_sign
  let signature: string
  try {
    signature = await signMessageWithPKP(pkpInfo, authData, message)
    // Ensure 0x prefix
    if (!signature.startsWith('0x')) {
      signature = `0x${signature}`
    }
  } catch (err) {
    console.error('[Names API] Signing failed:', err)
    return {
      success: false,
      error: 'Failed to sign registration message',
    }
  }

  // 5. Submit registration to server
  // Field names must match Worker's RegisterRequest interface:
  // { label, pkpAddress, profileCid?, signature, nonce, timestamp }
  const registerResponse = await fetch(`${API_BASE}/api/names/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      label,
      pkpAddress,
      nonce,
      timestamp,
      signature,
      profileCid,
    }),
  })

  const result = (await registerResponse.json()) as RegisterResponse

  if (!registerResponse.ok) {
    return {
      success: false,
      error: result.error || 'Registration failed',
    }
  }

  return result
}

/**
 * Update the profile CID for an existing .heaven name.
 *
 * Flow:
 * 1. Generate nonce locally
 * 2. Build canonical message (matching server format)
 * 3. Sign with PKP
 * 4. POST to /api/names/update
 *
 * @param label - The registered name (without .heaven suffix)
 * @param profileCid - The new IPFS CID for profile data
 * @param pkpInfo - PKP info from auth context
 * @param authData - Auth data from auth context
 * @returns Update result
 */
export async function updateHeavenName(
  label: string,
  profileCid: string,
  pkpInfo: PKPInfo,
  authData: AuthData
): Promise<UpdateResponse> {
  const pkpAddress = pkpInfo.ethAddress.toLowerCase()

  // 1. Generate nonce locally (server enforces uniqueness)
  const nonce = generateNonce()
  const timestamp = Math.floor(Date.now() / 1000)

  // 2. Build the canonical message (must match server's buildHeavenMessage)
  const message = buildHeavenMessage({
    action: 'update',
    label: label.toLowerCase(),
    pkp: pkpAddress,
    nonce,
    timestamp,
    profileCid,
  })

  console.log('[Names API] Signing update message:', message)

  // 3. Sign with PKP using EIP-191 personal_sign
  let signature: string
  try {
    signature = await signMessageWithPKP(pkpInfo, authData, message)
    // Ensure 0x prefix
    if (!signature.startsWith('0x')) {
      signature = `0x${signature}`
    }
  } catch (err) {
    console.error('[Names API] Update signing failed:', err)
    return {
      success: false,
      error: 'Failed to sign update message',
    }
  }

  // 4. Submit update to server
  // Field names must match Worker's UpdateRequest interface:
  // { label, profileCid, signature, nonce, timestamp }
  const updateResponse = await fetch(`${API_BASE}/api/names/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      label,
      profileCid,
      nonce,
      timestamp,
      signature,
    }),
  })

  const result = (await updateResponse.json()) as UpdateResponse

  if (!updateResponse.ok) {
    return {
      success: false,
      error: result.error || 'Update failed',
    }
  }

  return result
}
