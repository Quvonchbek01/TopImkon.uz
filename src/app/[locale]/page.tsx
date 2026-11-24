import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { SearchForm } from '@/components/search/search-form';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/lib/i18n/navigation';
import { requireLocale, type LocaleParams } from '@/lib/i18n/server';
import { typeSurfaceClass } from '@/lib/opportunity/type-color';
import type { OpportunityType } from '@/lib/opportunity/types';

/** Hero shortcuts (DESIGN.md section 10, home): six of the fourteen types. */
const shortcuts: OpportunityType[] = [
  'scholarship_master',
  'internship',
  'exchange',
  'summer_school',
  'competition',
  'fellowship',
];

const steps = [
  { titleKey: 'step1Title', bodyKey: 'step1Body' },
  { titleKey: 'step2Title', bodyKey: 'step2Body' },
  { titleKey: 'step3Title', bodyKey: 'step3Body' },
] as const;

/** Card shape of stage 3, rendered as a loading skeleton. */
function OpportunityCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-card">
      <div className="flex gap-2">
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-5 w-11/12" />
      <Skeleton className="mt-2 h-5 w-2/3" />
      <Skeleton className="mt-4 h-4 w-1/2" />
      <div className="mt-6 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Home screen. It takes `params` only so `requireLocale` can call
 * `setRequestLocale` — without that call the page falls back to dynamic
 * rendering and `/uz`, `/ru`, `/en` are server-rendered on every request.
 */
export default async function HomePage({ params }: { params: LocaleParams }) {
  const locale = await requireLocale(params);
  const t = await getTranslations('pages.home');
  const tTypes = await getTranslations('types');
  const tCommon = await getTranslations('common');

  return (
    <>
      {/* Hero band: orange-500 with espresso text and a large white search field. */}
      <section className="bg-orange-500">
        <div className="mx-auto w-full max-w-[1200px] px-4 pb-10 pt-10 sm:px-6 lg:px-8 lg:pb-14 lg:pt-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-espresso-900 sm:text-5xl lg:text-6xl">
              {t('title')}
            </h1>
            <p className="mt-4 max-w-[52ch] text-base leading-7 text-espresso-900/85 sm:text-lg">
              {t('subtitle')}
            </p>

            <SearchForm
              locale={locale}
              id="hero-search"
              variant="hero"
              placeholder={t('searchPlaceholder')}
              className="mt-6 max-w-2xl"
            />

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button asChild variant="dark" size="lg">
                <Link href="/explore">{t('exploreCta')}</Link>
              </Button>
              <Button asChild variant="onOrange" size="lg">
                <Link href="/auth/signup">{t('signupCta')}</Link>
              </Button>
            </div>
          </div>

          <h2 className="mt-8 text-xs font-bold uppercase tracking-wide text-espresso-900/70">
            {t('shortcutsTitle')}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {shortcuts.map((type) => (
              <li key={type}>
                <Link
                  href={`/explore?type=${type}`}
                  className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${typeSurfaceClass(type)}`}
                >
                  {tTypes(type)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Guests see "How it works" instead of the personalised feed (PROJECT_SPEC 10). */}
      <section className="bg-peach-50">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {t('howTitle')}
          </h2>
          <p className="mt-2 max-w-[60ch] text-muted-foreground">{t('howSubtitle')}</p>

          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.titleKey} className="rounded-lg bg-card p-5 shadow-card">
                <span className="tabular-nums flex size-10 items-center justify-center rounded-full bg-primary text-lg font-extrabold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-bold leading-7 text-foreground">
                  {t(step.titleKey)}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{t(step.bodyKey)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing-soon strip: horizontal scroll on mobile, three skeleton cards. */}
      <section className="pt-12 lg:pt-16">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {t('closingSoonTitle')}
              </h2>
              <p className="mt-2 text-muted-foreground">{t('closingSoonSubtitle')}</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-tag-teal-fg">
              <Link href="/explore?sort=deadline">
                {t('closingSoonCta')}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>

          <div
            aria-busy="true"
            className="-mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0"
          >
            <span className="sr-only">{tCommon('loading')}</span>
            {[0, 1, 2].map((index) => (
              <div key={index} className="w-[280px] shrink-0 snap-start sm:w-[320px]">
                <OpportunityCardSkeleton />
              </div>
            ))}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">{t('previewNote')}</p>
        </div>
      </section>

      {/* Featured grid. */}
      <section className="mt-12 bg-muted py-12 lg:mt-16 lg:py-16">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {t('featuredTitle')}
              </h2>
              <p className="mt-2 text-muted-foreground">{t('featuredSubtitle')}</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-tag-teal-fg">
              <Link href="/explore">
                {t('featuredCta')}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>

          <div aria-busy="true" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <span className="sr-only">{tCommon('loading')}</span>
            {[0, 1, 2, 3].map((index) => (
              <OpportunityCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
