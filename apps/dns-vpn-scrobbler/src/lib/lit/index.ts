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
export { createPKPAuthContext, getCachedAuthContext, getAnyAuthContext, clearAuthContext } from './auth-pkp'

// PKP signing
export { signMessageWithPKP, createSigner } from './sign'

// Scrobble sync
export { submitScrobbleBatch, type ScrobbleTrack, type ScrobbleSyncResult, type ScrobbleSyncError, type ScrobbleSyncResponse } from './scrobble-sync'
