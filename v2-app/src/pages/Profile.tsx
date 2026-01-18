import type { Component } from 'solid-js'

export const ProfilePage: Component = () => {
  return (
    <div class="flex items-center justify-center min-h-screen p-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-4">Profile</h1>
        <p class="text-muted-foreground">Your dating profile</p>
      </div>
    </div>
  )
}

export default ProfilePage
