import { Component, For, Show, createSignal } from 'solid-js'
import { cn } from '@/lib/utils'
import { Eye, Users, Lock, ArrowRight, Minus, Plus } from 'phosphor-solid'

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

const MIN_AGE = 18
const MAX_AGE = 98

interface AgePreferencePageProps {
  step?: number
  totalSteps?: number
  onContinue?: (minAge: number, maxAge: number, visibility: Visibility) => void
}

export const AgePreferencePage: Component<AgePreferencePageProps> = (props) => {
  const [minAge, setMinAge] = createSignal<number>(21)
  const [maxAge, setMaxAge] = createSignal<number>(35)
  const [visibility, setVisibility] = createSignal<Visibility>('public')

  const decrementMin = () => {
    if (minAge() > MIN_AGE) {
      setMinAge(minAge() - 1)
    }
  }

  const incrementMin = () => {
    if (minAge() < maxAge()) {
      setMinAge(minAge() + 1)
    }
  }

  const decrementMax = () => {
    if (maxAge() > minAge()) {
      setMaxAge(maxAge() - 1)
    }
  }

  const incrementMax = () => {
    if (maxAge() < MAX_AGE) {
      setMaxAge(maxAge() + 1)
    }
  }

  const handleContinue = () => {
    props.onContinue?.(minAge(), maxAge(), visibility())
  }

  const AgeControl = (controlProps: {
    value: number
    onDecrement: () => void
    onIncrement: () => void
    canDecrement: boolean
    canIncrement: boolean
    label: string
  }) => (
    <div
      class="flex items-center justify-between p-4 rounded-xl border"
      style={{ background: colors.surface, 'border-color': colors.border }}
    >
      <span class="text-lg font-medium" style={{ color: colors.textSecondary }}>
        {controlProps.label}
      </span>

      <div class="flex items-center">
        <button
          type="button"
          onClick={controlProps.onDecrement}
          disabled={!controlProps.canDecrement}
          class={cn('w-11 h-11 rounded-xl flex items-center justify-center transition-all', 'active:scale-95')}
          style={{
            background: controlProps.canDecrement ? colors.accentSoft : colors.bgSubtle,
            color: controlProps.canDecrement ? colors.accent : colors.textMuted,
            cursor: controlProps.canDecrement ? 'pointer' : 'not-allowed',
          }}
        >
          <Minus size={22} weight="bold" />
        </button>

        <div class="w-16 flex items-center justify-center">
          <span
            class="text-3xl font-bold"
            style={{
              color: colors.text,
              'font-family': fonts.body,
            }}
          >
            {controlProps.value}
          </span>
        </div>

        <button
          type="button"
          onClick={controlProps.onIncrement}
          disabled={!controlProps.canIncrement}
          class={cn('w-11 h-11 rounded-xl flex items-center justify-center transition-all', 'active:scale-95')}
          style={{
            background: controlProps.canIncrement ? colors.accentSoft : colors.bgSubtle,
            color: controlProps.canIncrement ? colors.accent : colors.textMuted,
            cursor: controlProps.canIncrement ? 'pointer' : 'not-allowed',
          }}
        >
          <Plus size={22} weight="bold" />
        </button>
      </div>
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
              What age range?
            </h1>
            <p class="text-lg" style={{ color: colors.textSecondary }}>
              Set the ages you're interested in dating.
            </p>
          </div>

          {/* Age Range Selector */}
          <div class="mb-10">
            <div class="flex flex-col gap-3">
              <AgeControl
                value={minAge()}
                onDecrement={decrementMin}
                onIncrement={incrementMin}
                canDecrement={minAge() > MIN_AGE}
                canIncrement={minAge() < maxAge()}
                label="Minimum"
              />
              <AgeControl
                value={maxAge()}
                onDecrement={decrementMax}
                onIncrement={incrementMax}
                canDecrement={maxAge() > minAge()}
                canIncrement={maxAge() < MAX_AGE}
                label="Maximum"
              />
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
                  Your age preference will appear on your profile. Everyone can see the
                  range you're looking for.
                </p>
              </Show>
              <Show when={visibility() === 'shared'}>
                <p class="text-base" style={{ color: colors.textSecondary }}>
                  If you match with someone in your preferred range and they're also
                  looking for your age — you'll both see you have compatible ages.
                </p>
              </Show>
              <Show when={visibility() === 'secret'}>
                <p class="text-base" style={{ color: colors.textSecondary }}>
                  You'll only see people in this age range, but they'll never know
                  this was your filter. Your preference stays encrypted.
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

export default AgePreferencePage
