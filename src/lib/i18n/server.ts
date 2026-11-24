import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { routing, type Locale } from './routing';

/** App Router passes route params as a promise in Next.js 15 and newer. */
export type LocaleParams = Promise<{ locale: string }>;

/**
 * Validates the `[locale]` segment and enables static rendering for the page.
 * Call it once at the top of every page and layout under `app/[locale]`.
 */
export async function requireLocale(params: LocaleParams): Promise<Locale> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  return locale;
}
