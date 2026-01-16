/**
 * BrandingPage - Design system and color reference
 * Shows all colors, typography, and component styles
 */

import { For, type Component } from 'solid-js'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

/** Color swatch component */
const ColorSwatch: Component<{
  name: string
  variable: string
  class: string
  textClass?: string
}> = (props) => (
  <div class="flex flex-col gap-2">
    <div
      class={cn(
        'h-20 rounded-xl flex items-end p-3 shadow-sm',
        props.class
      )}
    >
      <span class={cn('font-medium', props.textClass || 'text-foreground')} style={{ "font-size": "13px" }}>
        {props.variable}
      </span>
    </div>
    <span class="font-medium text-foreground" style={{ "font-size": "14px" }}>{props.name}</span>
  </div>
)

/** Section header */
const SectionHeader: Component<{ title: string; description?: string }> = (props) => (
  <div class="mb-6">
    <h2 class="font-bold text-foreground" style={{ "font-size": "24px" }}>{props.title}</h2>
    {props.description && (
      <p class="text-muted-foreground mt-1" style={{ "font-size": "16px" }}>{props.description}</p>
    )}
  </div>
)

export const BrandingPage: Component<{ class?: string }> = (props) => {
  const coreColors = [
    { name: 'Background', variable: '--background', class: 'bg-background border border-border', textClass: 'text-foreground' },
    { name: 'Foreground', variable: '--foreground', class: 'bg-foreground', textClass: 'text-background' },
    { name: 'Card', variable: '--card', class: 'bg-card border border-border', textClass: 'text-card-foreground' },
    { name: 'Primary', variable: '--primary', class: 'bg-primary', textClass: 'text-primary-foreground' },
    { name: 'Secondary', variable: '--secondary', class: 'bg-secondary', textClass: 'text-secondary-foreground' },
    { name: 'Muted', variable: '--muted', class: 'bg-muted', textClass: 'text-muted-foreground' },
    { name: 'Accent', variable: '--accent', class: 'bg-accent', textClass: 'text-accent-foreground' },
    { name: 'Destructive', variable: '--destructive', class: 'bg-destructive', textClass: 'text-destructive-foreground' },
  ]

  const chatColors = [
    { name: 'User Message', variable: '--chat-user', class: 'bg-chat-user', textClass: 'text-chat-user-foreground' },
    { name: 'Other Message', variable: '--chat-other', class: 'bg-chat-other', textClass: 'text-chat-other-foreground' },
  ]

  const utilityColors = [
    { name: 'Border', variable: '--border', class: 'bg-border', textClass: 'text-foreground' },
    { name: 'Input', variable: '--input', class: 'bg-input', textClass: 'text-foreground' },
    { name: 'Ring', variable: '--ring', class: 'bg-ring', textClass: 'text-primary-foreground' },
  ]


  return (
    <div class={cn('p-6 max-w-6xl mx-auto space-y-12', props.class)}>
      {/* Header */}
      <div class="text-center py-8">
        <h1 class="font-bold text-foreground font-title" style={{ "font-size": "40px" }}>neodate</h1>
        <p class="text-muted-foreground mt-2" style={{ "font-size": "18px" }}>Design System & Brand Guidelines</p>
      </div>

      {/* Core Colors */}
      <section>
        <SectionHeader
          title="Core Colors"
          description="Primary color palette used throughout the application"
        />
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <For each={coreColors}>
            {(color) => <ColorSwatch {...color} />}
          </For>
        </div>
      </section>

      {/* Chat Colors */}
      <section>
        <SectionHeader
          title="Chat Colors"
          description="Colors for message bubbles in conversations"
        />
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <For each={chatColors}>
            {(color) => <ColorSwatch {...color} />}
          </For>
        </div>
        <div class="mt-6 max-w-md space-y-3">
          <div class="flex justify-end">
            <div class="bg-chat-user text-chat-user-foreground rounded-2xl rounded-br-md px-4 py-2.5">
              <p style={{ "font-size": "16px" }}>Hey! How are you doing?</p>
              <p class="text-chat-user-foreground/70 mt-1" style={{ "font-size": "12px" }}>2:30 PM</p>
            </div>
          </div>
          <div class="flex justify-start">
            <div class="bg-chat-other text-chat-other-foreground rounded-2xl rounded-bl-md px-4 py-2.5">
              <p style={{ "font-size": "16px" }}>I'm doing great, thanks for asking!</p>
              <p class="text-muted-foreground mt-1" style={{ "font-size": "12px" }}>2:31 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Utility Colors */}
      <section>
        <SectionHeader
          title="Utility Colors"
          description="Colors for borders, inputs, and focus states"
        />
        <div class="grid grid-cols-3 sm:grid-cols-3 gap-4">
          <For each={utilityColors}>
            {(color) => <ColorSwatch {...color} />}
          </For>
        </div>
      </section>

      {/* Typography */}
      <section>
        <SectionHeader
          title="Typography"
          description="Font family: Geist (sans-serif)"
        />
        <div class="space-y-4 bg-card rounded-2xl p-6">
          <div>
            <span class="text-muted-foreground" style={{ "font-size": "12px" }}>40px / Bold</span>
            <p class="font-bold" style={{ "font-size": "40px" }}>Display Heading</p>
          </div>
          <div>
            <span class="text-muted-foreground" style={{ "font-size": "12px" }}>24px / Bold</span>
            <p class="font-bold" style={{ "font-size": "24px" }}>Section Heading</p>
          </div>
          <div>
            <span class="text-muted-foreground" style={{ "font-size": "12px" }}>18px / Semibold</span>
            <p class="font-semibold" style={{ "font-size": "18px" }}>Card Title</p>
          </div>
          <div>
            <span class="text-muted-foreground" style={{ "font-size": "12px" }}>16px / Regular</span>
            <p style={{ "font-size": "16px" }}>Body text for paragraphs and general content. This is the default size for most text in the application.</p>
          </div>
          <div>
            <span class="text-muted-foreground" style={{ "font-size": "12px" }}>14px / Regular</span>
            <p style={{ "font-size": "14px" }}>Secondary text, captions, and supporting content.</p>
          </div>
          <div>
            <span class="text-muted-foreground" style={{ "font-size": "12px" }}>12px / Regular</span>
            <p class="text-muted-foreground" style={{ "font-size": "12px" }}>Timestamps, labels, and small helper text.</p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <SectionHeader
          title="Buttons"
          description="Button styles and variants"
        />
        <div class="space-y-6 bg-card rounded-2xl p-6">
          <div>
            <p class="text-muted-foreground mb-3" style={{ "font-size": "14px" }}>Standard Buttons</p>
            <div class="flex flex-wrap gap-3">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>
          <div>
            <p class="text-muted-foreground mb-3" style={{ "font-size": "14px" }}>Icon Buttons</p>
            <div class="flex flex-wrap items-center gap-3">
              <IconButton icon="caret-left" label="Back" variant="ghost" size="md" />
              <IconButton icon="x" label="Close" variant="ghost" size="md" />
              <IconButton icon="timer" label="Timer" variant="ghost" size="md" />
              <IconButton icon="paper-plane-right" weight="fill" label="Send" variant="default" size="md" />
              <IconButton icon="heart" weight="fill" label="Like" variant="default" size="lg" />
            </div>
          </div>
          <div>
            <p class="text-muted-foreground mb-3" style={{ "font-size": "14px" }}>Icon Button Sizes</p>
            <div class="flex flex-wrap items-center gap-3">
              <IconButton icon="heart" label="Small" variant="default" size="sm" />
              <IconButton icon="heart" label="Medium" variant="default" size="md" />
              <IconButton icon="heart" label="Large" variant="default" size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Avatars */}
      <section>
        <SectionHeader
          title="Avatars"
          description="User profile pictures with online status"
        />
        <div class="bg-card rounded-2xl p-6">
          <div class="flex flex-wrap items-end gap-4">
            <div class="text-center">
              <Avatar
                src="https://api.dicebear.com/9.x/avataaars/svg?seed=scarlett"
                fallback="S"
                size="sm"
              />
              <p class="text-muted-foreground mt-2" style={{ "font-size": "12px" }}>Small</p>
            </div>
            <div class="text-center">
              <Avatar
                src="https://api.dicebear.com/9.x/avataaars/svg?seed=emma"
                fallback="E"
                size="md"
              />
              <p class="text-muted-foreground mt-2" style={{ "font-size": "12px" }}>Medium</p>
            </div>
            <div class="text-center">
              <Avatar
                src="https://api.dicebear.com/9.x/avataaars/svg?seed=sophie"
                fallback="S"
                size="lg"
                online
              />
              <p class="text-muted-foreground mt-2" style={{ "font-size": "12px" }}>Large + Online</p>
            </div>
            <div class="text-center">
              <Avatar
                src="https://api.dicebear.com/9.x/avataaars/svg?seed=olivia"
                fallback="O"
                size="xl"
                online
              />
              <p class="text-muted-foreground mt-2" style={{ "font-size": "12px" }}>XL + Online</p>
            </div>
            <div class="text-center">
              <Avatar
                src="https://api.dicebear.com/9.x/avataaars/svg?seed=ava"
                fallback="A"
                size="2xl"
              />
              <p class="text-muted-foreground mt-2" style={{ "font-size": "12px" }}>2XL</p>
            </div>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section>
        <SectionHeader
          title="Badges"
          description="Labels and status indicators"
        />
        <div class="bg-card rounded-2xl p-6">
          <div class="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </div>
      </section>

      {/* Icons */}
      <section>
        <SectionHeader
          title="Icons"
          description="Phosphor icons used throughout the app"
        />
        <div class="bg-card rounded-2xl p-6">
          <div class="flex flex-wrap gap-4">
            {(['heart', 'x', 'caret-left', 'caret-right', 'paper-plane-right', 'timer', 'gear', 'sparkle', 'chat-circle', 'user', 'bell', 'camera', 'image', 'plus', 'check', 'warning'] as const).map((name) => (
              <div class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary transition-colors">
                <Icon name={name} style={{ "font-size": "24px" }} />
                <span class="text-muted-foreground" style={{ "font-size": "11px" }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacing & Radius */}
      <section>
        <SectionHeader
          title="Border Radius"
          description="Rounded corners used in the design system"
        />
        <div class="bg-card rounded-2xl p-6">
          <div class="flex flex-wrap gap-4">
            <div class="text-center">
              <div class="w-16 h-16 bg-primary rounded-sm" />
              <p class="text-muted-foreground mt-2" style={{ "font-size": "12px" }}>sm</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-primary rounded-md" />
              <p class="text-muted-foreground mt-2" style={{ "font-size": "12px" }}>md</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-primary rounded-lg" />
              <p class="text-muted-foreground mt-2" style={{ "font-size": "12px" }}>lg</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-primary rounded-xl" />
              <p class="text-muted-foreground mt-2" style={{ "font-size": "12px" }}>xl</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-primary rounded-2xl" />
              <p class="text-muted-foreground mt-2" style={{ "font-size": "12px" }}>2xl</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-primary rounded-full" />
              <p class="text-muted-foreground mt-2" style={{ "font-size": "12px" }}>full</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BrandingPage
