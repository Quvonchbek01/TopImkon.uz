'use client';

import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

/**
 * Error boundary for the locale segment. It is rendered inside the layout, so
 * the header, footer and theme provider stay mounted and the retry button can
 * re-render the failed segment without a full page reload.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col items-start gap-3 px-4 py-20 sm:px-6 lg:px-8">
      <AlertTriangle aria-hidden="true" className="size-8 text-destructive" strokeWidth={1.75} />
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        {t('errorTitle')}
      </h1>
      <p className="max-w-[52ch] text-muted-foreground">{t('errorBody')}</p>
      <Button size="lg" className="mt-3" onClick={() => reset()}>
        {t('retry')}
      </Button>
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground">ref: {error.digest}</p>
      ) : null}
    </div>
  );
}
