import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/** Text input from DESIGN.md section 6.10: label above, errors below, 12px radius. */
export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'h-12 w-full min-w-0 rounded-md border border-input bg-card px-4 text-base text-foreground',
        'placeholder:text-muted-foreground',
        'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}
