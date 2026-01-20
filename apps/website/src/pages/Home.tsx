/**
 * Home Page - Browse and like candidate profiles
 *
 * V0 implementation:
 * - Fetches 5 curated profiles from /api/candidates
 * - Shows one at a time in CandidateCard
 * - Like/Pass advances to next profile
 * - When out of profiles, shows "no more" state
 */

import { createSignal, createEffect, Show, type Component } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { useAuth } from '@/app/providers/AuthContext'
import { Button } from '@/ui/button'
import { Spinner } from '@/ui/spinner'
import { haptic, asset } from '@/lib/utils'
import {
  CandidateCard,
  fetchCandidates,
  submitLike,
  type CandidateProfile,
} from '@/features/swipe'

const IS_DEV = import.meta.env.DEV

export const HomePage: Component = () => {
  const navigate = useNavigate()
  const auth = useAuth()

  // State
  const [candidates, setCandidates] = createSignal<CandidateProfile[]>([])
  const [currentIndex, setCurrentIndex] = createSignal(0)
  const [isLoading, setIsLoading] = createSignal(false)
  const [isLiking, setIsLiking] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)
  const [matchNotification, setMatchNotification] = createSignal<string | null>(null)

  // Derived state
  const currentCandidate = () => candidates()[currentIndex()]
  const hasMore = () => currentIndex() < candidates().length
  const viewerAddress = () => auth.pkpAddress()

  // Load candidates when authenticated
  createEffect(() => {
    const addr = viewerAddress()
    if (addr && candidates().length === 0 && !isLoading()) {
      loadCandidates(addr)
    }
  })

  async function loadCandidates(address: string) {
    setIsLoading(true)
    setError(null)

    try {
      if (IS_DEV) console.log('[Home] Fetching candidates for:', address)
      const response = await fetchCandidates(address)
      setCandidates(response.candidates)
      if (IS_DEV) console.log('[Home] Loaded', response.candidates.length, 'candidates')
    } catch (err) {
      console.error('[Home] Failed to load candidates:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profiles')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLike() {
    const candidate = currentCandidate()
    const address = viewerAddress()

    if (!candidate || !address) return

    setIsLiking(true)
    haptic.medium()

    try {
      if (IS_DEV) console.log('[Home] Liking:', candidate.displayName, candidate.targetId)

      const response = await submitLike(address, candidate.targetType, candidate.targetId)

      if (response.mutual) {
        // Match! Show notification and navigate to messages
        haptic.heartbeat()
        setMatchNotification(`You matched with ${candidate.displayName}!`)

        // Auto-navigate to messages after delay
        setTimeout(() => {
          setMatchNotification(null)
          navigate('/messages')
        }, 2000)
      } else {
        haptic.double()
      }

      // Move to next candidate
      setCurrentIndex((i) => i + 1)
    } catch (err) {
      console.error('[Home] Failed to like:', err)
      setError(err instanceof Error ? err.message : 'Failed to send like')
    } finally {
      setIsLiking(false)
    }
  }

  function handlePass() {
    haptic.light()
    setCurrentIndex((i) => i + 1)
  }

  function handleSignIn() {
    auth.openAuthDialog()
  }

  function handleGetStarted() {
    navigate('/onboarding')
  }

  // Not authenticated - show welcome
  if (!auth.isAuthenticated()) {
    return (
      <div class="min-h-screen bg-background flex flex-col">
        {/* Hero Section */}
        <div class="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
          <div class="text-center">
            <img
              src={asset('/images/heaven-stacked-logo.png')}
              alt="Heaven"
              class="w-28 h-28 mx-auto mb-5"
            />
            <h1 class="text-4xl font-bold text-foreground font-title">heaven</h1>
            <p class="text-lg text-muted-foreground mt-2">Matches made in heaven.</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div class="px-6 pb-8 space-y-4 max-w-md mx-auto w-full">
          <div class="rounded-2xl border border-border bg-card/80 p-5">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-foreground mb-2">
              Portable Dating Profile
            </h3>
            <p class="text-sm text-muted-foreground leading-relaxed">
              Your profile lives on Ethereum. Use it across web3, other apps, and AI. Unlike most
              dating apps that control and silo your data, you own it and choose how to share it.
            </p>
          </div>

          <div class="rounded-2xl border border-border bg-card/80 p-5">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-foreground mb-2">
              Private by Default
            </h3>
            <p class="text-sm text-muted-foreground leading-relaxed">
              Matches are made using anonymized, non-identifiable data like survey responses, music
              taste, and browsing history. You choose what to share, and only after you match.
            </p>
          </div>

          <div class="rounded-2xl border border-border bg-card/80 p-5">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-foreground mb-2">
              AI Dating Coach
            </h3>
            <p class="text-sm text-muted-foreground leading-relaxed">
              Meet Scarlett, your personal dating coach. She knows your profile and your results.
              Message her anytime, or give her a call when you need advice.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div class="px-6 pb-12">
          <div class="w-full max-w-md mx-auto space-y-3">
            <Button variant="default" size="xl" class="w-full" onClick={handleGetStarted}>
              Get started
            </Button>
            <Button
              variant="ghost"
              size="lg"
              class="w-full text-muted-foreground"
              onClick={handleSignIn}
            >
              I already have an account
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading()) {
    return (
      <div class="min-h-screen bg-background flex items-center justify-center">
        <div class="text-center">
          <Spinner size="lg" class="mx-auto mb-4" />
          <p class="text-base text-muted-foreground">Loading profiles...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error()) {
    return (
      <div class="min-h-screen bg-background flex items-center justify-center">
        <div class="text-center px-6">
          <h2 class="text-2xl font-semibold text-foreground mb-2">Something went wrong</h2>
          <p class="text-base text-destructive mb-4">{error()}</p>
          <Button
            variant="secondary"
            onClick={() => viewerAddress() && loadCandidates(viewerAddress()!)}
          >
            Try again
          </Button>
        </div>
      </div>
    )
  }

  // No more profiles
  if (!hasMore()) {
    return (
      <div class="min-h-screen bg-background flex items-center justify-center">
        <div class="text-center px-6">
          <h2 class="text-2xl font-semibold text-foreground mb-2">No more profiles</h2>
          <p class="text-base text-muted-foreground">
            {candidates().length === 0 ? 'No profiles available yet.' : 'Check back later!'}
          </p>
        </div>
      </div>
    )
  }

  // Show candidate card
  return (
    <>
      {/* Match notification overlay */}
      <Show when={matchNotification()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div class="text-center animate-pulse">
            <div class="text-6xl mb-4">&#129505;</div>
            <h2 class="text-3xl font-bold text-white">{matchNotification()}</h2>
          </div>
        </div>
      </Show>

      <CandidateCard
        candidate={currentCandidate()!}
        onLike={handleLike}
        onPass={handlePass}
        isLoading={isLiking()}
      />
    </>
  )
}

export default HomePage
