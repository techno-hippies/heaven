import { Component, For, Show, createSignal } from 'solid-js'
import { cn } from '@/lib/utils'
import { Eye, Users, Lock, ArrowRight, ShieldCheck, Flag } from 'phosphor-solid'

// Light Neo Coral palette
const colors = {
  bg: '#fffaf9',
  bgSubtle: '#fff5f3',
  surface: '#ffffff',
  border: '#ffe0dc',
  borderSubtle: '#ffebe8',
  text: '#2d1f1f',
  textSecondary: '#6b5555',
  textMuted: '#9a8585',
  accent: '#ff6b6b',
  accentHover: '#ff5252',
  accentSoft: '#fff0ee',
  accentText: '#ffffff',
}

const fonts = {
  heading: "'Fraunces', Georgia, serif",
  body: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
}

type Visibility = 'public' | 'shared' | 'secret'

interface VisibilityOption {
  value: Visibility
  label: string
  description: string
  icon: typeof Eye
  iconBg: string
  iconColor: string
}

const VISIBILITY_OPTIONS: VisibilityOption[] = [
  {
    value: 'public',
    label: 'Public',
    description: 'Visible to everyone',
    icon: Eye,
    iconBg: '#dbeafe',
    iconColor: '#3b82f6',
  },
  {
    value: 'shared',
    label: 'Shared on match',
    description: 'Hidden until you match, then revealed',
    icon: Users,
    iconBg: '#fef3c7',
    iconColor: '#f59e0b',
  },
  {
    value: 'secret',
    label: 'Secret',
    description: 'Used for matching, never revealed',
    icon: Lock,
    iconBg: '#fee2e2',
    iconColor: '#ef4444',
  },
]

interface NationalityPageProps {
  step?: number
  totalSteps?: number
  /** Verified nationality from self.xyz passport (ISO country code) */
  verifiedNationality: string
  /** Display name for the nationality */
  nationalityName: string
  onContinue?: (visibility: Visibility) => void
}

export const NationalityPage: Component<NationalityPageProps> = (props) => {
  const [visibility, setVisibility] = createSignal<Visibility>('public')

  const handleContinue = () => {
    props.onContinue?.(visibility())
  }

  return (
    <div
      class="min-h-screen flex flex-col"
      style={{ background: colors.bg, 'font-family': fonts.body }}
    >
      {/* Scrollable content */}
      <div class="flex-1 overflow-y-auto pb-24">
        <div class="w-full max-w-lg mx-auto px-6 py-8">
          {/* Step indicator */}
          <Show when={props.step && props.totalSteps}>
            <p class="text-base font-medium mb-2" style={{ color: colors.textMuted }}>
              Step {props.step} of {props.totalSteps}
            </p>
          </Show>

          {/* Header */}
          <div class="mb-8">
            <h1
              class="text-3xl font-bold mb-3"
              style={{ color: colors.text, 'font-family': fonts.heading }}
            >
              Nationality
            </h1>
            <p class="text-lg" style={{ color: colors.textSecondary }}>
              From your passport. Choose who can see it.
            </p>
          </div>

          {/* Verified Nationality Display */}
          <div class="mb-10">
            <div
              class="flex flex-col items-center gap-4 p-8 rounded-2xl border"
              style={{ background: colors.surface, 'border-color': colors.border }}
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: colors.bgSubtle }}
                >
                  <Flag size={28} weight="fill" style={{ color: colors.textSecondary }} />
                </div>
                <span
                  class="text-3xl font-bold"
                  style={{ color: colors.text, 'font-family': fonts.heading }}
                >
                  {props.nationalityName}
                </span>
              </div>

              {/* Verified badge */}
              <div
                class="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: '#dcfce7' }}
              >
                <ShieldCheck size={18} weight="fill" style={{ color: '#16a34a' }} />
                <span class="text-sm font-medium" style={{ color: '#16a34a' }}>
                  Verified by self.xyz
                </span>
              </div>
            </div>
          </div>

          {/* Visibility Selection */}
          <div>
            <h2
              class="text-xl font-semibold mb-6"
              style={{ color: colors.text, 'font-family': fonts.heading }}
            >
              Visibility
            </h2>

            <div class="flex flex-col gap-3">
              <For each={VISIBILITY_OPTIONS}>
                {(option) => {
                  const Icon = option.icon
                  const isSelected = () => visibility() === option.value
                  return (
                    <button
                      type="button"
                      onClick={() => setVisibility(option.value)}
                      class={cn(
                        'w-full flex items-start gap-4 p-5 rounded-xl border text-left transition-all',
                        'active:scale-[0.99]'
                      )}
                      style={{
                        background: colors.surface,
                        'border-color': isSelected() ? colors.accent : colors.border,
                        'box-shadow': isSelected() ? `0 0 0 1px ${colors.accent}` : 'none',
                      }}
                    >
                      <div
                        class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: option.iconBg }}
                      >
                        <Icon size={24} weight="fill" style={{ color: option.iconColor }} />
                      </div>
                      <div class="flex-1">
                        <p
                          class="text-lg font-semibold"
                          style={{ color: colors.text, 'font-family': fonts.heading }}
                        >
                          {option.label}
                        </p>
                        <p class="text-base mt-1" style={{ color: colors.textSecondary }}>
                          {option.description}
                        </p>
                      </div>
                    </button>
                  )
                }}
              </For>
            </div>

            {/* Explanation */}
            <div class="mt-6">
              <Show when={visibility() === 'public'}>
                <p class="text-base" style={{ color: colors.textSecondary }}>
                  Your nationality will appear on your profile for everyone to see.
                </p>
              </Show>
              <Show when={visibility() === 'shared'}>
                <p class="text-base" style={{ color: colors.textSecondary }}>
                  Hidden while browsing. When you match with someone, your nationalities
                  are revealed to each other.
                </p>
              </Show>
              <Show when={visibility() === 'secret'}>
                <p class="text-base" style={{ color: colors.textSecondary }}>
                  Encrypted and never shown. Only used for matching with people who
                  have compatible preferences.
                </p>
              </Show>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div
        class="fixed bottom-0 left-0 right-0 backdrop-blur border-t"
        style={{
          background: `${colors.bg}f2`,
          'border-color': colors.borderSubtle,
        }}
      >
        <div class="w-full max-w-lg mx-auto px-6 py-4">
          <button
            type="button"
            onClick={handleContinue}
            class={cn(
              'w-full h-14 rounded-xl flex items-center justify-center gap-3 text-lg font-semibold transition-all',
              'active:scale-[0.98]'
            )}
            style={{
              background: colors.accent,
              color: colors.accentText,
              cursor: 'pointer',
            }}
          >
            <span>Continue</span>
            <ArrowRight size={24} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default NationalityPage
