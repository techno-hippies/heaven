import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { Avatar } from '@/ui/avatar'
import { MusicTeaser, type MusicTeaserArtist } from '@/features/music/components/MusicTeaser'

export interface MusicData {
  topArtists?: MusicTeaserArtist[]
  totalScrobbles?: number
  hoursThisWeek?: number
}

export interface ProfileCardProps {
  name?: string
  tld?: string
  avatarUrl?: string
  age?: string
  gender?: string
  interestedIn?: string[]
  location?: string
  lookingFor?: string
  relationshipStatus?: string
  relationshipStyle?: string
  kids?: string
  religion?: string
  music?: MusicData
  onMusicClick?: () => void
}

const GENDER_LABELS: Record<string, string> = {
  '1': 'Man',
  '2': 'Woman',
  '3': 'Trans man',
  '4': 'Trans woman',
  '5': 'Non-binary',
}

const INTERESTED_IN_LABELS: Record<string, string> = {
  '1': 'Men',
  '2': 'Women',
  '3': 'Trans men',
  '4': 'Trans women',
  '5': 'Non-binary',
}

const LOOKING_FOR_LABELS: Record<string, string> = {
  '1': 'Casual',
  '2': 'Relationship',
}

const RELATIONSHIP_STATUS_LABELS: Record<string, string> = {
  '1': 'Single',
  '2': 'Partnered',
  '3': 'Separated',
}

const RELATIONSHIP_STYLE_LABELS: Record<string, string> = {
  '1': 'Monogamous',
  '2': 'Non-monogamous',
}

const KIDS_LABELS: Record<string, string> = {
  '1': 'No children',
  '2': 'Has children',
}

const RELIGION_LABELS: Record<string, string> = {
  'christian': 'Christian',
  'catholic': 'Catholic',
  'jewish': 'Jewish',
  'muslim': 'Muslim',
  'hindu': 'Hindu',
  'buddhist': 'Buddhist',
  'spiritual': 'Spiritual',
  'other': 'Other',
}

export const ProfileCard: Component<ProfileCardProps> = (props) => {
  const domain = () => props.name && props.tld ? `${props.name}.${props.tld}` : undefined

  const genderLabel = () => props.gender ? GENDER_LABELS[props.gender] : undefined
  const interestedInLabel = () => {
    if (!props.interestedIn?.length) return undefined
    return props.interestedIn.map(i => INTERESTED_IN_LABELS[i] || i).join(', ')
  }
  const lookingForLabel = () => props.lookingFor ? LOOKING_FOR_LABELS[props.lookingFor] : undefined
  const relationshipStatusLabel = () => props.relationshipStatus ? RELATIONSHIP_STATUS_LABELS[props.relationshipStatus] : undefined
  const relationshipStyleLabel = () => props.relationshipStyle ? RELATIONSHIP_STYLE_LABELS[props.relationshipStyle] : undefined
  const kidsLabel = () => props.kids ? KIDS_LABELS[props.kids] : undefined
  const religionLabel = () => props.religion ? RELIGION_LABELS[props.religion] : undefined

  const hasInfo = () => props.age || genderLabel() || props.location || relationshipStatusLabel() || lookingForLabel() || relationshipStyleLabel() || interestedInLabel() || kidsLabel() || religionLabel()

  return (
    <div class="space-y-4">
      {/* Header card */}
      <div class="bg-card border border-border rounded-2xl p-6">
        <div class="flex items-center gap-4">
          <Avatar
            src={props.avatarUrl}
            fallback={props.name?.[0]?.toUpperCase() || '?'}
            size="3xl"
          />
          <div>
            <h2 class="text-2xl font-bold text-foreground">
              {props.name || 'Your Name'}
            </h2>
            <Show when={domain()}>
              <p class="text-lg text-muted-foreground">{domain()}</p>
            </Show>
          </div>
        </div>
      </div>

      {/* Info card */}
      <Show when={hasInfo()}>
        <div class="bg-card border border-border rounded-2xl p-6">
          <div class="grid grid-cols-2 gap-x-8 gap-y-4">
            <Show when={props.age}>
              <div>
                <p class="text-muted-foreground">Age</p>
                <p class="text-lg text-foreground">{props.age}</p>
              </div>
            </Show>
            <Show when={genderLabel()}>
              <div>
                <p class="text-muted-foreground">Gender</p>
                <p class="text-lg text-foreground">{genderLabel()}</p>
              </div>
            </Show>
            <Show when={props.location}>
              <div>
                <p class="text-muted-foreground">Location</p>
                <p class="text-lg text-foreground">{props.location}</p>
              </div>
            </Show>
            <Show when={relationshipStatusLabel()}>
              <div>
                <p class="text-muted-foreground">Status</p>
                <p class="text-lg text-foreground">{relationshipStatusLabel()}</p>
              </div>
            </Show>
            <Show when={lookingForLabel()}>
              <div>
                <p class="text-muted-foreground">Looking for</p>
                <p class="text-lg text-foreground">{lookingForLabel()}</p>
              </div>
            </Show>
            <Show when={relationshipStyleLabel()}>
              <div>
                <p class="text-muted-foreground">Style</p>
                <p class="text-lg text-foreground">{relationshipStyleLabel()}</p>
              </div>
            </Show>
            <Show when={interestedInLabel()}>
              <div>
                <p class="text-muted-foreground">Interested in</p>
                <p class="text-lg text-foreground">{interestedInLabel()}</p>
              </div>
            </Show>
            <Show when={kidsLabel()}>
              <div>
                <p class="text-muted-foreground">Kids</p>
                <p class="text-lg text-foreground">{kidsLabel()}</p>
              </div>
            </Show>
            <Show when={religionLabel()}>
              <div>
                <p class="text-muted-foreground">Religion</p>
                <p class="text-lg text-foreground">{religionLabel()}</p>
              </div>
            </Show>
          </div>
        </div>
      </Show>

      {/* Music card */}
      <MusicTeaser
        topArtists={props.music?.topArtists}
        scrobbles={props.music?.totalScrobbles}
        hoursThisWeek={props.music?.hoursThisWeek}
        onClick={props.onMusicClick}
      />
    </div>
  )
}

export default ProfileCard
