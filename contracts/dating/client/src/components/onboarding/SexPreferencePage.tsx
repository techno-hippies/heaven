import { Component, For, Show, createSignal } from 'solid-js'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'phosphor-solid'

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

// Matches BiologicalSexPage values
const SEX_OPTIONS = [
  { value: 0, label: 'Male' },
  { value: 1, label: 'Female' },
]

interface SexPreferencePageProps {
  step?: number
  totalSteps?: number
  onContinue?: (preferences: number[]) => void
}

export const SexPreferencePage: Component<SexPreferencePageProps> = (props) => {
  const [selectedPreferences, setSelectedPreferences] = createSignal<Set<number>>(new Set())

  const togglePreference = (value: number) => {
    const current = new Set(selectedPreferences())
    if (current.has(value)) {
      current.delete(value)
    } else {
      current.add(value)
    }
    setSelectedPreferences(current)
  }

  const canContinue = () => selectedPreferences().size > 0

  const handleContinue = () => {
    props.onContinue?.(Array.from(selectedPreferences()))
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
              Biological sex preference
            </h1>
            <p class="text-lg" style={{ color: colors.textSecondary }}>
              Select all that you're interested in.
            </p>
          </div>

          {/* Multi-select */}
          <div class="mb-8">
            <div class="flex flex-col gap-3">
              <For each={SEX_OPTIONS}>
                {(option) => {
                  const isSelected = () => selectedPreferences().has(option.value)
                  return (
                    <button
                      type="button"
                      onClick={() => togglePreference(option.value)}
                      class={cn(
                        'w-full p-5 rounded-xl border text-left transition-all',
                        'active:scale-[0.99]'
                      )}
                      style={{
                        background: isSelected() ? colors.accentSoft : colors.surface,
                        'border-color': isSelected() ? colors.accent : colors.border,
                        'box-shadow': isSelected() ? `0 0 0 1px ${colors.accent}` : 'none',
                      }}
                    >
                      <p
                        class="text-xl font-semibold"
                        style={{
                          color: isSelected() ? colors.accent : colors.text,
                          'font-family': fonts.heading,
                        }}
                      >
                        {option.label}
                      </p>
                    </button>
                  )
                }}
              </For>
            </div>
          </div>

          {/* Info box */}
          <div
            class="p-4 rounded-xl"
            style={{ background: colors.bgSubtle }}
          >
            <p class="text-base" style={{ color: colors.textSecondary }}>
              This filters by biological sex from verified ID. For gender-based matching,
              use your gender preference instead.
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

export default SexPreferencePage
