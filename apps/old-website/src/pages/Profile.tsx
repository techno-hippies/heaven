import { Show, type Component, createEffect, createMemo, createResource } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import type { Address, Hex } from 'viem'
import { Button } from '@/components/ui/button'
import { ProfilePage as ProfilePageComponent, type ProfilePageData } from '@/components/profile/ProfilePage'
import type { AgeBucket, GenderIdentity, LookingFor } from '@/components/profile/ProfileBadge'
import { useAuth } from '@/contexts/AuthContext'
import { createProfileResource, type ProfileWithAddress, hasSurvey } from '@/lib/contracts'
import { personalitySchema } from '@/lib/survey'
import { asset } from '@/lib/utils'

/**
 * Convert on-chain profile to UI format
 */
function toProfilePageData(
  profile: ProfileWithAddress,
  address: Address
): ProfilePageData {
  return {
    id: address,
    name: `${address.slice(0, 6)}...${address.slice(-4)}`,
    username: `${address.slice(0, 6)}...${address.slice(-4)}.neodate`,
    // Use anime CID if available, otherwise placeholder
    photos: profile.animeCid !== '0x0000000000000000000000000000000000000000000000000000000000000000'
      ? [`https://gateway.pinata.cloud/ipfs/${profile.animeCid.slice(2)}`]
      : [asset('/images/neodate-logo-300x300.png')],
    ageBucket: profile.ageBucket as AgeBucket,
    genderIdentity: profile.genderIdentity as GenderIdentity,
    regionBucket: profile.regionBucket,
    bodyBucket: profile.bodyBucket,
    fitnessBucket: profile.fitnessBucket,
    smoking: profile.smoking,
    drinking: profile.drinking,
    lookingFor: profile.lookingFor as LookingFor,
  }
}

export const ProfilePage: Component = () => {
  const auth = useAuth()
  const navigate = useNavigate()

  const eoaAddress = createMemo(() => auth.eoaAddress() as Address | null)
  const pkpAddress = createMemo(() => auth.pkpAddress() as Address | null)

  const [eoaProfile] = createProfileResource(eoaAddress)
  const [pkpProfile] = createProfileResource(pkpAddress)

  // Check if user has completed the personality survey
  const primaryAddress = createMemo(() => pkpAddress() || eoaAddress())
  const [surveyStatus] = createResource(primaryAddress, async (addr) => {
    if (!addr) return null
    const completed = await hasSurvey(addr, personalitySchema.schemaIdBytes32 as Hex)
    return { completed, schemaId: personalitySchema.id }
  })

  const profileData = createMemo(() => {
    const profile = eoaProfile() ?? pkpProfile()
    if (!profile) return null
    return toProfilePageData(profile, profile.address)
  })

  const isProfileLoading = () => eoaProfile.loading || pkpProfile.loading

  createEffect(() => {
    console.log('[Profile] Addresses:', {
      eoa: eoaAddress(),
      pkp: pkpAddress(),
    })
  })

  createEffect(() => {
    const profile = eoaProfile() ?? pkpProfile()
    console.log('[Profile] Loaded profile:', profile ? {
      address: profile.address,
      regionBucket: profile.regionBucket,
      genderIdentity: profile.genderIdentity,
      lookingFor: profile.lookingFor,
      ageBucket: profile.ageBucket,
    } : null)
  })

  const handleEdit = () => {
    // Navigate to onboarding to edit profile
    navigate('/onboarding')
  }

  const handleTakeSurvey = () => {
    navigate('/survey')
  }

  return (
    <Show
      when={auth.isAuthenticated()}
      fallback={
        <div class="min-h-screen bg-background flex flex-col items-center justify-center px-6">
          <img
            src={asset('/images/neodate-logo-300x300.png')}
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
      {/* Loading state */}
      <Show when={!isProfileLoading()} fallback={
        <div class="min-h-screen bg-background flex flex-col items-center justify-center px-6">
          <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p class="text-muted-foreground mt-4">Loading profile...</p>
        </div>
      }>
        {/* No profile yet - prompt to create */}
        <Show when={profileData()} fallback={
          <div class="min-h-screen bg-background flex flex-col items-center justify-center px-6">
            <img
              src={asset('/images/neodate-logo-300x300.png')}
              alt="Neodate"
              class="w-24 h-24 mb-4"
            />
            <h1 class="text-2xl font-bold text-foreground">No Profile Yet</h1>
            <p class="text-muted-foreground mt-2 mb-6 text-center max-w-sm">
              You haven't created your profile on-chain yet. Complete onboarding to get started.
            </p>
            <Button variant="default" size="xl" onClick={() => navigate('/onboarding')}>
              Create Profile
            </Button>
          </div>
        }>
          {(data) => (
            <ProfilePageComponent
              profile={data()}
              isOwnProfile={true}
              surveyStatus={surveyStatus()}
              onEdit={handleEdit}
              onTakeSurvey={handleTakeSurvey}
            />
          )}
        </Show>
      </Show>
    </Show>
  )
}

export default ProfilePage
