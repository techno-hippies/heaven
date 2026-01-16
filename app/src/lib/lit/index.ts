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
export { registerWithWebAuthn, authenticateWithWebAuthn, refreshAuth } from './auth-webauthn'

// EOA authentication
export { registerWithEoa, loginWithEoa, getExistingPkpForEoa } from './auth-eoa'

// PKP auth context
export { createPKPAuthContext, getCachedAuthContext, clearAuthContext } from './auth-pkp'

// Message signing
export { signMessageWithPKP } from './signer-pkp'
