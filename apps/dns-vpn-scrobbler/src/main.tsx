import { render } from 'solid-js/web'
import { App } from './App'
import { Web3Provider } from '@/app/providers/Web3Provider'
import { AuthProvider } from '@/app/providers/AuthContext'
import './index.css'

render(
  () => (
    <Web3Provider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Web3Provider>
  ),
  document.getElementById('root')!
)
