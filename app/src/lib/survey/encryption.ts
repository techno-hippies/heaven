/**
 * Survey Encryption Module
 *
 * Lit Protocol encryption/decryption for survey tiers.
 */

import { getLitClient } from '@/lib/lit'
import type { LitEncryptedEnvelope, EncryptedTierContent } from './types'

// ============ Contract Config ============

// TODO: Move to env/config
const DATING_CONTRACT = import.meta.env.VITE_DATING_ADDRESS || '0x1282fF4F33eFA67ea4f85E462F5D73e2cfF25b07'
const CHAIN = 'sepolia'

// ============ Access Control Conditions ============

/**
 * Build evmContractConditions for match-only tier.
 * Decryption succeeds when areMatched(viewer, owner) returns true.
 */
export function buildMatchOnlyConditions(ownerAddress: string) {
  return [
    {
      contractAddress: DATING_CONTRACT,
      chain: CHAIN,
      functionName: 'areMatched',
      functionParams: [':userAddress', ownerAddress],
      functionAbi: {
        name: 'areMatched',
        inputs: [
          { name: 'a', type: 'address' },
          { name: 'b', type: 'address' },
        ],
        outputs: [{ name: '', type: 'bool' }],
      },
      returnValueTest: {
        comparator: '=',
        value: 'true',
      },
    },
  ]
}

/**
 * Build accessControlConditions for private (owner-only) tier.
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
  ownerAddress: string
}

/**
 * Encrypt tier content with Lit Protocol.
 * Returns a complete LitEncryptedEnvelope ready for IPFS upload.
 */
export async function encryptTier(params: EncryptTierParams): Promise<LitEncryptedEnvelope> {
  const { content, ownerAddress } = params
  const litClient = await getLitClient()

  const dataToEncrypt = new TextEncoder().encode(JSON.stringify(content))

  let encryptResult: { ciphertext: Uint8Array; dataToEncryptHash: string }
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
      ciphertext: uint8ArrayToBase64(encryptResult.ciphertext),
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
      ciphertext: uint8ArrayToBase64(encryptResult.ciphertext),
      dataToEncryptHash: encryptResult.dataToEncryptHash,
      accessControlConditions: conditions,
      chain: CHAIN,
    }
  }

  return envelope
}

// ============ Decryption ============

interface DecryptTierParams {
  envelope: LitEncryptedEnvelope
}

/**
 * Decrypt a LitEncryptedEnvelope.
 * Caller must satisfy the access control conditions.
 */
export async function decryptTier(params: DecryptTierParams): Promise<EncryptedTierContent> {
  const { envelope } = params
  const litClient = await getLitClient()

  const ciphertext = base64ToUint8Array(envelope.ciphertext)

  // Build decrypt params based on condition type in envelope
  const decryptParams: Record<string, unknown> = {
    ciphertext,
    dataToEncryptHash: envelope.dataToEncryptHash,
    chain: envelope.chain,
  }

  if (envelope.evmContractConditions) {
    decryptParams.evmContractConditions = envelope.evmContractConditions
  } else if (envelope.accessControlConditions) {
    decryptParams.accessControlConditions = envelope.accessControlConditions
  } else if (envelope.unifiedAccessControlConditions) {
    decryptParams.unifiedAccessControlConditions = envelope.unifiedAccessControlConditions
  }

  const decrypted = await litClient.decrypt(decryptParams)
  const json = new TextDecoder().decode(decrypted as Uint8Array)
  return JSON.parse(json) as EncryptedTierContent
}

// ============ Helpers ============

function uint8ArrayToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
