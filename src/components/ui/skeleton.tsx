import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/**
 * Shimmering sand block used while data loads (DESIGN.md section 6.11).
 * The shimmer animation is switched off automatically for users who prefer
 * reduced motion (see the media query in `globals.css`).
 */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}
