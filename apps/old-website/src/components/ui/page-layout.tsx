import { splitProps, type ParentComponent, type JSX } from 'solid-js'
import { cn } from '@/lib/utils'

export interface PageLayoutProps {
  class?: string
  /** Content for the sticky footer (mobile) / inline buttons (desktop) */
  footer?: JSX.Element
}

/**
 * Reusable page layout with sticky footer on mobile.
 *
 * Mobile: Content scrolls, footer sticks to bottom
 * Desktop: Footer renders inline at bottom of content
 */
export const PageLayout: ParentComponent<PageLayoutProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children', 'footer'])

  return (
    <div class={cn('min-h-screen bg-background text-foreground', local.class)} {...others}>
      {/* Main content - padding bottom for fixed footer on mobile */}
      <div class="pb-24 lg:pb-0">
        {local.children}
      </div>

      {/* Mobile: Fixed footer */}
      {local.footer && (
        <div class="fixed bottom-0 left-0 right-0 backdrop-blur border-t border-border lg:hidden bg-background/95">
          <div class="w-full max-w-lg mx-auto px-6 py-4 flex gap-3">
            {local.footer}
          </div>
        </div>
      )}
    </div>
  )
}

export interface PageHeaderProps {
  class?: string
  /** Back button handler - if provided, shows back button */
  onBack?: () => void
  /** Title text */
  title?: string
}

/**
 * Page header with optional back button.
 * Sits at top of content area (below photo on profile-style pages).
 */
export const PageHeader: ParentComponent<PageHeaderProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children', 'onBack', 'title'])

  return (
    <div class={cn('px-6 pt-6 lg:px-0 lg:pt-0', local.class)} {...others}>
      {local.children}
    </div>
  )
}

export interface PageContentProps {
  class?: string
}

/**
 * Main content area with consistent padding.
 */
export const PageContent: ParentComponent<PageContentProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children'])

  return (
    <div class={cn('px-6 py-6 lg:px-0', local.class)} {...others}>
      {local.children}
    </div>
  )
}

export interface PageFooterProps {
  class?: string
}

/**
 * Desktop-only inline footer (for buttons that appear inline on desktop).
 * On mobile, use PageLayout's footer prop instead for sticky behavior.
 */
export const PageFooterDesktop: ParentComponent<PageFooterProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children'])

  return (
    <div class={cn('hidden lg:flex gap-3 mt-8', local.class)} {...others}>
      {local.children}
    </div>
  )
}
