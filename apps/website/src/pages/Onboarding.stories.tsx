import type { Meta, StoryObj } from 'storybook-solidjs'
import { Show } from 'solid-js'
import { Button } from '@/ui/button'
import { Spinner } from '@/ui/spinner'

/**
 * Onboarding page auth states - these show before the main flow
 */

/** Auth prompt component for Storybook */
const AuthPrompt = (props: { error?: string }) => (
  <div class="flex flex-col items-center justify-center h-screen gap-4 p-6">
    <div class="text-center max-w-md">
      <h1 class="text-2xl font-bold text-foreground mb-2">Sign in to continue</h1>
      <p class="text-muted-foreground mb-6">
        Use your passkey to access your profile and complete onboarding.
      </p>
      <Show when={props.error}>
        <p class="text-destructive text-sm mb-4">{props.error}</p>
      </Show>
      <div class="flex flex-col gap-3">
        <Button onClick={() => console.log('Sign in clicked')}>
          Sign in with passkey
        </Button>
        <Button variant="ghost" onClick={() => console.log('Go back clicked')}>
          Go back
        </Button>
      </div>
    </div>
  </div>
)

/** Authenticating state */
const AuthenticatingState = () => (
  <div class="flex flex-col items-center justify-center h-screen gap-4">
    <Spinner size="lg" />
    <p class="text-muted-foreground">Signing in with your passkey...</p>
  </div>
)

/** Registering name state */
const RegisteringState = () => (
  <div class="flex flex-col items-center justify-center h-screen gap-4">
    <Spinner size="lg" />
    <p class="text-muted-foreground">Registering your .heaven name...</p>
  </div>
)

const meta: Meta = {
  title: 'Pages/Onboarding',
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj

/** User needs to authenticate before onboarding */
export const AuthRequired: Story = {
  render: () => <AuthPrompt />,
}

/** Auth failed - show error with retry */
export const AuthError: Story = {
  render: () => <AuthPrompt error="No PKP found for this credential. Please register first." />,
}

/** Currently authenticating with passkey */
export const Authenticating: Story = {
  render: () => <AuthenticatingState />,
}

/** Registering .heaven name after completing onboarding */
export const Registering: Story = {
  render: () => <RegisteringState />,
}
