import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/**
 * Button styles from DESIGN.md section 6.1.
 * min tap target 44px (section 9), focus ring comes from the global
 * `:focus-visible` rule so it is visible on orange and cream alike.
 */
const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-bold whitespace-nowrap transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-hover-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-teal-100',
        dark: 'bg-espresso-900 text-inverse-foreground hover:bg-cocoa-700',
        onOrange:
          'border border-espresso-900/35 text-espresso-900 hover:bg-white/25 hover:text-espresso-900',
        outline: 'border border-border bg-card text-foreground hover:bg-accent',
        ghost: 'text-foreground hover:bg-accent',
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
        link: 'text-teal-700 underline underline-offset-4 hover:text-orange-700',
      },
      size: {
        sm: 'h-11 px-3 text-sm',
        default: 'h-12 px-5 text-base',
        lg: 'h-14 px-6 text-lg',
        icon: 'size-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Render the child element (for example a link) with button styles. */
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot : 'button';
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
