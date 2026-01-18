import type { Component } from 'solid-js'

export const HomePage: Component = () => {
  return (
    <div class="flex items-center justify-center min-h-screen p-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-4">Home</h1>
        <p class="text-muted-foreground">Browse matches here</p>
      </div>
    </div>
  )
}

export default HomePage
