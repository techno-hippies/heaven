import type { Component } from 'solid-js'
import { Icon } from '@/components/icons'

export const StorePage: Component = () => {
  return (
    <div class="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <Icon name="storefront" class="text-6xl text-muted-foreground mb-4" />
      <h1 class="text-2xl font-bold text-foreground">Store</h1>
      <p class="text-muted-foreground mt-2 text-center max-w-sm">
        Coming soon. Premium features and boosts will be available here.
      </p>
    </div>
  )
}

export default StorePage
