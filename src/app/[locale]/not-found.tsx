import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { Link } from '@/lib/i18n/navigation';

/**
 * Locale-aware 404. `notFound()` from any nested route renders this inside the
 * normal header/footer shell, so the user can navigate away without a reload.
 *
 * No `metadata` export: Next.js injects `<meta name="robots" content="noindex">`
 * itself for every 404 response, and a nested `not-found` file does not support
 * metadata anyway.
 */
export default async function LocaleNotFound() {
  const t = await getTranslations('common');

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col items-start gap-3 px-4 py-20 sm:px-6 lg:px-8">
      <p className="font-mono text-sm font-bold text-muted-foreground">404</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        {t('notFoundTitle')}
      </h1>
      <p className="max-w-[52ch] text-muted-foreground">{t('notFoundBody')}</p>
      <Button asChild size="lg" className="mt-3">
        <Link href="/">{t('backHome')}</Link>
      </Button>
    </div>
  );
}
