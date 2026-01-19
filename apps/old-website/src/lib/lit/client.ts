import { createLitClient } from '@lit-protocol/lit-client'
import { createAuthManager, storagePlugins } from '@lit-protocol/auth'
import { LIT_CONFIG } from './config'

// Store the client instance - use any to avoid type conflicts between nested package versions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let litClientInstance: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authManagerInstance: any = null

/**
 * Get or create the singleton LitClient
 * Lazy initialization - only created when first requested
 */
export async function getLitClient() {
  if (!litClientInstance) {
    litClientInstance = await createLitClient({
      // Cast to any to avoid type conflicts between nested @lit-protocol/networks versions
      network: LIT_CONFIG.network as any,
    })
  }
  return litClientInstance
}

/**
 * Get or create the singleton AuthManager
 * Uses localStorage for session persistence
 */
export function getAuthManager() {
  if (!authManagerInstance) {
    authManagerInstance = createAuthManager({
      storage: storagePlugins.localStorage({
        appName: 'neodate',
        networkName: LIT_CONFIG.networkName,
      }),
    })
  }
  return authManagerInstance
}

/**
 * Reset all client instances (for logout)
 */
export function resetClient(): void {
  litClientInstance = null
  authManagerInstance = null
}

/**
 * Check if Lit client is initialized
 */
export function isLitClientInitialized(): boolean {
  return litClientInstance !== null
}
