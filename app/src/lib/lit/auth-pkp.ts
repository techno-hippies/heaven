/**
 * PKP Auth Context Management
 * Creates authentication contexts for PKP signing
 */

import { getLitClient, getAuthManager } from './client'
import type { PKPInfo, AuthData } from './types'

const IS_DEV = import.meta.env.DEV

// PKP Auth Context type (opaque from Lit SDK)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PKPAuthContext = any

/**
 * In-memory cache for auth context
 */
let cachedAuthContext: PKPAuthContext | null = null
let cachedPKPPublicKey: string | null = null

/**
 * Calculate expiration time (24 hours from now)
 */
function getExpiration(): string {
  return new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
}

/**
 * Create PKP auth context for signing
 */
export async function createPKPAuthContext(
  pkpInfo: PKPInfo,
  authData: AuthData
): Promise<PKPAuthContext> {
  // Return cached context if available
  if (cachedAuthContext && cachedPKPPublicKey === pkpInfo.publicKey) {
    if (IS_DEV) console.log('[Lit] Using cached PKP auth context')
    return cachedAuthContext
  }

  if (IS_DEV) console.log('[Lit] Creating PKP auth context...')

  try {
    const litClient = await getLitClient()
    const authManager = getAuthManager()

    const authContext = await authManager.createPkpAuthContext({
      authData: authData as any,
      pkpPublicKey: pkpInfo.publicKey,
      authConfig: {
        // Minimal resources as per Lit docs
        resources: [
          ['pkp-signing', '*'],
          ['lit-action-execution', '*'],
        ],
        expiration: getExpiration(),
        statement: '',
        domain: typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
      },
      litClient: litClient,
    })

    // Cache for this session
    cachedAuthContext = authContext
    cachedPKPPublicKey = pkpInfo.publicKey

    if (IS_DEV) {
      console.log('[Lit] PKP auth context created')
    }

    return authContext
  } catch (error) {
    console.error('[Lit] Failed to create PKP auth context:', error)
    throw new Error(`Failed to create PKP auth context: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get cached auth context
 */
export function getCachedAuthContext(pkpPublicKey: string): PKPAuthContext | null {
  if (cachedAuthContext && cachedPKPPublicKey === pkpPublicKey) {
    return cachedAuthContext
  }
  return null
}

/**
 * Clear cached auth context
 */
export function clearAuthContext(): void {
  if (IS_DEV) console.log('[Lit] Clearing cached auth context')
  cachedAuthContext = null
  cachedPKPPublicKey = null
}
