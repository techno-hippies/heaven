/* @refresh reload */
import { render } from 'solid-js/web'
import { HashRouter } from '@solidjs/router'
import { routes } from './routes'
import { Web3Provider } from '@/providers/Web3Provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthDialog } from '@/components/auth'
import './index.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

render(
  () => (
    <Web3Provider>
      <AuthProvider>
        <HashRouter>{routes}</HashRouter>
        <AuthDialog />
      </AuthProvider>
    </Web3Provider>
  ),
  root
)
