import type { Component } from 'solid-js'

export const MessagesPage: Component = () => {
  return (
    <div class="flex items-center justify-center min-h-screen p-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-4">Messages</h1>
        <p class="text-muted-foreground">Chat with your matches</p>
      </div>
    </div>
  )
}

export default MessagesPage
