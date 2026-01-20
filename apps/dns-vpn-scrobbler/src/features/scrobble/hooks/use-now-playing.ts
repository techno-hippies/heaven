import { createSignal, onCleanup, onMount } from 'solid-js'
import { invoke } from '@tauri-apps/api/core'
import { listen, UnlistenFn } from '@tauri-apps/api/event'
import type { NowPlaying } from './types'

/**
 * Hook for tracking the currently playing track.
 * Subscribes to now-playing-changed events from the Tauri backend.
 * No polling needed - we just show track info, not position.
 */
export function useNowPlaying() {
  const [nowPlaying, setNowPlaying] = createSignal<NowPlaying | null>(null)
  const [isLoading, setIsLoading] = createSignal(true)
  const artCache = new Map<string, string>()

  const resolveNowPlaying = async (next: NowPlaying | null) => {
    if (!next?.albumArtUrl) {
      setNowPlaying(next)
      return
    }

    const url = next.albumArtUrl
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      setNowPlaying(next)
      return
    }

    const cached = artCache.get(url)
    if (cached) {
      setNowPlaying({ ...next, albumArtUrl: cached })
      return
    }

    if (url.startsWith('file://') || url.startsWith('/')) {
      try {
        const resolved = await invoke<string | null>('get_album_art', { artUrl: url })
        if (resolved) {
          artCache.set(url, resolved)
          setNowPlaying({ ...next, albumArtUrl: resolved })
          return
        }
      } catch (e) {
        console.warn('Failed to load album art:', e)
      }
    }

    setNowPlaying(next)
  }

  onMount(async () => {
    // Fetch initial state
    try {
      const initial = await invoke<NowPlaying | null>('get_now_playing')
      await resolveNowPlaying(initial)
    } catch (e) {
      console.error('Failed to get now playing:', e)
    } finally {
      setIsLoading(false)
    }

    // Listen for track/status changes
    let unlisten: UnlistenFn | undefined

    listen<NowPlaying | null>('now-playing-changed', (event) => {
      void resolveNowPlaying(event.payload)
    }).then((fn) => {
      unlisten = fn
    })

    onCleanup(() => {
      unlisten?.()
    })
  })

  return {
    nowPlaying,
    isLoading,
  }
}
