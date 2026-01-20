import { splitProps, type Component, type JSX } from 'solid-js'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-border bg-transparent text-foreground hover:bg-secondary/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'text-foreground hover:bg-white/5',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-12 px-8',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-11 w-11',
        'icon-sm': 'h-9 w-9',
        'icon-lg': 'h-14 w-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button: Component<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'variant', 'size', 'children'])

  return (
    <button
      class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
      {...others}
    >
      {local.children}
    </button>
  )
}

export { buttonVariants }
