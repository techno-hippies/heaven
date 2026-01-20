/**
 * PKP Message Signing
 * Sign messages using PKP via Lit Action (executeJs)
 */

import { getLitClient } from './client'
import { createPKPAuthContext, getAnyAuthContext } from './auth-pkp'
import type { PKPInfo, AuthData } from './types'

const IS_DEV = import.meta.env.DEV

/**
 * Sign a message using PKP
 * Returns EIP-191 (personal_sign) signature compatible with SIWE
 */
export async function signMessageWithPKP(
  message: string,
  pkpInfo: PKPInfo,
  authData: AuthData
): Promise<string> {
  if (IS_DEV) console.log('[Lit] Signing message with PKP...')

  if (!pkpInfo.publicKey) {
    throw new Error('PKP public key is required for signing')
  }

  const litClient = await getLitClient()

  // Get or create auth context
  let authContext = getAnyAuthContext()
  if (!authContext) {
    if (IS_DEV) console.log('[Lit] Creating new PKP auth context for signing...')
    authContext = await createPKPAuthContext(pkpInfo, authData)
  }

  // Build Lit Action code with interpolated values
  // We escape the message to handle special characters safely
  const escapedMessage = JSON.stringify(message)
  const code = `
(async () => {
  await LitActions.ethPersonalSignMessageEcdsa({
    message: ${escapedMessage},
    publicKey: "${pkpInfo.publicKey}",
    sigName: "sig",
  });
})();
`

  // Execute Lit Action to sign the message
  const result = await litClient.executeJs({
    code,
    authContext,
  })

  // Log full result for debugging
  if (IS_DEV) {
    console.log('[Lit] executeJs result:', result)
    console.log('[Lit] signatures:', result.signatures)
  }

  // The signature is in result.signatures.sig (sigName we passed)
  const sigData = result.signatures?.sig
  if (!sigData) {
    throw new Error('No signature returned from Lit Action')
  }

  // Log full sigData structure
  if (IS_DEV) {
    console.log('[Lit] sigData structure:', JSON.stringify(sigData, null, 2))
  }

  // Lit returns signature with r, s, recid components - combine them
  // The signature format is: r (32 bytes) + s (32 bytes) + v (1 byte) = 65 bytes
  // v = recid + 27 (for Ethereum compatibility)
  let signature: string

  if (sigData.r && sigData.s) {
    // Combine r + s + v into full signature
    const r = sigData.r.startsWith('0x') ? sigData.r.slice(2) : sigData.r
    const s = sigData.s.startsWith('0x') ? sigData.s.slice(2) : sigData.s

    // Get v value: could be 'v', 'recid', or derive from signature
    let v: number
    if (sigData.v !== undefined) {
      v = typeof sigData.v === 'number' ? sigData.v : parseInt(sigData.v, 16)
    } else if (sigData.recid !== undefined) {
      // recid is 0 or 1, v is 27 or 28
      v = (typeof sigData.recid === 'number' ? sigData.recid : parseInt(sigData.recid)) + 27
    } else {
      // Default to 27 if not provided (will try 28 if verification fails)
      v = 27
    }

    signature = '0x' + r + s + v.toString(16).padStart(2, '0')
  } else if (sigData.signature) {
    signature = sigData.signature
    // If signature is 64 bytes (128 hex), add v from recoveryId
    if (signature.replace('0x', '').length === 128) {
      // recoveryId is 0 or 1, v is 27 or 28
      const recId = sigData.recoveryId ?? sigData.recid ?? 0
      const v = (typeof recId === 'number' ? recId : parseInt(recId)) + 27
      signature = signature + v.toString(16).padStart(2, '0')
    }
  } else if (typeof sigData === 'string') {
    signature = sigData
    if (signature.replace('0x', '').length === 128) {
      signature = signature + '1b'
    }
  } else {
    throw new Error(`Unexpected signature format: ${JSON.stringify(sigData)}`)
  }

  // Ensure 0x prefix
  if (!signature.startsWith('0x')) {
    signature = '0x' + signature
  }

  if (IS_DEV) {
    console.log('[Lit] Final signature:', signature)
    console.log('[Lit] Signature length:', signature.length)
  }

  if (IS_DEV) console.log('[Lit] Message signed successfully')

  return signature
}

/**
 * Create a sign function bound to specific PKP credentials
 */
export function createSigner(pkpInfo: PKPInfo, authData: AuthData) {
  return async (message: string): Promise<string> => {
    return signMessageWithPKP(message, pkpInfo, authData)
  }
}
