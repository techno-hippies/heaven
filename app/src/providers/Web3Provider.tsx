/**
 * Web3 Provider for SolidJS
 *
 * Provides wagmi context for EOA wallet connections.
 * Uses injected wallets (MetaMask, Rabby, etc.)
 *
 * Note: We don't require a specific chain since PKP minting
 * happens on Lit's Chronicle chain, and the EOA is just used
 * for authentication (SIWE signature).
 */

import { type ParentComponent, onCleanup } from 'solid-js'
import { createConfig, http, reconnect } from '@wagmi/core'
import { mainnet } from '@wagmi/core/chains'
import { injected } from '@wagmi/connectors'

// Create wagmi config with injected connector only
// We don't need WalletConnect for now - keeps it simple
export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
  },
})

// Auto-reconnect on page load
reconnect(wagmiConfig)

/**
 * Web3Provider - Wraps app to provide wagmi context
 *
 * Note: Unlike React, SolidJS doesn't have wagmi hooks built-in.
 * We use @wagmi/core directly and create reactive wrappers.
 */
export const Web3Provider: ParentComponent = (props) => {
  // Clean up on unmount
  onCleanup(() => {
    wagmiConfig.connectors.forEach((connector) => {
      connector.disconnect?.()
    })
  })

  return <>{props.children}</>
}

// Re-export wagmi core functions for use in components
export {
  connect,
  disconnect,
  getAccount,
  getWalletClient,
  watchAccount,
  type GetAccountReturnType,
} from '@wagmi/core'
