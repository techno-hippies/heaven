import { Show, type Component, type JSX } from 'solid-js'
import { splitProps } from 'solid-js'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full bg-muted',
  {
    variants: {
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
        '2xl': 'h-24 w-24',
        '3xl': 'h-32 w-32',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface AvatarProps extends JSX.HTMLAttributes<HTMLDivElement>, VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
  /** Show online status indicator */
  online?: boolean
}

export const Avatar: Component<AvatarProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'size', 'src', 'alt', 'fallback', 'online', 'children'])

  const getFallbackInitial = () => {
    if (local.fallback) return local.fallback.charAt(0).toUpperCase()
    if (local.alt) return local.alt.charAt(0).toUpperCase()
    return '?'
  }

  return (
    <div class={cn(avatarVariants({ size: local.size }), 'relative', local.class)} {...others}>
      <Show
        when={local.src}
        fallback={
          <div class="flex h-full w-full items-center justify-center bg-secondary">
            <span class="text-sm font-medium text-muted-foreground">
              {getFallbackInitial()}
            </span>
          </div>
        }
      >
        <img
          src={local.src}
          alt={local.alt || ''}
          class="aspect-square h-full w-full object-cover"
        />
      </Show>
      {local.children}
      {/* Online status indicator */}
      <Show when={local.online}>
        <span class="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background animate-status-glow" />
      </Show>
    </div>
  )
}
