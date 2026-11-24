import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/**
 * Pills from DESIGN.md sections 2.4, 2.5 and 6.5: 28px tall, caption size.
 * Colours come from themed tokens so light and dark mode both pass AA.
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-3 text-xs font-semibold whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'bg-muted text-foreground',
        outline: 'border border-border bg-card text-muted-foreground',
        orange: 'bg-tag-orange-bg text-tag-orange-fg',
        teal: 'bg-tag-teal-bg text-tag-teal-fg',
        sunflower: 'bg-tag-sunflower-bg text-tag-sunflower-fg',
        plum: 'bg-tag-plum-bg text-tag-plum-fg',
        espresso: 'bg-tag-espresso-bg text-tag-espresso-fg',
        berry: 'bg-tag-berry-bg text-tag-berry-fg',
        match: 'bg-sunflower-400 text-espresso-900',
        urgent: 'bg-deadline-urgent-bg text-deadline-urgent-fg',
        soon: 'bg-deadline-soon-bg text-deadline-soon-fg',
        warning: 'bg-deadline-warning-bg text-deadline-warning-fg',
        far: 'bg-deadline-far-bg text-deadline-far-fg',
        closed: 'bg-muted text-muted-foreground line-through decoration-1',
      },
      size: {
        default: 'h-7',
        sm: 'h-6 px-2.5',
        lg: 'h-8 px-3.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'default',
    },
  },
);

export type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { badgeVariants };
