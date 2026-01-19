import type { Component } from 'solid-js'
import { Match, Switch } from 'solid-js'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icons'
import type { CommitStatus } from '@/lib/onboarding/store'

interface CommitScreenProps {
  status: CommitStatus
  error: string | null
  onStart: () => void
  onRetry: () => void
}

export const CommitScreen: Component<CommitScreenProps> = (props) => (
  <div class="flex flex-col items-center h-screen bg-background">
    <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div class="max-w-md mx-auto space-y-6">
        <Switch>
          <Match when={props.status === 'error'}>
            <div class="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
              <Icon name="x-circle" weight="fill" class="text-4xl text-destructive" />
            </div>
            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">Something went wrong</h1>
              <p class="text-lg text-muted-foreground">{props.error ?? 'Failed to create profile'}</p>
            </div>
            <Button
              variant="default"
              size="lg"
              class="w-full"
              onClick={props.onRetry}
            >
              Try again
            </Button>
          </Match>

          <Match when={props.status === 'success'}>
            <div class="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Icon name="check-circle" weight="fill" class="text-4xl text-emerald-500" />
            </div>
            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">Profile created!</h1>
              <p class="text-lg text-muted-foreground">Now set your dealbreakers...</p>
            </div>
          </Match>

          <Match when={props.status === 'pending'}>
            <div class="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">Creating your profile</h1>
              <p class="text-lg text-muted-foreground">Confirm in your wallet...</p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              class="w-full"
              onClick={props.onRetry}
            >
              Try again
            </Button>
          </Match>

          <Match when={props.status === 'idle'}>
            <div class="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="user" weight="fill" class="text-4xl text-primary" />
            </div>
            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">Ready to create your profile</h1>
              <p class="text-lg text-muted-foreground">We'll ask you to confirm in your wallet.</p>
            </div>
            <Button
              variant="default"
              size="lg"
              class="w-full"
              onClick={props.onStart}
            >
              Create profile
            </Button>
          </Match>
        </Switch>
      </div>
    </div>
  </div>
)
