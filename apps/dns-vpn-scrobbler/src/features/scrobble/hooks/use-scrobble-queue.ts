import { createSignal, onCleanup, onMount } from 'solid-js'
import { invoke } from '@tauri-apps/api/core'
import { listen, UnlistenFn } from '@tauri-apps/api/event'
import type { Scrobble, PendingScrobble, SyncStatus } from './types'
import { submitScrobbleBatch, type ScrobbleTrack } from '@/lib/lit'
import type { PKPInfo, AuthData } from '@/lib/lit'

export type SyncState = 'idle' | 'syncing' | 'error'

/**
 * Hook for managing the scrobble queue and sync operations.
 * Subscribes to scrobble-added events and provides sync functionality.
 */
export function useScrobbleQueue() {
  const [syncStatus, setSyncStatus] = createSignal<SyncStatus>({
    todayCount: 0,
    pendingCount: 0,
    lastSync: null,
    isSyncing: false,
  })
  const [recentScrobbles, setRecentScrobbles] = createSignal<Scrobble[]>([])
  const [syncState, setSyncState] = createSignal<SyncState>('idle')
  const [isLoading, setIsLoading] = createSignal(true)
  const [syncError, setSyncError] = createSignal<string | null>(null)

  // Cache for resolved art URLs (file:// -> data:)
  const artCache = new Map<string, string>()

  /** Resolve art URLs for scrobbles (file:// paths need conversion) */
  const resolveArtUrls = async (scrobbles: Scrobble[]): Promise<Scrobble[]> => {
    return Promise.all(
      scrobbles.map(async (scrobble) => {
        if (!scrobble.artUrl) return scrobble

        const url = scrobble.artUrl
        // Already resolved or remote URL
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
          return scrobble
        }

        // Check cache
        const cached = artCache.get(url)
        if (cached) {
          return { ...scrobble, artUrl: cached }
        }

        // Resolve file:// URL
        if (url.startsWith('file://') || url.startsWith('/')) {
          try {
            const resolved = await invoke<string | null>('get_album_art', { artUrl: url })
            if (resolved) {
              artCache.set(url, resolved)
              return { ...scrobble, artUrl: resolved }
            }
          } catch {
            // Ignore resolution errors
          }
        }

        return scrobble
      })
    )
  }

  /** Refresh all data from backend */
  const refresh = async () => {
    try {
      const [status, recent] = await Promise.all([
        invoke<SyncStatus>('get_sync_status'),
        invoke<Scrobble[]>('get_recent_scrobbles', { limit: 10 }),
      ])
      setSyncStatus(status)
      // Resolve art URLs before setting
      const resolved = await resolveArtUrls(recent)
      setRecentScrobbles(resolved)
    } catch (e) {
      console.error('Failed to refresh scrobble data:', e)
    }
  }

  onMount(async () => {
    // Initial fetch
    await refresh()
    setIsLoading(false)

    // Listen for new scrobbles
    const unlisteners: UnlistenFn[] = []

    listen<Scrobble>('scrobble-added', async () => {
      // Refresh data when a new scrobble is added
      await refresh()
    }).then((fn) => unlisteners.push(fn))

    onCleanup(() => {
      unlisteners.forEach((fn) => fn())
    })
  })

  /**
   * Sync pending scrobbles to the blockchain.
   * This gets the pending batch, calls the Lit Action, and marks them synced.
   *
   * @param pkpInfo - User's PKP info (from AuthContext)
   * @param authData - User's auth data (from AuthContext)
   */
  const sync = async (pkpInfo?: PKPInfo | null, authData?: AuthData | null) => {
    if (syncState() === 'syncing') return

    setSyncState('syncing')
    setSyncError(null)

    try {
      // Mark as syncing in backend
      await invoke('set_syncing', { syncing: true })

      // Get pending batch
      const pending = await invoke<PendingScrobble[]>('get_pending_batch', { limit: 500 })

      if (pending.length === 0) {
        setSyncState('idle')
        await invoke('set_syncing', { syncing: false })
        return
      }

      // Get PKP info from Tauri if not provided
      let effectivePkpInfo = pkpInfo
      let effectiveAuthData = authData

      if (!effectivePkpInfo?.publicKey) {
        const publicKey = await invoke<string | null>('get_pkp_public_key')
        const address = await invoke<string | null>('get_pkp_address')

        if (!publicKey || !address) {
          throw new Error('Not authenticated. Please sign in first.')
        }

        effectivePkpInfo = {
          publicKey,
          ethAddress: address as `0x${string}`,
          tokenId: '',
        }
      }

      if (!effectiveAuthData?.authMethodId) {
        // Get auth data from Tauri storage
        const storedAuth = await invoke<{
          authMethodType?: number
          authMethodId?: string
          accessToken?: string
        } | null>('get_auth_data')

        if (storedAuth?.authMethodType && storedAuth?.authMethodId) {
          effectiveAuthData = {
            authMethodType: storedAuth.authMethodType,
            authMethodId: storedAuth.authMethodId,
            accessToken: storedAuth.accessToken || '',
          }
        } else {
          throw new Error('Missing auth data. Please sign out and sign in again.')
        }
      }

      // Get next nonce from backend
      const nonce = await invoke<number>('get_next_nonce')

      // Format tracks for Lit Action
      const tracks: ScrobbleTrack[] = pending.map((s) => ({
        artist: s.artist,
        title: s.title,
        album: s.album,
        duration: s.dur,
        playedAt: s.playedAt,
      }))

      console.log(`[Sync] Submitting ${tracks.length} scrobbles to Lit Action (nonce: ${nonce})`)

      // Call Lit Action
      const result = await submitScrobbleBatch(
        tracks,
        nonce,
        effectivePkpInfo,
        effectiveAuthData!
      )

      if (!result.success) {
        throw new Error(result.error)
      }

      // Record nonce and mark batch as synced
      await invoke('record_nonce', {
        nonce,
        txHash: result.txHash,
        cid: result.cidString,
      })

      const ids = pending.map((s) => s.id)
      await invoke('mark_batch_synced', {
        ids,
        cid: result.cidString,
        txHash: result.txHash,
      })

      console.log(`[Sync] Batch synced successfully:`, {
        txHash: result.txHash,
        cid: result.cidString,
        count: result.count,
      })

      // Refresh data
      await refresh()
      setSyncState('idle')
    } catch (e) {
      console.error('Sync failed:', e)
      setSyncError(e instanceof Error ? e.message : String(e))
      setSyncState('error')
    } finally {
      await invoke('set_syncing', { syncing: false })
    }
  }

  return {
    // State
    syncStatus,
    recentScrobbles,
    syncState,
    syncError,
    isLoading,

    // Derived
    todayCount: () => syncStatus().todayCount,
    pendingCount: () => syncStatus().pendingCount,
    lastSync: () => syncStatus().lastSync,

    // Actions
    sync,
    refresh,
  }
}
