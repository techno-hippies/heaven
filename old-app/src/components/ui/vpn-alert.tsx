/**
 * VPN Alert Component
 * Non-dismissible banner alerting users when DNS VPN is not connected.
 * Shows download options for supported platforms.
 *
 * Uses Dialog (modal) on desktop, Drawer (sheet) on mobile.
 */

import { createSignal, Show, For, onMount, onCleanup, type Component, type JSX } from 'solid-js'
import { Icon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type Platform = 'android' | 'linux' | 'ios' | 'macos' | 'windows'

interface PlatformOption {
  id: Platform
  name: string
  available: boolean
  description: string
}

const PLATFORMS: PlatformOption[] = [
  {
    id: 'android',
    name: 'Android',
    available: true,
    description: 'Download from Play Store',
  },
  {
    id: 'linux',
    name: 'Linux',
    available: true,
    description: 'Download desktop app',
  },
  {
    id: 'ios',
    name: 'iOS',
    available: false,
    description: 'Coming soon',
  },
  {
    id: 'macos',
    name: 'macOS',
    available: false,
    description: 'Coming soon',
  },
  {
    id: 'windows',
    name: 'Windows',
    available: false,
    description: 'Coming soon',
  },
]

export interface VpnAlertProps {
  /** Custom class name */
  class?: string
  /** Called when user selects a platform to download */
  onDownload?: (platform: Platform) => void
}

/** Shared platform list content */
const PlatformList: Component<{
  onSelect: (platform: PlatformOption) => void
}> = (props) => (
  <div class="space-y-2">
    <For each={PLATFORMS}>
      {(platform) => (
        <button
          type="button"
          onClick={() => props.onSelect(platform)}
          disabled={!platform.available}
          class={cn(
            'w-full flex items-center gap-4 p-4 rounded-xl text-left transition-colors',
            platform.available
              ? 'bg-secondary hover:bg-secondary/80 cursor-pointer'
              : 'bg-secondary/30 opacity-50 cursor-not-allowed'
          )}
        >
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-medium text-foreground">
                {platform.name}
              </span>
              <Show when={!platform.available}>
                <span class="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Soon
                </span>
              </Show>
            </div>
            <p class="text-sm text-muted-foreground mt-0.5">
              {platform.description}
            </p>
          </div>
          <Show when={platform.available}>
            <Icon
              name="caret-right"
              weight="bold"
              class="w-5 h-5 text-muted-foreground"
            />
          </Show>
        </button>
      )}
    </For>
  </div>
)

export const VpnAlert: Component<VpnAlertProps> = (props) => {
  const [open, setOpen] = createSignal(false)
  const [isDesktop, setIsDesktop] = createSignal(false)

  // Check if we're on desktop (lg breakpoint = 1024px)
  onMount(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mediaQuery.addEventListener('change', handler)
    onCleanup(() => mediaQuery.removeEventListener('change', handler))
  })

  const handlePlatformClick = (platform: PlatformOption) => {
    if (!platform.available) return
    props.onDownload?.(platform.id)
    setOpen(false)
    // TODO: Actual download logic - open store link or download URL
    console.log(`Download VPN for ${platform.name}`)
  }

  // Alert box (shared between both modes)
  const AlertBox = (triggerProps: { children: JSX.Element }) => (
    <div
      class={cn(
        'flex items-center gap-3 px-4 py-3',
        'bg-secondary border border-border rounded-xl',
        props.class
      )}
    >
      <Icon
        name="wifi-slash"
        weight="fill"
        class="w-5 h-5 text-muted-foreground flex-shrink-0"
      />
      <p class="flex-1 text-sm text-foreground">
        Connect DNS VPN to generate matches
      </p>
      {triggerProps.children}
    </div>
  )

  return (
    <Show
      when={isDesktop()}
      fallback={
        // Mobile: Drawer (bottom sheet)
        <Drawer open={open()} onOpenChange={setOpen}>
          <AlertBox>
            <DrawerTrigger>
              <Button variant="default" size="sm" class="flex-shrink-0">
                Download
              </Button>
            </DrawerTrigger>
          </AlertBox>

          <DrawerContent>
            <DrawerHeader class="pb-4">
              <DrawerTitle>Download DNS VPN</DrawerTitle>
              <DrawerDescription>
                The VPN routes your DNS traffic through Neodate to enable
                behavioral matching based on browsing patterns.
              </DrawerDescription>
            </DrawerHeader>
            <div class="pb-6">
              <PlatformList onSelect={handlePlatformClick} />
            </div>
          </DrawerContent>
        </Drawer>
      }
    >
      {/* Desktop: Dialog (modal) */}
      <Dialog open={open()} onOpenChange={setOpen}>
        <AlertBox>
          <DialogTrigger>
            <Button variant="default" size="sm" class="flex-shrink-0">
              Download
            </Button>
          </DialogTrigger>
        </AlertBox>

        <DialogContent>
          <DialogHeader class="pb-4">
            <DialogTitle>Download DNS VPN</DialogTitle>
            <DialogDescription>
              The VPN routes your DNS traffic through Neodate to enable
              behavioral matching based on browsing patterns.
            </DialogDescription>
          </DialogHeader>
          <PlatformList onSelect={handlePlatformClick} />
        </DialogContent>
      </Dialog>
    </Show>
  )
}
