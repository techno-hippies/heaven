/**
 * App Header - VPN toggle card + settings icon
 */

import { Component } from 'solid-js'
import { Icon } from '@/icons'
import { Toggle } from '@/ui/toggle'
import { Spinner } from '@/ui/spinner'
import { cn } from '@/lib/utils'

export interface AppHeaderProps {
  vpnOn: boolean
  vpnLoading?: boolean
  onVpnChange?: (on: boolean) => void
  onSettings?: () => void
  class?: string
}

export const AppHeader: Component<AppHeaderProps> = (props) => {
  return (
    <header class={cn('flex items-center gap-3 px-4 py-3', props.class)}>
      {/* VPN Toggle Card */}
      <div class="flex-1 flex items-center gap-4 bg-card border border-border rounded-xl px-4 h-14">
        <Toggle
          checked={props.vpnOn}
          onChange={props.onVpnChange}
          disabled={props.vpnLoading}
        />
        <span class="text-base text-foreground flex items-center gap-2">
          Gateway: {props.vpnLoading ? (
            <>
              <Spinner size="sm" />
              <span class="text-muted-foreground">Connecting...</span>
            </>
          ) : props.vpnOn ? (
            <span class="text-green-500">Connected</span>
          ) : (
            'Disconnected'
          )}
        </span>
      </div>

      {/* Settings */}
      <button
        type="button"
        onClick={props.onSettings}
        aria-label="Settings"
        class="flex items-center justify-center bg-card border border-border rounded-xl h-14 w-14 hover:bg-secondary active:scale-95 transition-all"
      >
        <Icon name="gear" class="w-6 h-6 text-foreground" />
      </button>
    </header>
  )
}
