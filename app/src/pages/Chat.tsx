/**
 * Chat Page - Legacy standalone page
 * @deprecated Use /messages route instead with AppLayout
 */

import type { Component } from 'solid-js'
import { MessagesPage } from '@/components/messages/MessagesPage'
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar'
import { MobileFooter } from '@/components/navigation/MobileFooter'

export const Chat: Component = () => {
  return (
    <div class="min-h-screen bg-background">
      <DesktopSidebar
        isConnected={true}
        username="@neo.eth"
        avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=neo"
      />

      {/* Main content area - offset by sidebar */}
      <div class="md:pl-72 h-screen">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 h-full">
          <MessagesPage class="h-full" />
        </div>
      </div>

      <MobileFooter />
    </div>
  )
}

export default Chat
