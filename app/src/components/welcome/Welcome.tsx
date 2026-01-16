import { Component } from 'solid-js'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Step {
  number: number
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    number: 1,
    title: 'Set up your profile',
    description:
      'Public info anyone can see, secret dealbreaker filters, and what you reveal on match.',
  },
  {
    number: 2,
    title: 'Turn on the DNS Firewall',
    description:
      'Powers better recommendations from your browsing patterns. Your raw DNS data stays private.',
  },
  {
    number: 3,
    title: 'Get matches',
    description:
      "We suggest people you're likely to click with. Only you two see what was revealed and why it worked.",
  },
]

export interface WelcomeProps {
  class?: string
  onDownloadVpn?: () => void
}

export const Welcome: Component<WelcomeProps> = (props) => {
  return (
    <div
      class={cn(
        'min-h-screen bg-background flex flex-col',
        props.class
      )}
    >
      {/* Main content - centered */}
      <div class="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo / Brand */}
        <div class="mb-10 text-center">
          <img
            src="/images/neodate-logo-300x300.png"
            alt="neodate"
            class="w-24 h-24 mx-auto mb-4"
          />
          <h1 class="text-4xl font-bold text-foreground font-title">neodate</h1>
          <p class="text-lg text-muted-foreground mt-2">Blind dates from anonymous browsing.</p>
        </div>

        {/* Steps */}
        <div class="w-full max-w-md space-y-8">
          {STEPS.map((step) => (
            <div class="flex gap-4">
              {/* Step number */}
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold">
                {step.number}
              </div>
              {/* Content */}
              <div class="flex-1 pt-1">
                <h3 class="text-xl font-medium text-foreground">{step.title}</h3>
                <p class="text-base text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <a href="/faq" class="text-base text-primary mt-8">
          Read the FAQ
        </a>
      </div>

      {/* Bottom CTA - accounts for mobile footer */}
      <div class="px-6 pb-24 lg:pb-12">
        <div class="w-full max-w-md mx-auto">
          <Button
            variant="default"
            size="xl"
            class="w-full"
            onClick={props.onDownloadVpn}
          >
            Download DNS Firewall
          </Button>
          <p class="text-base text-muted-foreground text-center mt-4">
            Connection detected automatically
          </p>
        </div>
      </div>
    </div>
  )
}

export default Welcome
