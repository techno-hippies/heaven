import { Component, For, Show, createSignal } from 'solid-js'
import { NowPlaying as NowPlayingCard } from '@/features/scrobble/components/now-playing'
import { StatCard } from '@/features/scrobble/components/stat-card'
import { ScrobbleItem } from '@/features/scrobble/components/scrobble-item'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/ui/button'
import { Spinner } from '@/ui/spinner'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/ui/drawer'
import { useNowPlaying, useScrobbleQueue } from '@/features/scrobble/hooks'
import { useVpnConnection } from '@/features/vpn/hooks'
import { useAuth } from '@/app/providers/AuthContext'
import { createSigner } from '@/lib/lit'
import { formatRelativeTime } from '@/lib/utils'

export const Dashboard: Component = () => {
  // Auth context for Lit Protocol signing
  const { pkpInfo, authData, pkpAddress, logout } = useAuth()

  // Settings drawer state
  const [settingsOpen, setSettingsOpen] = createSignal(false)

  // VPN state from Tauri backend
  const { state: vpnState, isConnected, isConfigured, toggle: toggleVpn, setupDevice } = useVpnConnection()
  const vpnLoading = () => vpnState() === 'activating' || vpnState() === 'deactivating' || vpnState() === 'authenticating'

  // VPN toggle that sets up device if needed
  const handleVpnToggle = async () => {
    // If already configured, just toggle
    if (isConfigured()) {
      await toggleVpn()
      return
    }

    // Need to set up device - requires auth
    const pkp = pkpInfo()
    const auth = authData()
    const address = pkpAddress()

    console.log('[VPN] Setup check - pkp:', !!pkp, 'auth:', !!auth, 'address:', address)
    console.log('[VPN] pkpInfo:', pkp)
    console.log('[VPN] authData:', auth)

    if (!pkp || !auth || !address) {
      console.error('[VPN] Cannot setup: not authenticated - missing:', {
        hasPkp: !!pkp,
        hasAuth: !!auth,
        hasAddress: !!address,
      })
      return
    }

    // Create signer and setup device
    const signer = createSigner(pkp, auth)
    await setupDevice(address, signer)
  }

  // Real data from Tauri backend
  const { nowPlaying } = useNowPlaying()
  const {
    recentScrobbles,
    syncState,
    syncError,
    todayCount,
    pendingCount,
    lastSync,
    sync,
    isLoading,
  } = useScrobbleQueue()

  // Sync handler that passes auth context
  const handleSync = () => sync(pkpInfo(), authData())

  const showSyncButton = () =>
    pendingCount() > 0 && (syncState() === 'idle' || syncState() === 'error')

  const syncStatusText = () => {
    if (syncState() === 'syncing') return 'Syncing…'
    if (syncState() === 'error') return (
      <>
        <span class="text-destructive">Failed</span>
        {syncError() && <span class="text-muted-foreground"> · {syncError()}</span>}
      </>
    )
    if (pendingCount() === 0 && lastSync()) {
      return `Synced ${formatRelativeTime(Math.floor(new Date(lastSync()!).getTime() / 1000))}`
    }
    if (lastSync()) {
      return `Last sync: ${formatRelativeTime(Math.floor(new Date(lastSync()!).getTime() / 1000))}`
    }
    return 'Not synced yet'
  }

  return (
    <div class="min-h-screen bg-background">
      {/* Header */}
      <AppHeader
        vpnOn={isConnected()}
        vpnLoading={vpnLoading()}
        onVpnChange={handleVpnToggle}
        onSettings={() => setSettingsOpen(true)}
      />

      {/* Settings Drawer */}
      <Drawer open={settingsOpen()} onOpenChange={setSettingsOpen}>
        <DrawerContent>
          <DrawerHeader class="mt-4">
            <DrawerTitle>Settings</DrawerTitle>
          </DrawerHeader>

          <div class="py-6 space-y-6">
            {/* PKP Address */}
            <Show when={pkpAddress()}>
              <div>
                <p class="text-sm text-muted-foreground mb-1">PKP Address</p>
                <p class="font-mono text-sm break-all">{pkpAddress()}</p>
              </div>
            </Show>

            {/* Logout Button */}
            <Button
              variant="destructive"
              class="w-full"
              onClick={() => {
                logout()
                setSettingsOpen(false)
              }}
            >
              Log Out
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Content */}
      <div class="px-4 pb-4 md:px-8 md:pb-8">
        <div class="max-w-2xl mx-auto space-y-4">
          {/* Now Playing */}
          <Show when={nowPlaying()}>
            {(np) => (
              <NowPlayingCard
                title={np().title}
                artist={np().artist}
                albumArtUrl={np().albumArtUrl ?? undefined}
                isPlaying={np().isPlaying}
              />
            )}
          </Show>

          {/* Stats */}
          <section class="grid grid-cols-2 gap-4">
            <StatCard
              value={isLoading() ? '—' : todayCount()}
              label="Today"
            />
            <StatCard
              value={isLoading() ? '—' : pendingCount()}
              label="Pending"
            />
          </section>

          {/* Sync status line */}
          <div class="flex items-center justify-between h-9">
            <p class="text-muted-foreground text-sm">
              {syncStatusText()}
            </p>
            <Show when={syncState() === 'syncing'}>
              <Spinner size="sm" />
            </Show>
            <Show when={showSyncButton()}>
              <Button onClick={handleSync}>
                {syncState() === 'error' ? 'Retry' : 'Sync'}
              </Button>
            </Show>
          </div>

          {/* Recent Tracks */}
            <section class="bg-card border border-border rounded-2xl p-5">
              <h2 class="font-semibold text-foreground mb-4">Recent</h2>
            <Show
              when={!isLoading()}
              fallback={
                <div class="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              }
            >
              <Show
                when={recentScrobbles().length > 0}
                fallback={
                  <p class="text-muted-foreground text-center py-8">
                    No scrobbles yet. Play some music!
                  </p>
                }
              >
                <div class="space-y-2">
                  <For each={recentScrobbles()}>
                      {(scrobble) => {
                        const isNowPlaying = () => {
                          const np = nowPlaying()
                          return np?.title === scrobble.title && np?.artist === scrobble.artist
                        }
                        const artUrl = () => {
                          // Prefer stored art URL, fallback to now-playing if it matches
                          if (scrobble.artUrl) return scrobble.artUrl
                          const np = nowPlaying()
                          return isNowPlaying() ? np?.albumArtUrl ?? undefined : undefined
                        }
                        return (
                          <ScrobbleItem
                            title={scrobble.title}
                            artist={scrobble.artist}
                            albumArtUrl={artUrl()}
                            playedAt={scrobble.playedAt}
                            isNowPlaying={isNowPlaying()}
                            pending={!scrobble.synced}
                          />
                      )
                    }}
                  </For>
                </div>
              </Show>
            </Show>
          </section>
        </div>
      </div>
    </div>
  )
}
