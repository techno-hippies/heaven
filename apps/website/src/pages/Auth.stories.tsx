import type { Meta, StoryObj } from 'storybook-solidjs'
import { onCleanup, onMount } from 'solid-js'
import AuthPage from './Auth'

const meta = {
  title: 'Pages/Auth',
  component: AuthPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AuthPage>

export default meta
type Story = StoryObj<typeof meta>

const StoryWrapper = () => {
  const originalHash = window.location.hash
  const originalFetch = window.fetch
  const originalClose = window.close
  const originalLitAuth = (window as { LitAuth?: unknown }).LitAuth

  onMount(() => {
    const hashBase = originalHash.split('?')[0] || '#'
    window.location.hash = `${hashBase}?callback=${encodeURIComponent('http://localhost:9999/auth-callback')}`

    const pkpInfo = {
      pubkey: '0x9b1a7f8a2d3c4e5f',
      ethAddress: '0x9b1a7f8a2d3c4e5f9b1a7f8a2d3c4e5f9b1a7f8a',
      tokenId: 12345,
    }

    ;(window as { LitAuth?: unknown }).LitAuth = {
      WebAuthnAuthenticator: {
        authenticate: async () => {
          await new Promise((resolve) => setTimeout(resolve, 400))
          return {
            authMethodType: 'webauthn',
            authMethodId: 'storybook-auth',
            accessToken: 'storybook-token',
          }
        },
        registerAndMintPKP: async () => ({ pkpInfo }),
      },
      getLitClient: async () => ({
        viewPKPsByAuthData: async () => ({ pkps: [pkpInfo] }),
      }),
    }

    window.fetch = (async () => ({ ok: true })) as typeof window.fetch
    window.close = () => {}
  })

  onCleanup(() => {
    window.location.hash = originalHash
    window.fetch = originalFetch
    window.close = originalClose

    if (originalLitAuth === undefined) {
      delete (window as { LitAuth?: unknown }).LitAuth
      return
    }

    ;(window as { LitAuth?: unknown }).LitAuth = originalLitAuth
  })

  return (
    <div class="min-h-screen bg-background">
      <AuthPage />
    </div>
  )
}

export const Default: Story = {
  render: () => <StoryWrapper />,
}
