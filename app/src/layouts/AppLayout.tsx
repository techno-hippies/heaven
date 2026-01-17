import type { ParentComponent } from 'solid-js'
import { useLocation } from '@solidjs/router'
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar'
import { MobileFooter } from '@/components/navigation/MobileFooter'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export const AppLayout: ParentComponent = (props) => {
  const auth = useAuth()
  const location = useLocation()

  const hideMobileFooter = () => location.pathname.startsWith('/messages')

  // Truncate address for display
  const displayName = () => {
    const addr = auth.pkpAddress()
    if (!addr) return undefined
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div class="min-h-screen bg-background">
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
    </div>
  )
}

export default AppLayout
