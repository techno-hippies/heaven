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

const RELATIONSHIP_OPTIONS = [
  { value: 1, label: 'Monogamy' },
  { value: 2, label: 'Open relationship' },
  { value: 3, label: 'Polyamory' },
  { value: 4, label: 'Relationship anarchy' },
  { value: 5, label: 'Casual dating' },
  { value: 6, label: 'Friends first' },
  { value: 7, label: 'Marriage-focused' },
  { value: 8, label: 'Figuring it out' },
]

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

interface RelationshipStructurePageProps {
  step?: number
  totalSteps?: number
  onContinue?: (structures: number[], visibility: Visibility) => void
}

export const RelationshipStructurePage: Component<RelationshipStructurePageProps> = (props) => {
  const [selectedStructures, setSelectedStructures] = createSignal<Set<number>>(new Set())
  const [visibility, setVisibility] = createSignal<Visibility>('public')

  const toggleStructure = (value: number) => {
    const current = new Set(selectedStructures())
    if (current.has(value)) {
      current.delete(value)
    } else {
      current.add(value)
    }
    setSelectedStructures(current)
  }

  const canContinue = () => selectedStructures().size > 0

  const handleContinue = () => {
    props.onContinue?.(Array.from(selectedStructures()), visibility())
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
              Relationship structure
            </h1>
            <p class="text-lg" style={{ color: colors.textSecondary }}>
              Select all that apply.
            </p>
          </div>

          {/* Multi-select */}
          <div class="mb-10">
            <div class="flex flex-wrap gap-3">
              <For each={RELATIONSHIP_OPTIONS}>
                {(option) => {
                  const isSelected = () => selectedStructures().has(option.value)
                  return (
                    <button
                      type="button"
                      onClick={() => toggleStructure(option.value)}
                      class={cn(
                        'px-5 py-3 rounded-xl border text-lg font-medium transition-all',
                        'active:scale-[0.98]'
                      )}
                      style={{
                        background: isSelected() ? colors.accentSoft : colors.surface,
                        'border-color': isSelected() ? colors.accent : colors.border,
                        color: isSelected() ? colors.accent : colors.textSecondary,
                      }}
                    >
                      {option.label}
                    </button>
                  )
                }}
              </For>
            </div>
          </div>

          {/* Visibility Selection */}
          <Show when={selectedStructures().size > 0}>
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
                    Your selections will appear on your profile.
                  </p>
                </Show>
                <Show when={visibility() === 'shared'}>
                  <p class="text-base" style={{ color: colors.textSecondary }}>
                    When you match, you'll both see which structures you have in common.
                  </p>
                </Show>
                <Show when={visibility() === 'secret'}>
                  <p class="text-base" style={{ color: colors.textSecondary }}>
                    You'll only see people with overlapping structures, but they won't
                    know this was your filter.
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

export default RelationshipStructurePage
