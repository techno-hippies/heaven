import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the correct asset path for IPFS/serverless deployment.
 * Prepends the base URL configured in Vite.
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  // Remove leading slash from path if present, base already ends with /
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${base}${cleanPath}`
}

/**
 * Haptic feedback utilities (Android Chrome only, graceful no-op elsewhere)
 */
export const haptic = {
  /** Light tap - tab switches, toggles (5ms) */
  light: () => navigator.vibrate?.(5),
  /** Medium tap - button presses, selections (10ms) */
  medium: () => navigator.vibrate?.(10),
  /** Heavy tap - important actions like send, confirm (15ms) */
  heavy: () => navigator.vibrate?.(15),
  /** Success pattern - matches, achievements */
  success: () => navigator.vibrate?.([10, 50, 10]),
  /** Double tap - likes, favorites */
  double: () => navigator.vibrate?.([8, 30, 8]),
  /** Heart pulse - when you match */
  heartbeat: () => navigator.vibrate?.([15, 100, 15, 100, 25]),
}
