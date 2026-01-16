import { type JSX, splitProps } from 'solid-js'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-md hover:bg-primary-hover hover:shadow-lg',
        secondary:
          'bg-secondary text-secondary-foreground shadow-md hover:bg-secondary-hover hover:shadow-lg',
        outline:
          'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
        ghost:
          'hover:bg-accent hover:text-accent-foreground',
        muted:
          'bg-muted text-muted-foreground hover:bg-accent',
        like:
          'bg-like text-white shadow-md hover:shadow-glow-rose',
        pass:
          'bg-pass text-white hover:bg-zinc-500',
        superlike:
          'bg-superlike text-white shadow-md hover:shadow-glow-violet',
        gradient:
          'bg-gradient-to-r from-secondary to-primary text-white shadow-lg hover:shadow-xl hover:brightness-110',
        link:
          'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        default: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
        'icon-xl': 'h-16 w-16',
      },
      rounded: {
        default: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
    },
  }
)

export interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export function Button(props: ButtonProps) {
  const [local, others] = splitProps(props, [
    'variant',
    'size',
    'rounded',
    'class',
    'children',
    'loading',
    'disabled',
  ])

  return (
    <button
      class={cn(
        buttonVariants({
          variant: local.variant,
          size: local.size,
          rounded: local.rounded,
        }),
        local.class
      )}
      disabled={local.disabled || local.loading}
      {...others}
    >
      {local.loading ? (
        <svg
          class="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : null}
      {local.children}
    </button>
  )
}

export { buttonVariants }
