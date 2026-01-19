import { Accordion as KobalteAccordion } from '@kobalte/core/accordion'
import { splitProps, type ParentComponent, type JSX } from 'solid-js'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/icons'

export interface AccordionProps {
  class?: string
  defaultValue?: string[]
  value?: string[]
  onChange?: (value: string[]) => void
  collapsible?: boolean
  multiple?: boolean
  children?: JSX.Element
}

export const Accordion: ParentComponent<AccordionProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children'])

  return (
    <KobalteAccordion
      class={cn('space-y-3', local.class)}
      {...others}
    >
      {local.children}
    </KobalteAccordion>
  )
}

export interface AccordionItemProps {
  class?: string
  value: string
  children?: JSX.Element
}

export const AccordionItem: ParentComponent<AccordionItemProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children'])

  return (
    <KobalteAccordion.Item
      class={cn(
        'rounded-2xl bg-secondary/40 overflow-hidden',
        local.class
      )}
      {...others}
    >
      {local.children}
    </KobalteAccordion.Item>
  )
}

export interface AccordionTriggerProps {
  class?: string
  children?: JSX.Element
}

export const AccordionTrigger: ParentComponent<AccordionTriggerProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children'])

  return (
    <KobalteAccordion.Header>
      <KobalteAccordion.Trigger
        class={cn(
          'flex w-full items-center justify-between px-5 py-4 text-left font-medium text-foreground cursor-pointer',
          'hover:bg-secondary/70 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          '[&[data-expanded]>svg]:rotate-180',
          local.class
        )}
        {...others}
      >
        {local.children}
        <Icon
          name="caret-down"
          class="h-5 w-5 text-muted-foreground transition-transform duration-200"
        />
      </KobalteAccordion.Trigger>
    </KobalteAccordion.Header>
  )
}

export interface AccordionContentProps {
  class?: string
  children?: JSX.Element
}

export const AccordionContent: ParentComponent<AccordionContentProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children'])

  return (
    <KobalteAccordion.Content
      class={cn(
        'overflow-hidden',
        'data-[expanded]:animate-accordion-down data-[closed]:animate-accordion-up',
        local.class
      )}
      {...others}
    >
      <div class="px-5 pb-4 pt-0 text-muted-foreground">
        {local.children}
      </div>
    </KobalteAccordion.Content>
  )
}
