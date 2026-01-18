import type { Component } from 'solid-js'
import { MessagesView } from '@/features/messages'

export const MessagesPage: Component = () => {
  return (
    <div
      class="bg-background max-w-2xl mx-auto md:!h-screen"
      style={{ height: '100dvh' }}
    >
      <MessagesView />
    </div>
  )
}

export default MessagesPage
