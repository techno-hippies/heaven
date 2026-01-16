import { LIT_CONFIG } from './config'
import type { PKPInfo, AuthData, SessionData, AuthStatus } from './types'

/**
 * Save session data to localStorage
 */
export function saveSession(pkpInfo: PKPInfo, authData: AuthData): void {
  const session: SessionData = {
    pkpInfo,
    authData,
    expiresAt: Date.now() + LIT_CONFIG.sessionExpirationMs,
  }
  localStorage.setItem(LIT_CONFIG.storageKeys.session, JSON.stringify(session))
}

/**
 * Load session data from localStorage
 * Returns null if no session exists or if expired
 */
export function loadSession(): SessionData | null {
  const stored = localStorage.getItem(LIT_CONFIG.storageKeys.session)
  if (!stored) return null

  try {
    const session: SessionData = JSON.parse(stored)

    // Auto-cleanup if expired
    if (Date.now() >= session.expiresAt) {
      clearSession()
      return null
    }

    return session
  } catch {
    clearSession()
    return null
  }
}

/**
 * Clear all session data
 */
export function clearSession(): void {
  localStorage.removeItem(LIT_CONFIG.storageKeys.session)
  // Also clear auth manager storage keys
  localStorage.removeItem(`lit-auth:${LIT_CONFIG.networkName}:neodate`)
}

/**
 * Get current authentication status
 */
export function getAuthStatus(): AuthStatus {
  const session = loadSession()
  return {
    isAuthenticated: session !== null,
    pkpInfo: session?.pkpInfo || null,
    authData: session?.authData || null,
    expiresAt: session?.expiresAt || null,
  }
}

/**
 * Check if session is close to expiring (within 1 hour)
 */
export function isSessionExpiringSoon(): boolean {
  const session = loadSession()
  if (!session) return false
  return session.expiresAt - Date.now() < 60 * 60 * 1000 // 1 hour
}
