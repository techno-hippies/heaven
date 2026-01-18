import { Component, For, Show, createSignal } from 'solid-js'
import { cn } from '@/lib/utils'
import { Eye, Users, Lock, ArrowRight } from 'phosphor-solid'

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

// Contract groups: 1-2 = vanilla, 3-4 = open-minded, 5-7 = enthusiast
const KINK_LEVELS = [
  { value: 1, label: '1', group: 'vanilla' },
  { value: 2, label: '2', group: 'vanilla' },
  { value: 3, label: '3', group: 'open-minded' },
  { value: 4, label: '4', group: 'open-minded' },
  { value: 5, label: '5', group: 'enthusiast' },
  { value: 6, label: '6', group: 'enthusiast' },
  { value: 7, label: '7', group: 'enthusiast' },
]

const GROUP_DESCRIPTIONS = {
  vanilla: 'Traditional intimacy',
  'open-minded': 'Willing to explore',
  enthusiast: 'Actively adventurous',
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

interface KinkLevelPageProps {
  step?: number
  totalSteps?: number
  onContinue?: (level: number, visibility: Visibility) => void
}

export const KinkLevelPage: Component<KinkLevelPageProps> = (props) => {
  const [level, setLevel] = createSignal<number | null>(null)
  const [visibility, setVisibility] = createSignal<Visibility>('secret')

  const canContinue = () => level() !== null

  const handleContinue = () => {
    if (level() !== null) {
      props.onContinue?.(level()!, visibility())
    }
  }

  const getGroupForLevel = (l: number | null) => {
    if (l === null) return null
    const found = KINK_LEVELS.find((k) => k.value === l)
    return found?.group || null
  }

  const currentGroup = () => getGroupForLevel(level())

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
              Intimacy preferences
            </h1>
            <p class="text-lg" style={{ color: colors.textSecondary }}>
              Help us match you with compatible partners.
            </p>
          </div>

          {/* Scale explanation */}
          <div
            class="mb-6 p-4 rounded-xl"
            style={{ background: colors.bgSubtle }}
          >
            <p class="text-base" style={{ color: colors.textSecondary }}>
              Rate yourself on a scale from 1 (traditional) to 7 (very adventurous).
              We'll match you with people in compatible ranges.
            </p>
          </div>

          {/* Kink Scale */}
          <div class="mb-8">
            <div
              class="p-5 rounded-xl border"
              style={{ background: colors.surface, 'border-color': colors.border }}
            >
              {/* Scale labels */}
              <div class="flex justify-between mb-3 px-1">
                <span class="text-sm" style={{ color: colors.textMuted }}>
                  Traditional
                </span>
                <span class="text-sm" style={{ color: colors.textMuted }}>
                  Adventurous
                </span>
              </div>

              {/* Scale buttons */}
              <div class="flex gap-2">
                <For each={KINK_LEVELS}>
                  {(option) => {
                    const isSelected = () => level() === option.value
                    const groupColor =
                      option.group === 'vanilla'
                        ? '#86efac'
                        : option.group === 'open-minded'
                          ? '#fde047'
                          : '#fca5a5'
                    return (
                      <button
                        type="button"
                        onClick={() => setLevel(option.value)}
                        class={cn(
                          'flex-1 py-4 rounded-xl text-xl font-bold transition-all',
                          'active:scale-95'
                        )}
                        style={{
                          background: isSelected() ? colors.accent : colors.bgSubtle,
                          color: isSelected() ? colors.accentText : colors.textSecondary,
                          'border-bottom': `3px solid ${isSelected() ? colors.accentHover : groupColor}`,
                        }}
                      >
                        {option.label}
                      </button>
                    )
                  }}
                </For>
              </div>

              {/* Group indicator */}
              <div class="flex justify-center gap-6 mt-4 pt-4 border-t" style={{ 'border-color': colors.borderSubtle }}>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" style={{ background: '#86efac' }} />
                  <span class="text-sm" style={{ color: colors.textMuted }}>1-2</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" style={{ background: '#fde047' }} />
                  <span class="text-sm" style={{ color: colors.textMuted }}>3-4</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" style={{ background: '#fca5a5' }} />
                  <span class="text-sm" style={{ color: colors.textMuted }}>5-7</span>
                </div>
              </div>
            </div>

            {/* Current selection info */}
            <Show when={currentGroup()}>
              <div class="mt-4 text-center">
                <p class="text-lg font-medium" style={{ color: colors.text }}>
                  {GROUP_DESCRIPTIONS[currentGroup() as keyof typeof GROUP_DESCRIPTIONS]}
                </p>
                <p class="text-base mt-1" style={{ color: colors.textSecondary }}>
                  You'll be matched with others in this compatibility group.
                </p>
              </div>
            </Show>
          </div>

          {/* Visibility Selection */}
          <Show when={level() !== null}>
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
                    Your intimacy level will appear on your profile for everyone to see.
                  </p>
                </Show>
                <Show when={visibility() === 'shared'}>
                  <p class="text-base" style={{ color: colors.textSecondary }}>
                    Your level stays hidden. When you match with someone in a compatible
                    group, you'll both see you're aligned.
                  </p>
                </Show>
                <Show when={visibility() === 'secret'}>
                  <p class="text-base" style={{ color: colors.textSecondary }}>
                    Your level is encrypted and never shown. It's only used to ensure
                    you're matched with compatible people.
                  </p>
                </Show>
              </div>
            </div>
          </Show>
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
            disabled={!canContinue()}
            class={cn(
              'w-full h-14 rounded-xl flex items-center justify-center gap-3 text-lg font-semibold transition-all',
              'active:scale-[0.98]'
            )}
            style={{
              background: canContinue() ? colors.accent : colors.border,
              color: canContinue() ? colors.accentText : colors.textMuted,
              cursor: canContinue() ? 'pointer' : 'not-allowed',
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

export default KinkLevelPage
