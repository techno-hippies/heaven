/**
 * Web3 Provider using Reown AppKit
 *
 * Provides WalletConnect for EOA connections.
 * Works in both browser (injected wallets) and Tauri (QR code scanning).
 */

import { type ParentComponent, onMount } from 'solid-js'
import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { baseSepolia } from '@reown/appkit/networks'
import { reconnect } from '@wagmi/core'

// Reown Project ID
const projectId = 'ce42103ef9ca7f760e736b44f32e20b7'

// Create wagmi adapter with WalletConnect
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [baseSepolia],
})

// Export wagmi config for use with getWalletClient, etc.
export const wagmiConfig = wagmiAdapter.wagmiConfig

// Create AppKit instance
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [baseSepolia],
  defaultNetwork: baseSepolia,
  metadata: {
    name: 'Heaven',
    description: 'Matches are made in Heaven',
    url: 'https://heaven.computer',
    icons: ['https://heaven.computer/icon.png'],
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  themeMode: 'light',
})

/**
 * Web3Provider - Initializes AppKit and wagmi
 */
export const Web3Provider: ParentComponent = (props) => {
  onMount(() => {
    // Reconnect any existing sessions
    reconnect(wagmiConfig)
  })

  return <>{props.children}</>
}

// Re-export wagmi core functions
export {
  connect,
  disconnect,
  getAccount,
  getWalletClient,
  watchAccount,
} from '@wagmi/core'
