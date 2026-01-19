import { WebAuthnAuthenticator } from '@lit-protocol/auth'
import { LIT_CONFIG } from './config'
import { getLitClient } from './client'
import { saveSession } from './storage'
import { createPKPAuthContext } from './auth-pkp'
import type { PKPInfo, AuthData } from './types'

const IS_DEV = import.meta.env.DEV

/**
 * Register a new account with WebAuthn (passkey)
 * This mints a new PKP and associates it with the user's passkey
 * IMPORTANT: scopes: ["sign-anything"] grants full signing permissions
 */
export async function registerWithWebAuthn(): Promise<{
  pkpInfo: PKPInfo
  authData: AuthData
}> {
  if (IS_DEV) console.log('[Lit] Registering with WebAuthn...')

  // Register and mint PKP with signing scope
  const result = await WebAuthnAuthenticator.registerAndMintPKP({
    username: 'Neodate',
    authServiceBaseUrl: LIT_CONFIG.authServiceUrl,
    scopes: ['sign-anything'], // Required for PKP signing
  })

  if (IS_DEV) console.log('[Lit] PKP minted:', result.pkpInfo.ethAddress)

  const pkpInfo: PKPInfo = {
    publicKey: result.pkpInfo.pubkey,
    ethAddress: result.pkpInfo.ethAddress as `0x${string}`,
    tokenId: result.pkpInfo.tokenId.toString(),
  }

  // Authenticate to get auth data (access token)
  const authResult = await WebAuthnAuthenticator.authenticate()

  const authData: AuthData = {
    authMethodType: authResult.authMethodType,
    authMethodId: authResult.authMethodId,
    accessToken: authResult.accessToken,
  }

  // Persist session
  saveSession(pkpInfo, authData)

  // Create and cache PKP auth context (enables silent decrypt)
  await createPKPAuthContext(pkpInfo, authData)

  return { pkpInfo, authData }
}

/**
 * Sign in with an existing WebAuthn credential (passkey)
 * Uses viewPKPsByAuthData() to derive PKP from current auth instead of trusting cache
 */
export async function authenticateWithWebAuthn(): Promise<{
  pkpInfo: PKPInfo
  authData: AuthData
}> {
  if (IS_DEV) console.log('[Lit] Authenticating with WebAuthn...')

  // Authenticate - prompts user to approve passkey
  const authResult = await WebAuthnAuthenticator.authenticate()

  const authData: AuthData = {
    authMethodType: authResult.authMethodType,
    authMethodId: authResult.authMethodId,
    accessToken: authResult.accessToken,
  }

  // Get PKP associated with this auth method from chain
  const litClient = await getLitClient()
  const pkpsResult = await litClient.viewPKPsByAuthData({
    authData: {
      authMethodType: authData.authMethodType,
      authMethodId: authData.authMethodId,
    },
    pagination: {
      limit: 5,
      offset: 0,
    },
  })

  if (IS_DEV) console.log('[Lit] Found PKPs:', pkpsResult)

  if (!pkpsResult || !pkpsResult.pkps || pkpsResult.pkps.length === 0) {
    throw new Error('No PKP found for this credential. Please register first.')
  }

  // Use the first PKP (credential -> PKP is 1:1)
  const pkp = pkpsResult.pkps[0]
  const pkpInfo: PKPInfo = {
    publicKey: pkp.pubkey,
    ethAddress: pkp.ethAddress as `0x${string}`,
    tokenId: pkp.tokenId.toString(),
  }

  if (IS_DEV) console.log('[Lit] Using PKP:', pkpInfo.ethAddress)

  // Update session with fresh auth data
  saveSession(pkpInfo, authData)

  // Create and cache PKP auth context (enables silent decrypt)
  await createPKPAuthContext(pkpInfo, authData)

  return { pkpInfo, authData }
}

/**
 * Re-authenticate to get fresh auth data (access token)
 * Use this before signing operations
 */
export async function refreshAuth(): Promise<AuthData> {
  const authResult = await WebAuthnAuthenticator.authenticate()

  return {
    authMethodType: authResult.authMethodType,
    authMethodId: authResult.authMethodId,
    accessToken: authResult.accessToken,
  }
}
