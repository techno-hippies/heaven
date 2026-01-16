import type { ParentComponent } from 'solid-js'
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar'
import { MobileFooter } from '@/components/navigation/MobileFooter'
import { useAuth } from '@/contexts/AuthContext'

export const AppLayout: ParentComponent = (props) => {
  const auth = useAuth()

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
      <main class="md:ml-72 min-h-screen pb-16 md:pb-0">
        {props.children}
      </main>

      {/* Mobile Footer */}
      <MobileFooter />
    </div>
  )
}

export default AppLayout
