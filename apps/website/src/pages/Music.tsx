import type { Component } from 'solid-js'
import { For, Show } from 'solid-js'
import { A } from '@solidjs/router'
import { Icon } from '@/icons'
import { IconButton } from '@/ui/icon-button'
import { cn } from '@/lib/utils'

// Mock data - would come from scrobbler
const mockData = {
  user: {
    name: 'sakura',
    domain: 'sakura.heaven',
  },
  stats: {
    totalScrobbles: 12847,
    hoursThisWeek: 23,
  },
  nowPlaying: {
    title: 'Weird Fishes/Arpeggi',
    artist: 'Radiohead',
    album: 'In Rainbows',
    albumArtUrl: 'https://picsum.photos/seed/inrainbows/200/200',
  },
  topArtists: [
    { name: 'Radiohead', imageUrl: 'https://picsum.photos/seed/a1/100/100', playCount: 247 },
    { name: 'Bon Iver', imageUrl: 'https://picsum.photos/seed/a2/100/100', playCount: 182 },
    { name: 'Japanese Breakfast', imageUrl: 'https://picsum.photos/seed/a3/100/100', playCount: 156 },
    { name: 'Phoebe Bridgers', imageUrl: 'https://picsum.photos/seed/a4/100/100', playCount: 134 },
    { name: 'Big Thief', imageUrl: 'https://picsum.photos/seed/a5/100/100', playCount: 98 },
    { name: 'Sufjan Stevens', imageUrl: 'https://picsum.photos/seed/a6/100/100', playCount: 87 },
    { name: 'Fleet Foxes', imageUrl: 'https://picsum.photos/seed/a7/100/100', playCount: 76 },
    { name: 'The National', imageUrl: 'https://picsum.photos/seed/a8/100/100', playCount: 71 },
  ],
  recentTracks: [
    { title: 'Weird Fishes/Arpeggi', artist: 'Radiohead', albumArtUrl: 'https://picsum.photos/seed/t1/100/100', timestamp: 'Now' },
    { title: 'Skinny Love', artist: 'Bon Iver', albumArtUrl: 'https://picsum.photos/seed/t2/100/100', timestamp: '23m ago' },
    { title: 'Be Sweet', artist: 'Japanese Breakfast', albumArtUrl: 'https://picsum.photos/seed/t3/100/100', timestamp: '27m ago' },
    { title: 'Kyoto', artist: 'Phoebe Bridgers', albumArtUrl: 'https://picsum.photos/seed/t4/100/100', timestamp: '31m ago' },
    { title: 'Not', artist: 'Big Thief', albumArtUrl: 'https://picsum.photos/seed/t5/100/100', timestamp: '35m ago' },
    { title: 'Mystery of Love', artist: 'Sufjan Stevens', albumArtUrl: 'https://picsum.photos/seed/t6/100/100', timestamp: '39m ago' },
    { title: 'White Winter Hymnal', artist: 'Fleet Foxes', albumArtUrl: 'https://picsum.photos/seed/t7/100/100', timestamp: '43m ago' },
    { title: 'Bloodbuzz Ohio', artist: 'The National', albumArtUrl: 'https://picsum.photos/seed/t8/100/100', timestamp: '48m ago' },
  ],
}

const maxPlays = Math.max(...mockData.topArtists.map(a => a.playCount))

export const MusicPage: Component = () => {
  return (
    <div class="min-h-screen p-4 md:p-8">
      <div class="max-w-2xl mx-auto space-y-4">
        {/* Back button */}
        <A href="/profile" class="inline-block mb-2">
          <IconButton icon="arrow-left" label="Back to profile" variant="ghost" size="sm" />
        </A>

        {/* Now Playing */}
        <Show when={mockData.nowPlaying}>
          <section class="bg-card border border-border rounded-2xl p-4">
            <div class="flex items-center gap-4">
              <div class="relative">
                <img
                  src={mockData.nowPlaying.albumArtUrl}
                  alt={mockData.nowPlaying.album}
                  class="w-16 h-16 rounded-xl object-cover"
                />
                <div class="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                  <Icon name="music-note" class="text-sm text-primary-foreground" weight="fill" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-primary uppercase tracking-wide">Now Playing</p>
                <p class="text-lg font-semibold text-foreground truncate">{mockData.nowPlaying.title}</p>
                <p class="text-muted-foreground truncate">{mockData.nowPlaying.artist}</p>
              </div>
            </div>
          </section>
        </Show>

        {/* Stats */}
        <section class="grid grid-cols-2 gap-4">
          <div class="bg-card border border-border rounded-2xl p-5">
            <p class="text-3xl font-bold text-foreground tabular-nums">{mockData.stats.totalScrobbles.toLocaleString()}</p>
            <p class="text-muted-foreground mt-1">Scrobbles</p>
          </div>
          <div class="bg-card border border-border rounded-2xl p-5">
            <p class="text-3xl font-bold text-foreground tabular-nums">{mockData.stats.hoursThisWeek}</p>
            <p class="text-muted-foreground mt-1">Hours this week</p>
          </div>
        </section>

        {/* Top Artists */}
        <section class="bg-card border border-border rounded-2xl p-5">
          <h2 class="font-semibold text-foreground mb-4">Top Artists</h2>
          <div class="space-y-4">
            <For each={mockData.topArtists}>
              {(artist, index) => (
                <div class="flex items-center gap-3">
                  <span class="w-6 text-muted-foreground tabular-nums">{index() + 1}.</span>
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    class="w-10 h-10 rounded-lg object-cover"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2 mb-1">
                      <span class="font-medium text-foreground truncate">{artist.name}</span>
                      <span class="text-muted-foreground tabular-nums shrink-0">{artist.playCount} plays</span>
                    </div>
                    <div class="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        class="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(artist.playCount / maxPlays) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </section>

        {/* Recent Tracks */}
        <section class="bg-card border border-border rounded-2xl p-5">
          <h2 class="font-semibold text-foreground mb-4">Recent Tracks</h2>
          <div class="space-y-2">
            <For each={mockData.recentTracks}>
              {(track, index) => (
                <div class={cn(
                  'flex items-center gap-3 p-2 -mx-2 rounded-lg',
                  index() === 0 && 'bg-primary/5'
                )}>
                  <img
                    src={track.albumArtUrl}
                    alt={track.title}
                    class="w-10 h-10 rounded-lg object-cover"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-foreground truncate">{track.title}</p>
                    <p class="text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <span class={cn(
                    'tabular-nums shrink-0',
                    index() === 0 ? 'text-primary font-medium' : 'text-muted-foreground'
                  )}>
                    {track.timestamp}
                  </span>
                </div>
              )}
            </For>
          </div>
        </section>
      </div>
    </div>
  )
}

export default MusicPage
