import type { Component } from 'solid-js'
import { A, useLocation } from '@solidjs/router'
import { Button } from '@/ui/button'
import { Icon } from '@/icons'
import { Avatar } from '@/ui/avatar'
import { asset } from '@/lib/utils'

interface DesktopSidebarProps {
  isConnected?: boolean
  username?: string
  avatarUrl?: string
  onConnect?: () => void
}

type NavItem = {
  path: string
  label: string
  icon: 'house' | 'chat-circle' | 'sparkle' | 'storefront' | 'user'
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home', icon: 'house' },
  { path: '/messages', label: 'Messages', icon: 'chat-circle' },
  { path: '/survey', label: 'Survey', icon: 'sparkle' },
  { path: '/store', label: 'Store', icon: 'storefront' },
  { path: '/profile', label: 'Profile', icon: 'user' },
]

export const DesktopSidebar: Component<DesktopSidebarProps> = (props) => {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === ''
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div class="max-md:hidden fixed left-0 top-0 h-full w-72 bg-sidebar border-r border-sidebar-border z-50">
      <div class="flex flex-col h-full">
        {/* Logo */}
        <div class="p-6 px-8">
          <A href="/" class="text-foreground font-bold text-2xl flex items-center gap-3 hover:opacity-80 transition-opacity font-title">
            <img src={asset('/images/neodate-logo-300x300.png')} alt="" class="w-8 h-8" />
            neodate
          </A>
        </div>

        {/* Navigation */}
        <nav class="flex-1 px-4 pt-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <A
              href={item.path}
              class={`flex items-center w-full gap-4 px-5 py-4 h-auto text-lg rounded-2xl transition-colors ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon
                name={item.icon}
                class="text-2xl flex-shrink-0"
                weight={isActive(item.path) ? 'fill' : 'regular'}
              />
              <span>{item.label}</span>
            </A>
          ))}
        </nav>

        {/* User section */}
        <div class="px-4 py-6">
          {props.isConnected ? (
            <A
              href="/profile"
              class="flex items-center w-full gap-3 px-4 py-3 h-auto rounded-2xl hover:bg-muted/50 transition-colors"
            >
              <Avatar
                size="md"
                src={props.avatarUrl}
                fallback={props.username || 'U'}
              />
              <span class="text-foreground font-medium truncate">
                {props.username || 'Connected'}
              </span>
            </A>
          ) : (
            <Button
              onClick={() => props.onConnect?.()}
              variant="default"
              class="w-full py-4 h-auto text-base"
            >
              Connect
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
