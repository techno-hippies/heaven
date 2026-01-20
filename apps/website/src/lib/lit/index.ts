// Configuration
export { LIT_CONFIG } from './config'

// Types
export type { PKPInfo, AuthData, SessionData, AuthStatus } from './types'

// Client management
export { getLitClient, getAuthManager, resetClient, isLitClientInitialized } from './client'

// Session storage
export {
  saveSession,
  loadSession,
  clearSession,
  getAuthStatus,
  isSessionExpiringSoon,
} from './storage'

// WebAuthn authentication
export {
  registerWithWebAuthn,
  authenticateWithWebAuthn,
  refreshAuth,
  mintPKPForClaim,
  createWebAuthnCredentialForClaim,
  type WebAuthnCredential,
} from './auth-webauthn'

// EOA authentication
export { registerWithEoa, loginWithEoa, getExistingPkpForEoa } from './auth-eoa'

// PKP auth context
export { createPKPAuthContext, getCachedAuthContext, getAnyAuthContext, clearAuthContext } from './auth-pkp'

// Message and transaction signing
export { signMessageWithPKP, signDigestWithPKP, signTransactionWithPKP } from './signer-pkp'
