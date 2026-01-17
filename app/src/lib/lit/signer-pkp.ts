/**
 * PKP Signing Module
 * Signs messages and transactions using PKP via Lit Protocol
 */

import { getLitClient } from './client'
import { createPKPAuthContext, getCachedAuthContext } from './auth-pkp'
import type { PKPInfo, AuthData } from './types'
import {
  type TransactionSerializable,
  type Hex,
  serializeTransaction,
  keccak256,
  hexToBytes,
} from 'viem'

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

/**
 * Sign a transaction using PKP
 * Returns the signed transaction ready to broadcast
 */
export async function signTransactionWithPKP(
  pkpInfo: PKPInfo,
  authData: AuthData,
  unsignedTx: TransactionSerializable
): Promise<Hex> {
  if (IS_DEV) console.log('[Lit] Signing transaction with PKP...', unsignedTx)

  try {
    const litClient = await getLitClient()

    // Get or create auth context
    let authContext = getCachedAuthContext(pkpInfo.publicKey)
    if (!authContext) {
      authContext = await createPKPAuthContext(pkpInfo, authData)
    }

    // Serialize the unsigned transaction
    const serializedUnsigned = serializeTransaction(unsignedTx)
    const txHash = keccak256(serializedUnsigned)

    if (IS_DEV) console.log('[Lit] Transaction hash to sign:', txHash)

    // Lit Action to sign the transaction hash
    const litActionCode = `(async () => {
      const sigShare = await Lit.Actions.signEcdsa({
        toSign: jsParams.toSign,
        publicKey: jsParams.publicKey,
        sigName: "txSig",
      });
    })();`

    const result = await litClient.executeJs({
      code: litActionCode,
      authContext: authContext,
      jsParams: {
        toSign: Array.from(hexToBytes(txHash)),
        publicKey: pkpInfo.publicKey,
      },
    })

    if (IS_DEV) console.log('[Lit] Sign result:', result)

    // Extract signature
    if (result.signatures && result.signatures.txSig) {
      const sig = result.signatures.txSig

      if (IS_DEV) console.log('[Lit] Signature object:', sig)

      // Get recovery ID (different Lit versions use different field names)
      const recoveryId = sig.recid ?? sig.recoveryId

      // signEcdsa returns { signature, publicKey, recoveryId } where signature is r+s concatenated
      if (sig.signature && recoveryId !== undefined) {
        // signature is 128 hex chars (64 bytes) = r (32 bytes) + s (32 bytes)
        const sigHex = sig.signature.startsWith('0x') ? sig.signature.slice(2) : sig.signature
        const r = `0x${sigHex.slice(0, 64)}` as Hex
        const s = `0x${sigHex.slice(64, 128)}` as Hex
        const yParity = recoveryId as 0 | 1

        if (IS_DEV) console.log('[Lit] Parsed signature:', { r, s, yParity })

        // Serialize signed transaction
        const signedTx = serializeTransaction(unsignedTx, { r, s, yParity })

        if (IS_DEV) console.log('[Lit] Transaction signed successfully')

        return signedTx
      }

      // Fallback: check for r, s, recid format (some Lit versions)
      if (sig.r && sig.s && recoveryId !== undefined) {
        const yParity = recoveryId as 0 | 1
        const signedTx = serializeTransaction(unsignedTx, {
          r: sig.r as Hex,
          s: sig.s as Hex,
          yParity,
        })

        if (IS_DEV) console.log('[Lit] Transaction signed successfully (r,s format)')

        return signedTx
      }
    }

    throw new Error('No signature returned from Lit Action')
  } catch (error) {
    console.error('[Lit] Failed to sign transaction:', error)
    throw new Error(
      `Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
