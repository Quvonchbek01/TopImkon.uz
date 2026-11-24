'use client';

import { ChevronDown, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition, type ChangeEvent } from 'react';

import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { locales, type Locale } from '@/lib/i18n/routing';

/**
 * Locale switcher. A native <select> keeps it keyboard and screen-reader
 * friendly in a 44px tap target. The current query string is preserved so a
 * shared Explore link keeps its filters after switching language.
 */
export function LanguageSwitcher() {
  const t = useTranslations('language');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as Locale;
    if (nextLocale === locale) return;

    const search = window.location.search;
    startTransition(() => {
      router.replace(`${pathname}${search}`, { locale: nextLocale });
    });
  }

  return (
    <div className="relative flex items-center">
      <Globe
        aria-hidden="true"
        className="pointer-events-none absolute left-2 size-4 text-muted-foreground"
        strokeWidth={1.75}
      />
      <select
        value={locale}
        onChange={handleChange}
        disabled={isPending}
        aria-label={t('label')}
        title={t('label')}
        className="h-11 cursor-pointer appearance-none rounded-md bg-transparent py-0 pl-8 pr-7 text-sm font-semibold uppercase tracking-wide text-foreground hover:bg-accent disabled:opacity-60"
      >
        {locales.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-1.5 size-4 text-muted-foreground"
        strokeWidth={1.75}
      />
      <span className="sr-only" aria-live="polite">
        {t(locale as Locale)}
      </span>
    </div>
  );
}
