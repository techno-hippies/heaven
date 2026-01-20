/**
 * Types for scrobble data from Tauri backend
 */

/** Now playing track information */
export interface NowPlaying {
  title: string
  artist: string
  album?: string | null
  position: number
  duration: number
  isPlaying: boolean
  source: string
  albumArtUrl?: string | null
}

/** A scrobble record from the database */
export interface Scrobble {
  id: number
  playedAt: number
  duration: number
  artist: string
  title: string
  album?: string | null
  source: string
  sourceTrackId?: string | null
  artUrl?: string | null
  synced: boolean
  batchCid?: string | null
}

/** A pending scrobble for batch submission */
export interface PendingScrobble {
  id: number
  playedAt: number
  dur: number
  artist: string
  title: string
  album?: string | null
  source: string
}

/** Sync status from the backend */
export interface SyncStatus {
  todayCount: number
  pendingCount: number
  lastSync?: string | null
  isSyncing: boolean
}
