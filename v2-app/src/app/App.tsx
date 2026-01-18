import { Router } from '@solidjs/router'
import { AuthProvider } from './providers/AuthContext'
import { routes } from './routes'

export const App = () => {
  return (
    <AuthProvider>
      <Router>{routes}</Router>
    </AuthProvider>
  )
}
