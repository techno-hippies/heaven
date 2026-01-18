import type { Component } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { ProfileCard } from '@/components/profile-card'

// Mock data for testing
const mockProfile = {
  name: 'sakura',
  tld: 'heaven',
  avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=sakura',
  age: '27',
  gender: '2',
  location: 'Tokyo',
  lookingFor: '2',
  relationshipStatus: '1',
  relationshipStyle: '1',
  kids: '1',
  religion: 'spiritual',
  interestedIn: ['1'],
  music: {
    totalScrobbles: 12847,
    hoursThisWeek: 23,
    topArtists: [
      { name: 'Radiohead', playCount: 247 },
      { name: 'Bon Iver', playCount: 182 },
      { name: 'Japanese Breakfast', playCount: 156 },
    ],
  },
}

export const ProfilePage: Component = () => {
  const navigate = useNavigate()

  return (
    <div class="min-h-screen p-4 md:p-8">
      <div class="mx-auto max-w-2xl">
        <ProfileCard
          {...mockProfile}
          onMusicClick={() => navigate('/music')}
        />
      </div>
    </div>
  )
}

export default ProfilePage
