import type { Component } from 'solid-js'
import { MessagesPage as MessagesView } from '@/components/messages'

export const MessagesPage: Component = () => {
  // Mobile: viewport minus footer (4rem) and safe area
  const mobileHeight = 'calc(100dvh - 4rem - env(safe-area-inset-bottom))'

  return (
    <div
      class="bg-background max-w-2xl mx-auto md:!h-screen"
      style={{ height: mobileHeight }}
    >
      <MessagesView />
    </div>
  )
}

export default MessagesPage
