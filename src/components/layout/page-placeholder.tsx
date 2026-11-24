import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

/**
 * Shared body for the Stage 1 placeholder screens: a real, translated title and
 * description plus one visible note that the content arrives later.
 * Each route replaces this component with the real screen in its own stage.
 */
export function PagePlaceholder({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  const t = useTranslations('common');

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>

      {children}

      <p className="mt-8 flex items-start gap-3 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
        <Info
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-teal-700"
          strokeWidth={1.75}
        />
        <span>{t('stageNote')}</span>
      </p>
    </div>
  );
}
