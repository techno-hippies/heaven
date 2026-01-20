import { WebAuthnAuthenticator } from '@lit-protocol/auth'
import { startRegistration } from '@simplewebauthn/browser'
import { LIT_CONFIG } from './config'
import { getLitClient } from './client'
import { saveSession } from './storage'
import { createPKPAuthContext } from './auth-pkp'
import type { PKPInfo, AuthData } from './types'

const IS_DEV = import.meta.env.DEV

/** WebAuthn auth method type constant */
const AUTH_METHOD_TYPE_WEBAUTHN = 3

/**
 * WebAuthn credential data for adding to an existing PKP
 * This is sent to the backend which has admin auth to add it
 */
export interface WebAuthnCredential {
  authMethodType: number
  authMethodId: string
  publicKey: string // CBOR-encoded public key from registration
}

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
    username: LIT_CONFIG.displayName,
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

/**
 * Register and mint PKP for claim flow (simplified - no session)
 *
 * This creates a passkey and mints a new PKP, returning just the PKP info.
 * Used for claim flow where we only need the address to complete the claim.
 * The user can authenticate later to get a full session.
 */
export async function mintPKPForClaim(): Promise<PKPInfo> {
  if (IS_DEV) console.log('[Lit] Minting PKP for claim...')

  // Register and mint PKP with signing scope
  const result = await WebAuthnAuthenticator.registerAndMintPKP({
    username: LIT_CONFIG.displayName,
    authServiceBaseUrl: LIT_CONFIG.authServiceUrl,
    scopes: ['sign-anything'],
  })

  if (IS_DEV) console.log('[Lit] PKP minted for claim:', result.pkpInfo.ethAddress)

  return {
    publicKey: result.pkpInfo.pubkey,
    ethAddress: result.pkpInfo.ethAddress as `0x${string}`,
    tokenId: result.pkpInfo.tokenId.toString(),
  }
}

/**
 * Create a WebAuthn credential for claim flow (NO PKP mint)
 *
 * This registers a new passkey and returns the credential data needed
 * for the backend to add it to an existing shadow profile PKP.
 *
 * Flow:
 * 1. User creates passkey (this function)
 * 2. Frontend sends credential to backend with claimId
 * 3. Backend uses admin key to call addPermittedAuthMethod on shadow PKP
 * 4. User can now authenticate with this passkey for that PKP
 */
export async function createWebAuthnCredentialForClaim(): Promise<{
  credential: WebAuthnCredential
}> {
  if (IS_DEV) console.log('[Lit] Creating WebAuthn credential for claim (no mint)...')

  // Step 1: Get registration options from Lit's auth service
  const options = await WebAuthnAuthenticator.getRegistrationOptions({
    username: LIT_CONFIG.displayName,
    authServiceBaseUrl: LIT_CONFIG.authServiceUrl,
  })

  if (IS_DEV) console.log('[Lit] Got registration options, prompting user...')

  // Step 2: Prompt user to create passkey (browser native dialog)
  const registrationResponse = await startRegistration({ optionsJSON: options })

  if (IS_DEV) console.log('[Lit] Passkey created, extracting credential data...')

  // Step 3: Extract the public key from registration response
  const publicKey = WebAuthnAuthenticator.getPublicKeyFromRegistration(registrationResponse)

  // Step 4: Compute auth method ID
  const authMethod = {
    authMethodType: AUTH_METHOD_TYPE_WEBAUTHN as 3,
    accessToken: JSON.stringify(registrationResponse),
  }
  const authMethodId = await WebAuthnAuthenticator.authMethodId(authMethod)

  const credential: WebAuthnCredential = {
    authMethodType: AUTH_METHOD_TYPE_WEBAUTHN,
    authMethodId,
    publicKey,
  }

  if (IS_DEV) console.log('[Lit] Credential ready for claim:', credential.authMethodId)

  return { credential }
}
