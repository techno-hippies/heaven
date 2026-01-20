/**
 * FHE Encryption for Dating Profile
 *
 * Encrypts profile values using Zama's fhEVM for privacy-preserving matching.
 */

import { createInstance } from '@zama-fhe/relayer-sdk/web'
import { FHE_CONFIG } from './config'

const IS_DEV = import.meta.env.DEV

// Singleton instance
let fhevmInstance: Awaited<ReturnType<typeof createInstance>> | null = null

/**
 * Get or create the fhEVM instance
 */
async function getFhevmInstance() {
  if (!fhevmInstance) {
    if (IS_DEV) console.log('[FHE] Initializing fhEVM instance...')

    fhevmInstance = await createInstance({
      chainId: FHE_CONFIG.chainId,
      network: FHE_CONFIG.rpcUrl,
      ...FHE_CONFIG.fhevm,
    })

    if (IS_DEV) console.log('[FHE] fhEVM instance ready')
  }
  return fhevmInstance
}

/**
 * Encrypted profile data ready for the Lit Action
 */
export interface EncryptedProfileData {
  encAge: string           // bytes32 hex
  encGenderId: string      // bytes32 hex
  encDesiredMask: string   // bytes32 hex
  encShareAge: string      // bytes32 hex
  encShareGender: string   // bytes32 hex
  proof: string            // hex-encoded proof bytes
}

/**
 * Encrypt Phase 1 profile data for DatingV3.setBasicsFor()
 *
 * @param userAddress - User's PKP address (for encryption binding)
 * @param age - User's age (18-99)
 * @param genderId - Gender ID (1-5)
 * @param desiredMask - Bitmask of desired genders
 * @param shareAge - Whether to reveal age on match
 * @param shareGender - Whether to reveal gender on match
 */
export async function encryptProfileData(
  userAddress: string,
  age: number,
  genderId: number,
  desiredMask: number,
  shareAge: boolean = true,
  shareGender: boolean = true
): Promise<EncryptedProfileData> {
  if (IS_DEV) {
    console.log('[FHE] Encrypting profile data:', {
      userAddress,
      age,
      genderId,
      desiredMask: `0x${desiredMask.toString(16)}`,
      shareAge,
      shareGender,
    })
  }

  const instance = await getFhevmInstance()

  // Create encrypted input bound to contract and user
  const input = instance.createEncryptedInput(
    FHE_CONFIG.datingContractAddress,
    userAddress
  )

  // Add values in the order expected by the contract
  input.add8(BigInt(age))           // euint8 for age
  input.add8(BigInt(genderId))      // euint8 for genderId
  input.add16(BigInt(desiredMask))  // euint16 for desiredMask
  input.addBool(shareAge)           // ebool for shareAge
  input.addBool(shareGender)        // ebool for shareGender

  if (IS_DEV) console.log('[FHE] Calling encrypt() - contacting Zama relayer...')

  // Encrypt and get handles + proof
  const encrypted = await input.encrypt()

  const handles = encrypted.handles
  const proof = encrypted.inputProof

  if (IS_DEV) console.log('[FHE] Received', handles.length, 'handles')

  // Convert Uint8Array handles to hex strings
  const toHex = (arr: Uint8Array | string): string => {
    if (typeof arr === 'string') return arr
    return '0x' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const result: EncryptedProfileData = {
    encAge: toHex(handles[0]),
    encGenderId: toHex(handles[1]),
    encDesiredMask: toHex(handles[2]),
    encShareAge: toHex(handles[3]),
    encShareGender: toHex(handles[4]),
    proof: typeof proof === 'string' ? proof : toHex(proof),
  }

  if (IS_DEV) {
    console.log('[FHE] Encryption complete:', {
      encAge: result.encAge.slice(0, 20) + '...',
      encGenderId: result.encGenderId.slice(0, 20) + '...',
      proofLength: result.proof.length,
    })
  }

  return result
}

/**
 * Reset the fhEVM instance (for testing/logout)
 */
export function resetFhevmInstance(): void {
  fhevmInstance = null
}
