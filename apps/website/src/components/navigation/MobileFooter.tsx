import type { Component } from 'solid-js'
import { A, useLocation } from '@solidjs/router'
import { Icon } from '@/icons'
import { haptic } from '@/lib/utils'

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

export const MobileFooter: Component = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === ''
    }
    return location.pathname.startsWith(path)
  }

  const handleClick = () => {
    haptic.light()
  }

  return (
    <div
      class="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50"
      style={{ 'padding-bottom': 'env(safe-area-inset-bottom)' }}
    >
      <div class="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => (
          <A
            href={item.path}
            onClick={handleClick}
            class={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive(item.path)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label={item.label}
          >
            <Icon
              name={item.icon}
              class="text-2xl"
              weight={isActive(item.path) ? 'fill' : 'regular'}
            />
            <span class="text-xs mt-1">{item.label}</span>
          </A>
        ))}
      </div>
    </div>
  )
}
