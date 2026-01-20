/**
 * Scrobble Batch Sync via Lit Protocol
 *
 * Calls the scrobble-batch-sign-v2 Lit Action to:
 * 1. Pin batch JSON to Filebase IPFS
 * 2. Sign with user's PKP
 * 3. Submit tx via master PKP (sponsored)
 */

import { getLitClient } from './client'
import { createPKPAuthContext, getAnyAuthContext } from './auth-pkp'
import type { PKPInfo, AuthData } from './types'

// Lit Action CID for scrobble-batch-sign-v2
const SCROBBLE_ACTION_CID = 'QmUvFXHk83bxPqcxLijjDRXkjJHyW8sRjk2My4ZBsxs9n5'

// Pre-encrypted Filebase API key (can only be decrypted by this specific action)
const FILEBASE_ENCRYPTED_KEY = {
  ciphertext:
    'jL9RDOGHfZufBUgBnf8BAzE+2JtHfbjJqTSTQzxhZ4MIYj1f5zY/hvVOxsOIeot6fmsp11qgRpAIV8fOGgoEmVKIs7si7D35hP9ERgfIS0phOAMo1hB04WU0WnlNHpbVPRloyLKEnz640lbMqCxOsGm5xxEvYF/7EwM5auWVch/kex5so3K4QGNhhvEstyu+sryrQUvjdotte3U3TOBPhu4FJY/B9JwXjPFY8+9/RrgXZgI=',
  dataToEncryptHash: 'adfd4859ba6209cee0175734a2d699327a8dd8a6d4c4b8fe61bc9ef1143be551',
  accessControlConditions: [
    {
      conditionType: 'evmBasic',
      contractAddress: '',
      standardContractType: '',
      chain: 'ethereum',
      method: '',
      parameters: [':currentActionIpfsId'],
      returnValueTest: {
        comparator: '=',
        value: SCROBBLE_ACTION_CID,
      },
    },
  ],
}

/** Track format expected by Lit Action */
export interface ScrobbleTrack {
  artist: string
  title: string
  album?: string | null
  duration?: number | null
  playedAt: number // Unix timestamp
}

/** Result from successful Lit Action execution */
export interface ScrobbleSyncResult {
  success: true
  txHash: string
  cidString: string
  cidHash: string
  startTs: string
  endTs: string
  count: string
  nonce: string
  sponsor: string
}

/** Error result from Lit Action */
export interface ScrobbleSyncError {
  success: false
  error: string
}

export type ScrobbleSyncResponse = ScrobbleSyncResult | ScrobbleSyncError

/**
 * Submit a batch of scrobbles to the blockchain via Lit Protocol.
 *
 * @param tracks - Array of scrobble tracks to submit
 * @param nonce - Replay protection nonce (should be monotonically increasing)
 * @param pkpInfo - User's PKP info
 * @param authData - User's auth data for PKP signing
 * @param options - Optional: dryRun to skip broadcast
 */
export async function submitScrobbleBatch(
  tracks: ScrobbleTrack[],
  nonce: number,
  pkpInfo: PKPInfo,
  authData: AuthData,
  options?: { dryRun?: boolean }
): Promise<ScrobbleSyncResponse> {
  if (tracks.length === 0) {
    return { success: false, error: 'No tracks to submit' }
  }

  if (!pkpInfo.publicKey) {
    return { success: false, error: 'PKP public key is required' }
  }

  console.log(`[ScrobbleSync] Submitting batch of ${tracks.length} tracks (nonce: ${nonce})`)

  try {
    // Get Lit client
    const litClient = await getLitClient()

    // Get or create auth context
    let authContext = getAnyAuthContext()
    if (!authContext) {
      console.log('[ScrobbleSync] Creating new PKP auth context...')
      authContext = await createPKPAuthContext(pkpInfo, authData)
    }

    // Execute Lit Action
    console.log('[ScrobbleSync] Executing Lit Action...')
    const result = await litClient.executeJs({
      ipfsId: SCROBBLE_ACTION_CID,
      authContext,
      jsParams: {
        userPkpPublicKey: pkpInfo.publicKey,
        tracks,
        nonce,
        filebaseEncryptedKey: FILEBASE_ENCRYPTED_KEY,
        dryRun: options?.dryRun ?? false,
      },
    })

    // Parse response
    const response: ScrobbleSyncResponse =
      typeof result.response === 'string' ? JSON.parse(result.response) : result.response

    if (response.success) {
      console.log('[ScrobbleSync] Batch submitted successfully:', {
        txHash: response.txHash,
        cid: response.cidString,
        count: response.count,
      })
    } else {
      console.error('[ScrobbleSync] Batch submission failed:', response.error)
    }

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[ScrobbleSync] Error:', message)
    return { success: false, error: message }
  }
}
