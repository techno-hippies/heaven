/**
 * Dating SetBasics Sponsor
 *
 * Calls the Lit Action to sponsor FHE profile creation.
 * User's PKP signs EIP-712 authorization, sponsor PKP pays gas.
 */

import { getLitClient } from '../lit/client'
import { createPKPAuthContext, getCachedAuthContext } from '../lit/auth-pkp'
import type { PKPInfo, AuthData } from '../lit/types'
import { FHE_CONFIG } from './config'
import { encryptProfileData } from './encrypt'
import { toDesiredMask } from '@/features/onboarding/steps/preferences/InterestedInStep'

const IS_DEV = import.meta.env.DEV

export interface SetBasicsResult {
  success: boolean
  txHash?: string
  error?: string
}

export interface Phase1ProfileData {
  age: string           // String from form, e.g., "25"
  gender: string        // Gender ID as string, e.g., "2" for woman
  interestedIn: string[] // Array of gender IDs, e.g., ["1", "2"]
}

/**
 * Create FHE profile via sponsored transaction
 *
 * @param pkpInfo - User's PKP info
 * @param authData - User's auth data
 * @param profile - Phase 1 profile data
 * @returns Result with txHash on success
 */
export async function callDatingSetBasicsSponsor(
  pkpInfo: PKPInfo,
  authData: AuthData,
  profile: Phase1ProfileData
): Promise<SetBasicsResult> {
  if (IS_DEV) {
    console.log('[Sponsor] Starting DatingV3.setBasicsFor() sponsor flow...', {
      user: pkpInfo.ethAddress,
      age: profile.age,
      gender: profile.gender,
      interestedIn: profile.interestedIn,
    })
  }

  try {
    // Parse profile data
    const age = parseInt(profile.age, 10)
    const genderId = parseInt(profile.gender, 10)
    const desiredMask = toDesiredMask(profile.interestedIn)

    // Validate
    if (isNaN(age) || age < 18 || age > 99) {
      throw new Error(`Invalid age: ${profile.age}`)
    }
    if (isNaN(genderId) || genderId < 1 || genderId > 5) {
      throw new Error(`Invalid gender ID: ${profile.gender}`)
    }
    if (desiredMask === 0) {
      throw new Error('Must select at least one gender preference')
    }

    if (IS_DEV) {
      console.log('[Sponsor] Parsed profile:', {
        age,
        genderId,
        desiredMask: `0x${desiredMask.toString(16)}`,
      })
    }

    // Step 1: Encrypt profile data with Zama FHE
    if (IS_DEV) console.log('[Sponsor] Step 1: Encrypting with Zama FHE...')

    const encrypted = await encryptProfileData(
      pkpInfo.ethAddress,
      age,
      genderId,
      desiredMask,
      true,  // shareAge
      true   // shareGender
    )

    // Step 2: Get Lit client and auth context
    if (IS_DEV) console.log('[Sponsor] Step 2: Getting Lit auth context...')

    const litClient = await getLitClient()

    let authContext = getCachedAuthContext(pkpInfo.publicKey, authData)
    if (!authContext) {
      authContext = await createPKPAuthContext(pkpInfo, authData)
    }

    // Step 3: Execute Lit Action
    if (IS_DEV) console.log('[Sponsor] Step 3: Executing Lit Action...')

    const jsParams = {
      // User's PKP signs EIP-712 authorization
      userPkpPublicKey: pkpInfo.publicKey,
      // Sponsor PKP signs and pays for TX
      sponsorPkpPublicKey: FHE_CONFIG.sponsorPkpPublicKey,
      // Encrypted values
      encAge: encrypted.encAge,
      encGenderId: encrypted.encGenderId,
      encDesiredMask: encrypted.encDesiredMask,
      encShareAge: encrypted.encShareAge,
      encShareGender: encrypted.encShareGender,
      proof: encrypted.proof,
      // Chain config
      chainId: FHE_CONFIG.chainId,
      contractAddress: FHE_CONFIG.datingContractAddress,
      // Don't dry run - actually broadcast
      dryRun: false,
    }

    const result = await litClient.executeJs({
      ipfsId: FHE_CONFIG.litActionCid,
      authContext,
      jsParams,
    })

    if (IS_DEV) console.log('[Sponsor] Lit Action result:', result)

    // Parse response
    const response = typeof result.response === 'string'
      ? JSON.parse(result.response)
      : result.response

    if (!response?.success) {
      throw new Error(response?.error || 'Lit Action returned success=false')
    }

    if (IS_DEV) {
      console.log('[Sponsor] Profile created successfully!', {
        txHash: response.txHash,
        user: response.user,
      })
    }

    return {
      success: true,
      txHash: response.txHash,
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[Sponsor] Failed to create profile:', message)

    return {
      success: false,
      error: message,
    }
  }
}
