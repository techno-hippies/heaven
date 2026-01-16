/**
 * PKP Signing Module
 * Signs messages using PKP via Lit Protocol
 */

import { getLitClient } from './client'
import { createPKPAuthContext, getCachedAuthContext } from './auth-pkp'
import type { PKPInfo, AuthData } from './types'

const IS_DEV = import.meta.env.DEV

/**
 * Sign a message using PKP
 * This creates an Ethereum signature compatible with SIWE/EIP-191
 */
export async function signMessageWithPKP(
  pkpInfo: PKPInfo,
  authData: AuthData,
  message: string
): Promise<string> {
  if (IS_DEV) console.log('[Lit] Signing message with PKP...')

  try {
    const litClient = await getLitClient()

    // Get or create auth context
    let authContext = getCachedAuthContext(pkpInfo.publicKey)
    if (!authContext) {
      authContext = await createPKPAuthContext(pkpInfo, authData)
    }

    // Lit Action to sign personal message
    const litActionCode = `(async () => {
      const sigShare = await Lit.Actions.ethPersonalSignMessageEcdsa({
        message: jsParams.message,
        publicKey: jsParams.publicKey,
        sigName: "sig",
      });
    })();`

    const result = await litClient.executeJs({
      code: litActionCode,
      authContext: authContext,
      jsParams: {
        message,
        publicKey: pkpInfo.publicKey,
      },
    })

    if (IS_DEV) console.log('[Lit] Sign result:', result)

    // Extract signature
    if (result.signatures && result.signatures.sig) {
      const sig = result.signatures.sig

      // Combine r, s, and v into single signature
      if (sig.signature && sig.recoveryId !== undefined) {
        const v = (sig.recoveryId + 27).toString(16).padStart(2, '0')
        const signature = `${sig.signature}${v}`

        if (IS_DEV) console.log('[Lit] Message signed successfully')
        return signature
      }
    }

    throw new Error('No signature returned from Lit Action')
  } catch (error) {
    console.error('[Lit] Failed to sign message:', error)
    throw new Error(
      `Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
