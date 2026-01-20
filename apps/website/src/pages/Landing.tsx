import type { Component } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { Button } from '@/ui/button'
import { Icon } from '@/icons'
import { asset } from '@/lib/utils'

interface LandingProps {
  onConnect: () => void
}

export const LandingPage: Component<LandingProps> = (props) => {
  const navigate = useNavigate()

  function handleGetStarted() {
    navigate('/onboarding')
  }

  return (
    <div class="h-dvh bg-background flex flex-col overflow-hidden">
      {/* Hero */}
      <div class="flex flex-col items-center justify-center px-6 pt-10 pb-6">
        <img
          src={asset('/images/heaven-stacked-logo.png')}
          alt="Heaven"
          class="h-16 w-auto mb-2"
        />
        <p class="text-lg text-muted-foreground">Matches made in heaven.</p>
      </div>

      {/* Features */}
      <div class="flex-1 px-5 space-y-2 max-w-lg mx-auto w-full overflow-hidden">
        <div class="flex gap-3 items-start p-3 rounded-xl bg-card/60 border border-border/50">
          <div class="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="wallet" class="text-base text-primary" />
          </div>
          <div class="min-w-0">
            <h3 class="font-medium text-foreground text-sm">Portable Profile</h3>
            <p class="text-xs text-muted-foreground leading-relaxed">
              Your profile lives on Ethereum. Use it across apps or take it somewhere else.
            </p>
          </div>
        </div>

        <div class="flex gap-3 items-start p-3 rounded-xl bg-card/60 border border-border/50">
          <div class="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="eye-slash" class="text-base text-primary" />
          </div>
          <div class="min-w-0">
            <h3 class="font-medium text-foreground text-sm">Private by Default</h3>
            <p class="text-xs text-muted-foreground leading-relaxed">
              Matches use anonymous signals. You choose what to reveal after you match.
            </p>
          </div>
        </div>

        <div class="flex gap-3 items-start p-3 rounded-xl bg-card/60 border border-border/50">
          <div class="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="microphone" class="text-base text-primary" />
          </div>
          <div class="min-w-0">
            <h3 class="font-medium text-foreground text-sm">AI Dating Coach</h3>
            <p class="text-xs text-muted-foreground leading-relaxed">
              Scarlett knows your profile and results. Message or call her for advice.
            </p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div class="px-5 py-6">
        <div class="w-full max-w-lg mx-auto space-y-2">
          <Button variant="default" size="lg" class="w-full" onClick={handleGetStarted}>
            Get started
          </Button>
          <Button
            variant="ghost"
            size="default"
            class="w-full text-muted-foreground"
            onClick={props.onConnect}
          >
            I already have an account
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
