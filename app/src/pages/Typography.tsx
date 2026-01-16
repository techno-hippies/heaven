/**
 * Typography & Branding Page
 * Design system reference for Neodate
 */

import type { Component } from 'solid-js'
import { For } from 'solid-js'
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar'

const colors = [
  { name: 'Primary', var: 'bg-primary', text: 'text-primary-foreground' },
  { name: 'Secondary', var: 'bg-secondary', text: 'text-secondary-foreground' },
  { name: 'Accent', var: 'bg-accent', text: 'text-accent-foreground' },
  { name: 'Muted', var: 'bg-muted', text: 'text-muted-foreground' },
  { name: 'Destructive', var: 'bg-destructive', text: 'text-destructive-foreground' },
]

export const Typography: Component = () => {
  return (
    <div class="min-h-screen bg-background">
      <DesktopSidebar
        isConnected={true}
        username="@neo.eth"
        avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=neo"
      />

      <div class="md:pl-72 min-h-screen">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12">
          <h1 class="text-4xl font-bold text-foreground mb-2 font-title">neodate</h1>
          <p class="text-lg text-muted-foreground mb-16">Design System & Typography</p>

          {/* Typography Scale */}
          <section class="mb-16">
            <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              Typography Scale
            </h2>
            <div class="space-y-6">
              <div>
                <p class="text-xs text-muted-foreground mb-1">Display / 48px / Bold</p>
                <p class="text-5xl font-bold text-foreground">Find your people</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground mb-1">H1 / 36px / Bold</p>
                <p class="text-4xl font-bold text-foreground">Interest-based matching</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground mb-1">H2 / 30px / Semibold</p>
                <p class="text-3xl font-semibold text-foreground">Privacy by design</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground mb-1">H3 / 24px / Semibold</p>
                <p class="text-2xl font-semibold text-foreground">Your data, your control</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground mb-1">H4 / 20px / Medium</p>
                <p class="text-xl font-medium text-foreground">Verified identities only</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground mb-1">Body Large / 18px / Regular</p>
                <p class="text-lg text-foreground">Connect with people who share your actual interests, not just what they claim to like.</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground mb-1">Body / 16px / Regular</p>
                <p class="text-base text-foreground">Neodate uses DNS patterns to understand what you're genuinely interested in, creating matches based on real browsing behavior rather than curated profiles.</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground mb-1">Body Small / 14px / Regular</p>
                <p class="text-sm text-foreground">All data is aggregated into interest categories. We don't store your browsing history.</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground mb-1">Caption / 12px / Regular</p>
                <p class="text-xs text-muted-foreground">Last updated 2 hours ago</p>
              </div>
            </div>
          </section>

          {/* Font Weights */}
          <section class="mb-16">
            <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              Font Weights
            </h2>
            <div class="space-y-3">
              <p class="text-2xl font-normal text-foreground">Regular (400) — Body text, descriptions</p>
              <p class="text-2xl font-medium text-foreground">Medium (500) — Labels, buttons</p>
              <p class="text-2xl font-semibold text-foreground">Semibold (600) — Subheadings</p>
              <p class="text-2xl font-bold text-foreground">Bold (700) — Headlines, emphasis</p>
            </div>
          </section>

          {/* Colors */}
          <section class="mb-16">
            <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              Colors
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <For each={colors}>
                {(color) => (
                  <div class="space-y-2">
                    <div class={`h-20 rounded-lg ${color.var} flex items-end p-2`}>
                      <span class={`text-xs font-medium ${color.text}`}>{color.name}</span>
                    </div>
                  </div>
                )}
              </For>
            </div>
            <div class="mt-6 grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="h-16 rounded-lg bg-background border border-border flex items-center justify-center">
                  <span class="text-sm text-foreground">Background</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="h-16 rounded-lg bg-card border border-border flex items-center justify-center">
                  <span class="text-sm text-card-foreground">Card</span>
                </div>
              </div>
            </div>
          </section>

          {/* Text Colors */}
          <section class="mb-16">
            <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              Text Colors
            </h2>
            <div class="space-y-3">
              <p class="text-lg text-foreground">Foreground — Primary text, headings</p>
              <p class="text-lg text-muted-foreground">Muted Foreground — Secondary text, descriptions</p>
              <p class="text-lg text-primary">Primary — Links, interactive elements</p>
              <p class="text-lg text-destructive">Destructive — Errors, warnings</p>
            </div>
          </section>

          {/* Spacing */}
          <section class="mb-16">
            <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              Content Spacing
            </h2>
            <div class="space-y-2 text-sm text-muted-foreground">
              <p><span class="font-medium text-foreground">Sections:</span> 64px (mb-16) between major sections</p>
              <p><span class="font-medium text-foreground">Subsections:</span> 40px (mb-10) between related groups</p>
              <p><span class="font-medium text-foreground">Items:</span> 24px (space-y-6) between list items</p>
              <p><span class="font-medium text-foreground">Tight:</span> 16px (space-y-4) for compact lists</p>
              <p><span class="font-medium text-foreground">Inline:</span> 4-8px (mb-1, mb-2) for label-to-content</p>
            </div>
          </section>

          {/* Example: FAQ Style */}
          <section class="mb-16">
            <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              Example: FAQ Item
            </h2>
            <div class="border border-border rounded-lg p-6 bg-card">
              <div class="space-y-8">
                <div>
                  <h3 class="text-lg font-medium text-foreground mb-2">
                    What is Neodate?
                  </h3>
                  <p class="text-base text-muted-foreground leading-relaxed">
                    Dating and friendship matching based on interests inferred from DNS browsing patterns, plus verified identity gating and encrypted compatibility checks.
                  </p>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-foreground mb-2">
                    Is the DNS VPN secure?
                  </h3>
                  <p class="text-base text-muted-foreground leading-relaxed">
                    The VPN tunnel (WireGuard) encrypts traffic between your device and Neodate's DNS gateway, so your ISP can't see your DNS queries while it's on. Neodate can see them, so the real question is trust + minimization: we reduce/aggregate what we store and keep raw logs short-lived.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Monospace */}
          <section>
            <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              Monospace
            </h2>
            <p class="font-mono text-sm text-foreground bg-muted px-3 py-2 rounded-md inline-block">
              0x1234...5678
            </p>
            <p class="text-xs text-muted-foreground mt-2">Used for addresses, code, and technical values</p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Typography
