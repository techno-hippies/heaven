import { HashRouter } from '@solidjs/router'
import { AuthDialog } from '@/components/auth'
import { AuthProvider } from './providers/AuthContext'
import { Web3Provider } from './providers/Web3Provider'
import { routes } from './routes'

export const App = () => {
  return (
    <Web3Provider>
      <AuthProvider>
        <HashRouter>
          {routes}
          <AuthDialog />
        </HashRouter>
      </AuthProvider>
    </Web3Provider>
  )
}
