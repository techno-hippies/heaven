import type { Meta, StoryObj } from 'storybook-solidjs'
import { For } from 'solid-js'

const meta = {
  title: 'Design/ColorPalette',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface Palette {
  name: string
  description: string
  bg: string
  surface: string
  surfaceHover: string
  border: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  accent: string
  accentHover: string
  accentText: string
}

const palettes: Palette[] = [
  {
    name: 'Neo Cyan',
    description: 'Futuristic, electric, cyberpunk vibes',
    bg: '#0a0a0f',
    surface: '#12121a',
    surfaceHover: '#1a1a25',
    border: '#2a2a3a',
    textPrimary: '#f0f0f5',
    textSecondary: '#a0a0b0',
    textMuted: '#606070',
    accent: '#00d4ff',
    accentHover: '#40e0ff',
    accentText: '#0a0a0f',
  },
  {
    name: 'Neo Violet',
    description: 'Modern, premium, sophisticated',
    bg: '#0c0a10',
    surface: '#14121a',
    surfaceHover: '#1e1a28',
    border: '#2e2a3a',
    textPrimary: '#f5f0fa',
    textSecondary: '#b0a0c0',
    textMuted: '#706080',
    accent: '#a855f7',
    accentHover: '#c084fc',
    accentText: '#ffffff',
  },
  {
    name: 'Neo Coral',
    description: 'Warm, inviting, approachable',
    bg: '#100a0a',
    surface: '#1a1212',
    surfaceHover: '#251a1a',
    border: '#3a2828',
    textPrimary: '#faf5f5',
    textSecondary: '#c0a8a8',
    textMuted: '#806868',
    accent: '#ff6b6b',
    accentHover: '#ff8a8a',
    accentText: '#100a0a',
  },
  {
    name: 'Neo Mint',
    description: 'Fresh, clean, trustworthy',
    bg: '#080c0a',
    surface: '#101814',
    surfaceHover: '#18221c',
    border: '#283830',
    textPrimary: '#f0faf5',
    textSecondary: '#a0c0b0',
    textMuted: '#608070',
    accent: '#34d399',
    accentHover: '#6ee7b7',
    accentText: '#080c0a',
  },
  {
    name: 'Neo Gold',
    description: 'Luxurious, exclusive, premium',
    bg: '#0a0a08',
    surface: '#141410',
    surfaceHover: '#1e1e18',
    border: '#32322a',
    textPrimary: '#fafaf0',
    textSecondary: '#c0c0a0',
    textMuted: '#808060',
    accent: '#fbbf24',
    accentHover: '#fcd34d',
    accentText: '#0a0a08',
  },
  {
    name: 'Neo Slate',
    description: 'Minimal, clean, professional',
    bg: '#09090b',
    surface: '#18181b',
    surfaceHover: '#27272a',
    border: '#3f3f46',
    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    accent: '#f4f4f5',
    accentHover: '#ffffff',
    accentText: '#09090b',
  },
]

const PaletteCard = (props: { palette: Palette }) => {
  const p = props.palette
  return (
    <div
      class="p-6 rounded-2xl"
      style={{ background: p.bg }}
    >
      <div class="mb-6">
        <h2 class="text-2xl font-bold mb-1" style={{ color: p.textPrimary }}>{p.name}</h2>
        <p class="text-base" style={{ color: p.textSecondary }}>{p.description}</p>
      </div>

      {/* Sample UI */}
      <div class="space-y-4">
        {/* Buttons */}
        <div class="flex flex-wrap gap-3">
          <button
            class="px-5 py-3 rounded-xl text-lg font-medium"
            style={{ background: p.accent, color: p.accentText }}
          >
            Primary
          </button>
          <button
            class="px-5 py-3 rounded-xl text-lg font-medium border"
            style={{ background: p.surface, color: p.textPrimary, 'border-color': p.border }}
          >
            Secondary
          </button>
        </div>

        {/* Cards */}
        <div
          class="p-4 rounded-xl border"
          style={{ background: p.surface, 'border-color': p.border }}
        >
          <p class="text-lg font-medium" style={{ color: p.textPrimary }}>Card Title</p>
          <p class="text-base mt-1" style={{ color: p.textSecondary }}>Card description text</p>
        </div>

        {/* Selection chips */}
        <div class="flex flex-wrap gap-2">
          <span
            class="px-4 py-2 rounded-xl border text-base"
            style={{ background: `${p.accent}20`, color: p.accent, 'border-color': p.accent }}
          >
            Selected
          </span>
          <span
            class="px-4 py-2 rounded-xl border text-base"
            style={{ background: p.surface, color: p.textSecondary, 'border-color': p.border }}
          >
            Unselected
          </span>
        </div>

        {/* Color swatches */}
        <div class="flex gap-2 mt-4">
          <div class="flex flex-col items-center gap-1">
            <div class="w-10 h-10 rounded-lg" style={{ background: p.bg }} />
            <span class="text-xs" style={{ color: p.textMuted }}>bg</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <div class="w-10 h-10 rounded-lg" style={{ background: p.surface }} />
            <span class="text-xs" style={{ color: p.textMuted }}>surface</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <div class="w-10 h-10 rounded-lg border" style={{ background: p.border, 'border-color': p.textMuted }} />
            <span class="text-xs" style={{ color: p.textMuted }}>border</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <div class="w-10 h-10 rounded-lg" style={{ background: p.accent }} />
            <span class="text-xs" style={{ color: p.textMuted }}>accent</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export const AllPalettes: Story = {
  render: () => (
    <div class="min-h-screen bg-black p-8">
      <h1 class="text-3xl font-bold text-white mb-2">Heaven Color Palettes</h1>
      <p class="text-lg text-gray-400 mb-8">Pick a direction for the brand</p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <For each={palettes}>
          {(palette) => <PaletteCard palette={palette} />}
        </For>
      </div>
    </div>
  ),
}

export const NeoCyan: Story = {
  render: () => (
    <div class="min-h-screen p-8" style={{ background: palettes[0].bg }}>
      <PaletteCard palette={palettes[0]} />
    </div>
  ),
}

export const NeoViolet: Story = {
  render: () => (
    <div class="min-h-screen p-8" style={{ background: palettes[1].bg }}>
      <PaletteCard palette={palettes[1]} />
    </div>
  ),
}

export const NeoCoral: Story = {
  render: () => (
    <div class="min-h-screen p-8" style={{ background: palettes[2].bg }}>
      <PaletteCard palette={palettes[2]} />
    </div>
  ),
}

export const NeoMint: Story = {
  render: () => (
    <div class="min-h-screen p-8" style={{ background: palettes[3].bg }}>
      <PaletteCard palette={palettes[3]} />
    </div>
  ),
}

export const NeoGold: Story = {
  render: () => (
    <div class="min-h-screen p-8" style={{ background: palettes[4].bg }}>
      <PaletteCard palette={palettes[4]} />
    </div>
  ),
}

export const NeoSlate: Story = {
  render: () => (
    <div class="min-h-screen p-8" style={{ background: palettes[5].bg }}>
      <PaletteCard palette={palettes[5]} />
    </div>
  ),
}
