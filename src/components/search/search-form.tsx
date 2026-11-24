import { Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type SearchFormProps = {
  locale: string;
  /** Unique id, because the header and the hero can both render the field. */
  id: string;
  variant?: 'compact' | 'hero';
  /** Overrides the default `search.placeholder`, for the hero copy. */
  placeholder?: string;
  className?: string;
};

/**
 * Search field from DESIGN.md section 6.4. It is a plain GET form, so searching
 * works before any JavaScript loads (the results page is built in Stage 4).
 */
export async function SearchForm({
  locale,
  id,
  variant = 'compact',
  placeholder,
  className,
}: SearchFormProps) {
  const t = await getTranslations('search');
  const isHero = variant === 'hero';

  return (
    <form
      action={`/${locale}/explore`}
      method="get"
      role="search"
      className={cn(
        'flex w-full gap-2',
        isHero ? 'flex-col sm:flex-row sm:items-center' : 'items-center',
        className,
      )}
    >
      <div className="relative flex-1">
        <label htmlFor={id} className="sr-only">
          {t('label')}
        </label>
        <Search
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground',
            isHero ? 'left-4 size-5' : 'left-3 size-4',
          )}
          strokeWidth={1.75}
        />
        <Input
          id={id}
          name="q"
          type="search"
          autoComplete="off"
          placeholder={placeholder ?? t('placeholder')}
          className={cn(
            isHero
              ? 'h-14 rounded-2xl border-transparent pl-12 pr-4 text-base shadow-card'
              : 'h-11 rounded-md pl-9 pr-3 text-sm',
          )}
        />
      </div>
      <Button
        type="submit"
        size={isHero ? 'lg' : 'icon'}
        aria-label={isHero ? undefined : t('submit')}
        className={isHero ? 'h-12 w-full sm:h-14 sm:w-auto' : 'size-11 shrink-0'}
      >
        {isHero ? t('submit') : <Search aria-hidden="true" className="size-4" />}
      </Button>
    </form>
  );
}
