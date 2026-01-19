import { Component, createSignal, For, Show } from 'solid-js'
import { NowPlaying } from '@/features/scrobble/components/now-playing'
import { StatCard } from '@/features/scrobble/components/stat-card'
import { ScrobbleItem } from '@/features/scrobble/components/scrobble-item'
import { Button } from '@/ui/button'
import { Spinner } from '@/ui/spinner'

export type SyncState = 'idle' | 'syncing' | 'error' | 'offline'

// Mock data
const mockNowPlaying = {
  title: 'Weird Fishes/Arpeggi',
  artist: 'Radiohead',
  albumArtUrl: 'https://picsum.photos/seed/inrainbows/200/200',
  position: 127,
  duration: 309,
}

const mockRecentTracks = [
  { title: 'Weird Fishes/Arpeggi', artist: 'Radiohead', albumArtUrl: 'https://picsum.photos/seed/t1/100/100', playedAt: Math.floor(Date.now() / 1000), isNowPlaying: true, pending: true },
  { title: 'Skinny Love', artist: 'Bon Iver', albumArtUrl: 'https://picsum.photos/seed/t2/100/100', playedAt: Math.floor(Date.now() / 1000) - 1380, pending: true },
  { title: 'Be Sweet', artist: 'Japanese Breakfast', albumArtUrl: 'https://picsum.photos/seed/t3/100/100', playedAt: Math.floor(Date.now() / 1000) - 1620, pending: false },
  { title: 'Kyoto', artist: 'Phoebe Bridgers', albumArtUrl: 'https://picsum.photos/seed/t4/100/100', playedAt: Math.floor(Date.now() / 1000) - 1860, pending: false },
  { title: 'Not', artist: 'Big Thief', albumArtUrl: 'https://picsum.photos/seed/t5/100/100', playedAt: Math.floor(Date.now() / 1000) - 2100, pending: false },
  { title: 'Mystery of Love', artist: 'Sufjan Stevens', albumArtUrl: 'https://picsum.photos/seed/t6/100/100', playedAt: Math.floor(Date.now() / 1000) - 2340, pending: false },
  { title: 'White Winter Hymnal', artist: 'Fleet Foxes', albumArtUrl: 'https://picsum.photos/seed/t7/100/100', playedAt: Math.floor(Date.now() / 1000) - 2580, pending: false },
  { title: 'Bloodbuzz Ohio', artist: 'The National', albumArtUrl: 'https://picsum.photos/seed/t8/100/100', playedAt: Math.floor(Date.now() / 1000) - 2880, pending: false },
]

export const Dashboard: Component = () => {
  const [syncState, setSyncState] = createSignal<SyncState>('idle')
  const [pendingCount, setPendingCount] = createSignal(2)
  const [isPlaying] = createSignal(true)

  const handleSync = () => {
    setSyncState('syncing')
    setTimeout(() => {
      setPendingCount(0)
      setSyncState('idle')
    }, 2000)
  }

  const showSyncButton = () => pendingCount() > 0 && (syncState() === 'idle' || syncState() === 'error')

  return (
    <div class="min-h-screen bg-background p-4 md:p-8">
      <div class="max-w-2xl mx-auto space-y-4">
        {/* Now Playing */}
        <Show when={isPlaying()}>
          <NowPlaying
            title={mockNowPlaying.title}
            artist={mockNowPlaying.artist}
            albumArtUrl={mockNowPlaying.albumArtUrl}
            position={mockNowPlaying.position}
            duration={mockNowPlaying.duration}
          />
        </Show>

        {/* Stats */}
        <section class="grid grid-cols-2 gap-4">
          <StatCard value={47} label="Today" />
          <StatCard value={pendingCount()} label="Pending" />
        </section>

        {/* Sync status line */}
        <div class="flex items-center justify-between h-9">
          <p class="text-muted-foreground">
            {syncState() === 'syncing' && 'Syncing…'}
            {syncState() === 'error' && <><span class="text-destructive">Failed</span> · retry in 5 minutes</>}
            {syncState() === 'offline' && 'Offline'}
            {syncState() === 'idle' && `Synced ${pendingCount() === 0 ? 'just now' : '2 hours ago'}`}
          </p>
          <Show when={syncState() === 'syncing'}>
            <Spinner size="sm" />
          </Show>
          <Show when={showSyncButton()}>
            <Button size="sm" onClick={handleSync}>
              {syncState() === 'error' ? 'Retry' : 'Sync'}
            </Button>
          </Show>
        </div>

        {/* Recent Tracks */}
        <section class="bg-card border border-border rounded-2xl p-5">
          <h2 class="font-semibold text-foreground mb-4">Recent Tracks</h2>
          <div class="space-y-2">
            <For each={mockRecentTracks}>
              {(track) => (
                <ScrobbleItem
                  title={track.title}
                  artist={track.artist}
                  albumArtUrl={track.albumArtUrl}
                  playedAt={track.playedAt}
                  isNowPlaying={track.isNowPlaying}
                  pending={track.pending}
                />
              )}
            </For>
          </div>
        </section>
      </div>
    </div>
  )
}
