import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { Icon, type IconName } from '@/icons'
import { cn } from '@/lib/utils'

/** Survey categories with their associated icons */
export type SurveyCategory =
  | 'lifestyle'
  | 'intimacy'
  | 'work'
  | 'body'

const CATEGORY_ICONS: Record<SurveyCategory, IconName> = {
  lifestyle: 'wine',
  intimacy: 'fire',
  work: 'briefcase',
  body: 'person',
}

export interface SurveyCardProps {
  /** Survey title */
  title: string
  /** Survey category (determines icon) */
  category: SurveyCategory
  /** Short description */
  description: string
  /** Questions completed (0 if not started) */
  completed?: number
  /** Total questions (for completion check) */
  total?: number
  /** Click handler */
  onClick?: () => void
  /** Additional class names */
  class?: string
}

export const SurveyCard: Component<SurveyCardProps> = (props) => {
  const isFinished = () => props.total && (props.completed ?? 0) >= props.total

  return (
    <button
      type="button"
      onClick={props.onClick}
      class={cn(
        'flex items-center gap-4 p-5 rounded-2xl text-left cursor-pointer w-full',
        'border transition-all duration-200 active:scale-[0.98]',
        isFinished()
          ? 'border-primary/30 bg-primary/5'
          : 'border-border bg-card hover:border-primary/30',
        props.class
      )}
    >
      {/* Category icon */}
      <div class="flex-shrink-0">
        <Icon
          name={CATEGORY_ICONS[props.category]}
          class="text-2xl text-primary"
          weight="fill"
        />
      </div>

      {/* Content */}
      <div class="flex-1 min-w-0">
        <p class="font-medium text-foreground">{props.title}</p>
        <p class="text-muted-foreground">{props.description}</p>
      </div>

      {/* Chevron / Done */}
      <div class="flex-shrink-0">
        <Show
          when={isFinished()}
          fallback={
            <Icon name="caret-right" class="text-xl text-muted-foreground" />
          }
        >
          <Icon name="check-circle" class="text-xl text-primary" weight="fill" />
        </Show>
      </div>
    </button>
  )
}

export default SurveyCard
