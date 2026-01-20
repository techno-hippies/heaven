import { Show, createEffect, createSignal, type ParentComponent } from 'solid-js'
import { useLocation, useNavigate } from '@solidjs/router'
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar'
import { MobileFooter } from '@/components/navigation/MobileFooter'
import { useAuth } from '@/app/providers/AuthContext'
import LandingPage from '@/pages/Landing'
import { cn } from '@/lib/utils'
import { hasCompletedOnboarding } from '@/lib/names-api'

export const AppLayout: ParentComponent = (props) => {
  const auth = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Track whether we've checked onboarding status for this session
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = createSignal(false)
  const [isCheckingOnboarding, setIsCheckingOnboarding] = createSignal(false)

  const hideMobileFooter = () => location.pathname.startsWith('/messages')

  // Truncate address for display
  const displayName = () => {
    const addr = auth.pkpAddress()
    if (!addr) return undefined
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Check onboarding status when user authenticates
  createEffect(() => {
    const pkpAddress = auth.pkpAddress()

    // Reset check state when user logs out
    if (!auth.isAuthenticated() || !pkpAddress) {
      setHasCheckedOnboarding(false)
      setIsCheckingOnboarding(false)
      return
    }

    // Skip if already checked or currently checking
    if (hasCheckedOnboarding() || isCheckingOnboarding()) return

    // Skip if already on onboarding page
    if (location.pathname.startsWith('/onboarding')) {
      setHasCheckedOnboarding(true)
      return
    }

    // Check if user has completed onboarding (has a .heaven name)
    setIsCheckingOnboarding(true)

    hasCompletedOnboarding(pkpAddress).then((completed) => {
      setIsCheckingOnboarding(false)
      setHasCheckedOnboarding(true)

      if (!completed) {
        // No .heaven name - redirect to onboarding
        console.log('[AppLayout] No .heaven name found, redirecting to onboarding')
        navigate('/onboarding')
      } else {
        console.log('[AppLayout] User has .heaven name, staying on current page')
      }
    }).catch((err) => {
      console.error('[AppLayout] Error checking onboarding status:', err)
      setIsCheckingOnboarding(false)
      setHasCheckedOnboarding(true)
      // On error, redirect to onboarding to be safe
      navigate('/onboarding')
    })
  })

  return (
    <div class="min-h-screen bg-background">
      <Show
        when={auth.isAuthenticated()}
        fallback={<LandingPage onConnect={() => auth.openAuthDialog()} />}
      >
        {/* Desktop Sidebar */}
        <DesktopSidebar
          isConnected={auth.isAuthenticated()}
          username={displayName()}
          onConnect={() => auth.openAuthDialog()}
        />

        {/* Main content area - offset for sidebar on desktop */}
        <main
          class={cn(
            'md:ml-72 min-h-screen md:pb-0',
            hideMobileFooter() ? 'pb-0' : 'pb-16'
          )}
        >
          {props.children}
        </main>

        {/* Mobile Footer */}
        {!hideMobileFooter() && <MobileFooter />}
      </Show>
    </div>
  )
}

export default AppLayout
