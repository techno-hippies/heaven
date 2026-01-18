import type { Component } from 'solid-js'
import { For } from 'solid-js'
type Plan = {
  id: string
  name: string
  price?: string
  features: string[]
}

type Addon = {
  name: string
  detail: string
}

const PLANS: Plan[] = [
  {
    id: 'plan-free',
    name: 'Free',
    features: [
      '1-3 daily picks',
      'AI coach chat: limited (20 msgs/day)',
      'DNS VPN 3M queries/mo',
      'Simple filters',
    ],
  },
  {
    id: 'plan-basic',
    name: 'Basic',
    price: '3 months $20',
    features: [
      '30-50 daily picks',
      'AI coach chat: higher cap',
      'DNS VPN unlimited',
      'Simple filters',
      'Voice: add-on only (discounted)',
    ],
  },
  {
    id: 'plan-advanced',
    name: 'Advanced',
    price: '3 months $50',
    features: [
      '100-200 daily picks + boosted profile',
      'Advanced filters',
      'AI coach chat: highest cap',
      'Voice: includes 15-30 min/mo',
      'DNS VPN unlimited',
    ],
  },
]

const ADDONS: Addon[] = [
  {
    name: 'Voice minutes packs',
    detail: '$X / 15 min',
  },
  {
    name: 'Extra candidate packs',
    detail: 'Compute-based',
  },
  {
    name: 'Boosts',
    detail: 'From $X',
  },
  {
    name: 'Custom domains',
    detail: 'Separate store page',
  },
]

export const StorePage: Component = () => {
  return (
    <div class="min-h-screen bg-background">
      <section class="px-6 py-12 md:px-10 lg:px-12">
        <div class="mx-auto w-full max-w-5xl space-y-10">
          <header>
            <h1 class="text-3xl font-semibold text-foreground md:text-4xl font-title">
              Store
            </h1>
          </header>

          <section id="plans" class="space-y-5">
            <h2 class="text-2xl font-semibold text-foreground font-title">Plans</h2>
            <div class="grid gap-6 lg:grid-cols-3">
              <For each={PLANS}>
                {(plan) => (
                  <div
                    id={plan.id}
                    class="flex h-full flex-col rounded-2xl border border-border bg-card p-6"
                  >
                    <div class="flex items-baseline justify-between gap-4">
                      <h3 class="text-xl font-semibold text-foreground">
                        {plan.name}
                      </h3>
                      {plan.price && (
                        <span class="text-base text-foreground">{plan.price}</span>
                      )}
                    </div>
                    <ul class="mt-5 space-y-2 text-base text-foreground/80">
                      <For each={plan.features}>
                        {(feature) => <li>{feature}</li>}
                      </For>
                    </ul>
                  </div>
                )}
              </For>
            </div>
          </section>

          <section id="addons" class="space-y-4">
            <h2 class="text-2xl font-semibold text-foreground font-title">Add-ons</h2>
            <div class="rounded-2xl border border-border bg-card p-6">
              <ul class="space-y-3 text-base text-foreground/80">
                <For each={ADDONS}>
                  {(addon) => (
                    <li class="flex flex-wrap items-center justify-between gap-2">
                      <span class="text-foreground">{addon.name}</span>
                      <span class="text-muted-foreground">{addon.detail}</span>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}

export default StorePage
