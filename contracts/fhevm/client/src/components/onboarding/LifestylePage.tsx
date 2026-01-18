import { Component, For, Show, createSignal } from 'solid-js'
import { cn } from '@/lib/utils'
import { Eye, Users, Lock, ArrowRight, Wine, Fire } from 'phosphor-solid'

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

const SMOKING_OPTIONS = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Regularly' },
]

const DRINKING_OPTIONS = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Socially' },
  { value: 3, label: 'Regularly' },
]

type Visibility = 'public' | 'shared' | 'secret'

interface VisibilityOption {
  value: Visibility
  label: string
  icon: typeof Eye
  iconColor: string
}

const VISIBILITY_OPTIONS: VisibilityOption[] = [
  { value: 'public', label: 'Public', icon: Eye, iconColor: '#3b82f6' },
  { value: 'shared', label: 'Shared', icon: Users, iconColor: '#f59e0b' },
  { value: 'secret', label: 'Secret', icon: Lock, iconColor: '#ef4444' },
]

interface LifestylePageProps {
  step?: number
  totalSteps?: number
  onContinue?: (
    smoking: number,
    smokingVisibility: Visibility,
    drinking: number,
    drinkingVisibility: Visibility
  ) => void
}

export const LifestylePage: Component<LifestylePageProps> = (props) => {
  const [smoking, setSmoking] = createSignal<number | null>(null)
  const [smokingVisibility, setSmokingVisibility] = createSignal<Visibility>('public')
  const [drinking, setDrinking] = createSignal<number | null>(null)
  const [drinkingVisibility, setDrinkingVisibility] = createSignal<Visibility>('public')

  const canContinue = () => smoking() !== null && drinking() !== null

  const handleContinue = () => {
    if (canContinue()) {
      props.onContinue?.(
        smoking()!,
        smokingVisibility(),
        drinking()!,
        drinkingVisibility()
      )
    }
  }

  const VisibilityPicker = (props: {
    value: Visibility
    onChange: (v: Visibility) => void
  }) => (
    <div class="flex gap-2 mt-3">
      <For each={VISIBILITY_OPTIONS}>
        {(option) => {
          const Icon = option.icon
          const isSelected = () => props.value === option.value
          return (
            <button
              type="button"
              onClick={() => props.onChange(option.value)}
              class={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border transition-all',
                'active:scale-[0.98]'
              )}
              style={{
                background: isSelected() ? colors.accentSoft : colors.surface,
                'border-color': isSelected() ? colors.accent : colors.border,
              }}
            >
              <Icon
                size={16}
                weight="fill"
                style={{ color: isSelected() ? colors.accent : option.iconColor }}
              />
              <span
                class="text-sm font-medium"
                style={{ color: isSelected() ? colors.accent : colors.textSecondary }}
              >
                {option.label}
              </span>
            </button>
          )
        }}
      </For>
    </div>
  )

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
              Lifestyle
            </h1>
            <p class="text-lg" style={{ color: colors.textSecondary }}>
              Share your habits to find compatible matches.
            </p>
          </div>

          {/* Smoking Section */}
          <div
            class="mb-6 p-5 rounded-xl border"
            style={{ background: colors.surface, 'border-color': colors.border }}
          >
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: colors.bgSubtle }}
              >
                <Fire size={22} weight="fill" style={{ color: colors.textSecondary }} />
              </div>
              <h2
                class="text-lg font-semibold"
                style={{ color: colors.text, 'font-family': fonts.heading }}
              >
                Smoking
              </h2>
            </div>
            <div class="flex gap-2">
              <For each={SMOKING_OPTIONS}>
                {(option) => {
                  const isSelected = () => smoking() === option.value
                  return (
                    <button
                      type="button"
                      onClick={() => setSmoking(option.value)}
                      class={cn(
                        'flex-1 py-3 rounded-xl border text-base font-medium transition-all',
                        'active:scale-[0.98]'
                      )}
                      style={{
                        background: isSelected() ? colors.accentSoft : colors.bgSubtle,
                        'border-color': isSelected() ? colors.accent : 'transparent',
                        color: isSelected() ? colors.accent : colors.textSecondary,
                      }}
                    >
                      {option.label}
                    </button>
                  )
                }}
              </For>
            </div>
            <Show when={smoking() !== null}>
              <VisibilityPicker value={smokingVisibility()} onChange={setSmokingVisibility} />
            </Show>
          </div>

          {/* Drinking Section */}
          <div
            class="mb-6 p-5 rounded-xl border"
            style={{ background: colors.surface, 'border-color': colors.border }}
          >
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: colors.bgSubtle }}
              >
                <Wine size={22} weight="fill" style={{ color: colors.textSecondary }} />
              </div>
              <h2
                class="text-lg font-semibold"
                style={{ color: colors.text, 'font-family': fonts.heading }}
              >
                Drinking
              </h2>
            </div>
            <div class="flex gap-2">
              <For each={DRINKING_OPTIONS}>
                {(option) => {
                  const isSelected = () => drinking() === option.value
                  return (
                    <button
                      type="button"
                      onClick={() => setDrinking(option.value)}
                      class={cn(
                        'flex-1 py-3 rounded-xl border text-base font-medium transition-all',
                        'active:scale-[0.98]'
                      )}
                      style={{
                        background: isSelected() ? colors.accentSoft : colors.bgSubtle,
                        'border-color': isSelected() ? colors.accent : 'transparent',
                        color: isSelected() ? colors.accent : colors.textSecondary,
                      }}
                    >
                      {option.label}
                    </button>
                  )
                }}
              </For>
            </div>
            <Show when={drinking() !== null}>
              <VisibilityPicker value={drinkingVisibility()} onChange={setDrinkingVisibility} />
            </Show>
          </div>

          {/* Info box */}
          <div
            class="p-4 rounded-xl"
            style={{ background: colors.bgSubtle }}
          >
            <p class="text-base" style={{ color: colors.textSecondary }}>
              These help filter matches but are often sensitive topics. Consider using
              "Shared on match" or "Secret" for more privacy.
            </p>
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

export default LifestylePage
