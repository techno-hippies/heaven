/**
 * Claim Page - Landing page for shadow profile claim links
 *
 * URL: /c/:token
 *
 * Flow:
 * 1. Show the shadow profile that received a like
 * 2. User proves they own the original dateme profile:
 *    - Bio-edit: Add code to dateme bio, we re-scrape
 *    - OR enter DM token
 * 3. User creates passkey (WebAuthn)
 * 4. Backend adds passkey to PKP, marks as 'handoff'
 * 5. User can optionally remove admin auth to fully own PKP
 */

import { createSignal, createEffect, Show, type Component } from 'solid-js'
import { useParams } from '@solidjs/router'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Spinner } from '@/ui/spinner'
import { ProfileCard } from '@/components/profile-card'
import { mintPKPForClaim } from '@/lib/lit'
import { useNavigate } from '@solidjs/router'

const IS_DEV = import.meta.env.DEV

/** Map source codes to display names */
const SOURCE_NAMES: Record<string, string> = {
  dateme: 'DateMe Directory',
  'dateme.directory': 'DateMe Directory',
  cuties: 'Cuties',
  'cuties.app': 'Cuties',
  acx: 'ACX Dating Post',
}

function getSourceName(source: string): string {
  return SOURCE_NAMES[source] || source
}
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787'

/** Shadow profile data from claim token lookup */
export interface ClaimProfile {
  id: string
  displayName: string
  avatarUrl: string
  source: string
  sourceUrl?: string
  age?: string
  gender?: string
  location?: string
  bio?: string
  likesReceived: number
  verificationCode: string
}

/** Claim page state */
type ClaimState =
  | 'loading'
  | 'profile'        // Show profile, choose verification method
  | 'bio-edit'       // Waiting for bio edit verification
  | 'checking'       // Re-scraping to verify
  | 'passkey'        // Ready to create passkey
  | 'minting'        // Creating PKP (takes ~3-5 seconds)
  | 'success'        // Claimed!
  | 'error'

export interface ClaimPageProps {
  /** For storybook: override token lookup */
  mockProfile?: ClaimProfile
  /** For storybook: override initial state */
  initialState?: ClaimState
}

/** Inner component with props for Storybook */
export const ClaimPageInner: Component<ClaimPageProps> = (props) => {
  const params = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [state, setState] = createSignal<ClaimState>(props.initialState ?? 'loading')
  const [profile, setProfile] = createSignal<ClaimProfile | null>(props.mockProfile ?? null)
  const [error, setError] = createSignal<string | null>(null)
  const [dmToken, setDmToken] = createSignal('')
  const [claimId, setClaimId] = createSignal<string | null>(null)
  const [verificationCode, setVerificationCode] = createSignal<string | null>(null)

  // Load profile from token on mount (skip for storybook mocks)
  createEffect(() => {
    // Skip API call if mockProfile is provided (storybook)
    if (props.mockProfile) {
      return
    }

    const token = params.token
    if (token && state() === 'loading') {
      loadClaimProfile(token)
    }
  })

  async function loadClaimProfile(token: string) {
    try {
      if (IS_DEV) console.log('[Claim] Looking up token:', token)

      const url = `${API_BASE}/api/claim/${token}`
      if (IS_DEV) console.log('[Claim] Fetching:', url)

      const res = await fetch(url)
      if (IS_DEV) console.log('[Claim] Response status:', res.status)

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Invalid link' }))
        throw new Error(data.error || 'Invalid or expired link')
      }

      const data = await res.json()
      if (IS_DEV) console.log('[Claim] Data received:', data)

      if (IS_DEV) console.log('[Claim] Setting profile and state...')
      setProfile({
        id: data.id,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        source: data.source,
        sourceUrl: data.sourceUrl,
        age: data.age,
        gender: data.gender,
        location: data.location,
        bio: data.bio,
        likesReceived: data.likesReceived,
        verificationCode: '', // Will be set when user starts claim
      })

      setState('profile')
      if (IS_DEV) console.log('[Claim] State set to profile, current state:', state())
    } catch (err) {
      console.error('[Claim] Failed to load profile:', err)
      setError(err instanceof Error ? err.message : 'Invalid or expired link')
      setState('error')
    }
  }

  async function handleBioEditStart() {
    const p = profile()
    if (!p) return

    try {
      const res = await fetch(`${API_BASE}/api/claim/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shadowProfileId: p.id,
          method: 'bio_edit',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to start' }))
        throw new Error(data.error || 'Failed to start verification')
      }

      const data = await res.json()
      setClaimId(data.claimId)
      setVerificationCode(data.verificationCode)
      setState('bio-edit')
    } catch (err) {
      console.error('[Claim] Failed to start:', err)
      setError(err instanceof Error ? err.message : 'Failed to start verification')
    }
  }

  async function handleCheckBio() {
    const id = claimId()
    if (!id) return

    setState('checking')

    try {
      if (IS_DEV) console.log('[Claim] Checking bio for claim:', id)

      const res = await fetch(`${API_BASE}/api/claim/verify-bio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: id }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Verification failed' }))
        throw new Error(data.error || 'Could not verify bio')
      }

      const data = await res.json()
      if (data.verified) {
        setState('passkey')
      } else {
        setError('Code not found in bio. Please add it and try again.')
        setState('bio-edit')
      }
    } catch (err) {
      console.error('[Claim] Bio verification failed:', err)
      setError(err instanceof Error ? err.message : 'Could not verify bio')
      setState('bio-edit')
    }
  }

  async function handleDmTokenSubmit() {
    const p = profile()
    if (!dmToken().trim() || !p) return

    setState('checking')

    try {
      if (IS_DEV) console.log('[Claim] Verifying DM token:', dmToken())

      const res = await fetch(`${API_BASE}/api/claim/verify-dm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shadowProfileId: p.id,
          code: dmToken(),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Invalid code' }))
        throw new Error(data.error || 'Invalid code')
      }

      const data = await res.json()
      if (data.verified) {
        setClaimId(data.claimId)
        setState('passkey')
      } else {
        setError('Invalid code')
        setState('profile')
      }
    } catch (err) {
      console.error('[Claim] Token verification failed:', err)
      setError(err instanceof Error ? err.message : 'Invalid token')
      setState('profile')
    }
  }

  async function handleCreatePasskey() {
    const id = claimId()
    if (!id) return

    try {
      if (IS_DEV) console.log('[Claim] Creating passkey via WebAuthn...')

      // Show minting state - this takes 3-5 seconds
      setState('minting')

      // Register passkey and mint PKP (simplified - no session needed)
      // This creates a new PKP owned by the user's passkey
      const pkpInfo = await mintPKPForClaim()

      if (IS_DEV) console.log('[Claim] PKP created:', pkpInfo.ethAddress)

      // Complete the claim - links shadow profile to new PKP address
      const res = await fetch(`${API_BASE}/api/claim/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId: id,
          address: pkpInfo.ethAddress,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to complete claim' }))
        throw new Error(data.error || 'Failed to complete claim')
      }

      if (IS_DEV) console.log('[Claim] Profile claimed successfully!')

      // Show success then redirect to onboarding
      // Skip session auth here - user will authenticate when they start onboarding
      setState('success')
      setTimeout(() => {
        navigate('/onboarding')
      }, 2000)
    } catch (err) {
      console.error('[Claim] Passkey creation failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to create passkey')
      setState('passkey') // Go back to passkey state so they can retry
    }
  }

  return (
    <>
      {/* Loading state */}
      <Show when={state() === 'loading'}>
        <div class="min-h-screen bg-background flex items-center justify-center">
          <div class="text-center">
            <Spinner size="lg" class="mx-auto mb-4" />
            <p class="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </Show>

      {/* Error state */}
      <Show when={state() === 'error'}>
        <div class="min-h-screen bg-background flex items-center justify-center p-6">
          <div class="text-center max-w-md">
            <h1 class="text-2xl font-bold text-foreground mb-2">Link expired</h1>
            <p class="text-muted-foreground mb-4">{error() || 'This claim link is no longer valid.'}</p>
            <Button variant="secondary" onClick={() => window.location.href = '/'}>
              Go to Heaven
            </Button>
          </div>
        </div>
      </Show>

      {/* Minting PKP state */}
      <Show when={state() === 'minting'}>
        <div class="min-h-screen bg-background flex items-center justify-center p-6">
          <div class="text-center max-w-md">
            <Spinner size="lg" class="mx-auto mb-4" />
            <h1 class="text-xl font-semibold text-foreground mb-2">Creating your account...</h1>
            <p class="text-muted-foreground">
              This takes a few seconds. Please don't close this page.
            </p>
          </div>
        </div>
      </Show>

      {/* Success state */}
      <Show when={state() === 'success'}>
        {(() => {
          const p = profile()
          return (
            <div class="min-h-screen bg-background flex items-center justify-center p-6">
              <div class="text-center max-w-md">
                <div class="text-6xl mb-4">&#127881;</div>
                <h1 class="text-3xl font-bold text-foreground mb-2">Welcome to Heaven!</h1>
                <p class="text-muted-foreground mb-6">
                  Your profile is now yours.
                  {(p?.likesReceived ?? 0) > 0 && (
                    <> You have {p?.likesReceived} {p?.likesReceived === 1 ? 'like' : 'likes'} waiting.</>
                  )}
                </p>
                <Button onClick={() => navigate('/onboarding')}>
                  Complete your profile
                </Button>
                <p class="text-xs text-muted-foreground mt-4">
                  Redirecting to onboarding...
                </p>
              </div>
            </div>
          )
        })()}
      </Show>

      {/* Main profile view */}
      <Show when={!['loading', 'error', 'success', 'minting'].includes(state()) ? profile() : null}>
        {(p) => (
          <div class="min-h-screen bg-background p-4 md:p-8">
            <div class="max-w-lg mx-auto space-y-6">
              {/* Header */}
              <div class="text-center">
                <Show
                  when={p().likesReceived > 0}
                  fallback={<h1 class="text-2xl font-bold text-foreground">Claim your profile</h1>}
                >
                  <h1 class="text-2xl font-bold text-foreground">
                    {p().likesReceived === 1 ? 'Someone likes you!' : `${p().likesReceived} people like you!`}
                  </h1>
                </Show>
                <p class="text-muted-foreground mt-1">
                  Claim this profile to see who and start matching.
                </p>
              </div>

              {/* Profile preview */}
              <ProfileCard
                name={p().displayName}
                avatarUrl={p().avatarUrl}
                age={p().age}
                gender={p().gender}
                location={p().location}
              />

              {/* Verification section */}
              <Show when={state() === 'profile'}>
                <div class="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <h2 class="font-semibold text-foreground">Verify it's you</h2>
                  <p class="text-sm text-muted-foreground">
                    To claim this profile, prove you own the original {getSourceName(p().source)} account.
                  </p>

                  {/* Bio edit option */}
                  <div class="space-y-2">
                    <Button variant="default" class="w-full" onClick={handleBioEditStart}>
                      Add code to my {getSourceName(p().source)} bio
                    </Button>
                    <p class="text-xs text-muted-foreground text-center">
                      We'll check for the code automatically
                    </p>
                  </div>

                  <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                      <span class="w-full border-t border-border" />
                    </div>
                    <div class="relative flex justify-center text-xs uppercase">
                      <span class="bg-card px-2 text-muted-foreground">or</span>
                    </div>
                  </div>

                  {/* DM token option */}
                  <div class="space-y-2">
                    <Input
                      placeholder="Enter token from DM"
                      value={dmToken()}
                      onInput={(e) => setDmToken(e.currentTarget.value)}
                    />
                    <Button
                      variant="secondary"
                      class="w-full"
                      onClick={handleDmTokenSubmit}
                      disabled={!dmToken().trim()}
                    >
                      Verify with token
                    </Button>
                  </div>
                </div>
              </Show>

              {/* Bio edit instructions */}
              <Show when={state() === 'bio-edit'}>
                <div class="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <h2 class="font-semibold text-foreground">Add this code to your bio</h2>
                  <div class="bg-secondary rounded-xl p-4 text-center">
                    <code class="text-2xl font-mono font-bold text-primary tracking-wider">
                      {verificationCode() || p().verificationCode}
                    </code>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    Add this code anywhere in your {getSourceName(p().source)} bio, then click verify.
                    You can remove it after claiming.
                  </p>
                  <Show when={p().sourceUrl}>
                    <a
                      href={p().sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-sm text-primary hover:underline block text-center"
                    >
                      Open your {getSourceName(p().source)} profile
                    </a>
                  </Show>
                  <div class="flex gap-3">
                    <Button variant="secondary" class="flex-1" onClick={() => setState('profile')}>
                      Back
                    </Button>
                    <Button variant="default" class="flex-1" onClick={handleCheckBio}>
                      Verify
                    </Button>
                  </div>
                </div>
              </Show>

              {/* Checking state */}
              <Show when={state() === 'checking'}>
                <div class="bg-card border border-border rounded-2xl p-6 text-center">
                  <Spinner size="lg" class="mx-auto mb-4" />
                  <p class="text-muted-foreground">Verifying...</p>
                </div>
              </Show>

              {/* Passkey creation */}
              <Show when={state() === 'passkey'}>
                <div class="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <h2 class="font-semibold text-foreground">Create your passkey</h2>
                  <p class="text-sm text-muted-foreground">
                    A passkey lets you sign in securely using Face ID, fingerprint, or your device PIN.
                    No password needed.
                  </p>
                  <Button variant="default" class="w-full" onClick={handleCreatePasskey}>
                    Create passkey
                  </Button>
                </div>
              </Show>

              {/* Error display */}
              <Show when={error() && state() !== 'error'}>
                <p class="text-sm text-destructive text-center">{error()}</p>
              </Show>
            </div>
          </div>
        )}
      </Show>
    </>
  )
}

/** Route wrapper - no props needed */
export const ClaimPage: Component = () => {
  return <ClaimPageInner />
}

export default ClaimPage
