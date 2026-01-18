/**
 * Survey Encryption Module
 *
 * Lit Protocol encryption/decryption for survey tiers.
 *
 * ARCHITECTURE: PKP as primary address
 * - WebAuthn users have PKP → use PKP for Dating + surveys
 * - EOA users mint PKP once → use PKP for on-chain + Lit
 * - Dating.areMatched() should be called with PKP addresses
 * - Lit :userAddress resolves to PKP (from PKP auth context)
 * - EOA can still be used for XMTP separately
 */

import { getLitClient, getAnyAuthContext } from '@/lib/lit'
import type { LitEncryptedEnvelope, EncryptedTierContent } from './types'

// ============ Contract Config ============

const DATING_CONTRACT = import.meta.env.VITE_DATING_ADDRESS || '0x1282fF4F33eFA67ea4f85E462F5D73e2cfF25b07'
const CHAIN = 'sepolia'

// ============ Access Control Conditions ============

/**
 * Build evmContractConditions for match-only tier.
 * Decryption succeeds when areMatched(viewer, owner) returns true.
 *
 * @param ownerAddress PKP address of the survey owner (must match Dating contract registration)
 */
export function buildMatchOnlyConditions(ownerAddress: string) {
  return [
    {
      contractAddress: DATING_CONTRACT,
      chain: CHAIN,
      functionName: 'areMatched',
      functionParams: [':userAddress', ownerAddress],
      functionAbi: {
        type: 'function',
        name: 'areMatched',
        stateMutability: 'view',
        inputs: [
          { name: 'a', type: 'address' },
          { name: 'b', type: 'address' },
        ],
        outputs: [{ name: '', type: 'bool' }],
      },
      returnValueTest: {
        key: '',
        comparator: '=',
        value: 'true',
      },
    },
  ]
}

/**
 * Build accessControlConditions for private (owner-only) tier.
 *
 * @param ownerAddress PKP address of the survey owner
 */
export function buildPrivateConditions(ownerAddress: string) {
  return [
    {
      conditionType: 'evmBasic',
      contractAddress: '',
      standardContractType: '',
      chain: CHAIN,
      method: '',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '=',
        value: ownerAddress,
      },
    },
  ]
}

// ============ Encryption ============

interface EncryptTierParams {
  content: EncryptedTierContent
  /** PKP address of the survey owner (must match Dating contract registration) */
  ownerAddress: string
}

/**
 * Encrypt tier content with Lit Protocol.
 * Returns a complete LitEncryptedEnvelope ready for IPFS upload.
 *
 * NOTE: Encryption does not require authContext per SDK docs.
 */
export async function encryptTier(params: EncryptTierParams): Promise<LitEncryptedEnvelope> {
  const { content, ownerAddress } = params
  const litClient = await getLitClient()

  const dataToEncrypt = JSON.stringify(content)

  let encryptResult: { ciphertext: string; dataToEncryptHash: string }
  let envelope: LitEncryptedEnvelope

  if (content.tier === 'matchOnly') {
    const conditions = buildMatchOnlyConditions(ownerAddress)
    encryptResult = await litClient.encrypt({
      dataToEncrypt,
      evmContractConditions: conditions,
      chain: CHAIN,
    })
    envelope = {
      v: 1,
      ciphertext: encryptResult.ciphertext, // Already base64 from SDK
      dataToEncryptHash: encryptResult.dataToEncryptHash,
      evmContractConditions: conditions,
      chain: CHAIN,
    }
  } else {
    // private tier
    const conditions = buildPrivateConditions(ownerAddress)
    encryptResult = await litClient.encrypt({
      dataToEncrypt,
      accessControlConditions: conditions,
      chain: CHAIN,
    })
    envelope = {
      v: 1,
      ciphertext: encryptResult.ciphertext, // Already base64 from SDK
      dataToEncryptHash: encryptResult.dataToEncryptHash,
      accessControlConditions: conditions,
      chain: CHAIN,
    }
  }

  return envelope
}

// ============ Auth Context ============

/**
 * Get cached PKP auth context for decryption.
 * Throws if user hasn't authenticated (auth context is created during login).
 *
 * The auth context is created during WebAuthn/EOA login and cached for the session.
 * It includes the 'access-control-condition-decryption' resource needed for decrypt.
 */
export function getDecryptionAuthContext() {
  const cached = getAnyAuthContext()
  if (!cached) {
    throw new Error('No auth context available. User must be authenticated to decrypt.')
  }
  return cached
}

// ============ Decryption ============

interface DecryptTierParams {
  envelope: LitEncryptedEnvelope
  /** Optional auth context - if not provided, will use PKP auth */
  authContext?: unknown
}

/**
 * Decrypt a LitEncryptedEnvelope.
 * Caller must satisfy the access control conditions.
 *
 * Uses PKP auth context by default (silent, no signing prompts).
 * The PKP address must match the owner address in Dating contract.
 */
export async function decryptTier(params: DecryptTierParams): Promise<EncryptedTierContent> {
  const { envelope } = params
  const litClient = await getLitClient()

  // Get auth context (PKP preferred for silent auth)
  const authContext = params.authContext ?? (await getDecryptionAuthContext())

  // Build decrypt params - SDK expects base64 ciphertext string
  const decryptParams: Record<string, unknown> = {
    data: {
      ciphertext: envelope.ciphertext,
      dataToEncryptHash: envelope.dataToEncryptHash,
    },
    authContext,
    chain: envelope.chain,
  }

  // Use whichever condition type was stored in the envelope
  if (envelope.evmContractConditions) {
    decryptParams.evmContractConditions = envelope.evmContractConditions
  } else if (envelope.accessControlConditions) {
    decryptParams.accessControlConditions = envelope.accessControlConditions
  } else if (envelope.unifiedAccessControlConditions) {
    decryptParams.unifiedAccessControlConditions = envelope.unifiedAccessControlConditions
  }

  const decryptResponse = await litClient.decrypt(decryptParams)

  // SDK returns DecryptResponse object with decryptedData (Uint8Array) or convertedData (if metadata present)
  let decryptedString: string
  if (typeof decryptResponse === 'object' && decryptResponse !== null) {
    const response = decryptResponse as { decryptedData?: Uint8Array; convertedData?: string }
    if (response.convertedData) {
      // If metadata was provided during encrypt, SDK converts to original type
      decryptedString = response.convertedData
    } else if (response.decryptedData) {
      // Otherwise decode the raw bytes
      decryptedString = new TextDecoder().decode(response.decryptedData)
    } else {
      throw new Error('Decrypt response missing data')
    }
  } else {
    // Fallback in case SDK behavior differs
    decryptedString = String(decryptResponse)
  }

  return JSON.parse(decryptedString) as EncryptedTierContent
}
