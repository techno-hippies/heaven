import { Show, type Component } from 'solid-js'
import { Button } from '@/components/ui/button'
import { ProfilePage as ProfilePageComponent } from '@/components/profile/ProfilePage'
import { useAuth } from '@/contexts/AuthContext'

export const ProfilePage: Component = () => {
  const auth = useAuth()

  // Mock profile data for demo - TODO: fetch from API based on auth.pkpAddress()
  const mockProfile = () => ({
    id: auth.pkpAddress() || '',
    name: 'Demo User',
    username: `${auth.pkpAddress()?.slice(0, 6)}...${auth.pkpAddress()?.slice(-4)}.neodate`,
    photos: ['/images/neodate-logo-300x300.png'],
    bio: 'Welcome to Neodate! This is your profile page. Edit your profile to get started.',
    ageBucket: 2 as const, // 25-29
    genderIdentity: 1 as const, // man
    lookingFor: 3 as const, // relationship
  })

  return (
    <Show
      when={auth.isAuthenticated()}
      fallback={
        <div class="min-h-screen bg-background flex flex-col items-center justify-center px-6">
          <img
            src="/images/neodate-logo-300x300.png"
            alt="Neodate"
            class="w-24 h-24 mb-4"
          />
          <h1 class="text-4xl font-bold text-foreground">Neodate</h1>
          <p class="text-lg text-muted-foreground mt-2 mb-10">
            Blind dates from anonymous browsing.
          </p>
          <Button variant="default" size="xl" onClick={() => auth.openAuthDialog()}>
            Connect
          </Button>
        </div>
      }
    >
      <ProfilePageComponent
        profile={mockProfile()}
        isOwnProfile={true}
        onEdit={() => console.log('Edit profile')}
      />
    </Show>
  )
}

export default ProfilePage
