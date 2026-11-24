import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { OpportunityCard } from '@/components/opportunity/opportunity-card';
import { Link } from '@/lib/i18n/navigation';
import { requireLocale, type LocaleParams } from '@/lib/i18n/server';
import { searchOpportunities, type OpportunitySearchResult } from '@/lib/opportunity/search';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/** Stage 2 reads live rows, so the page must not be cached at build time. */
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await requireLocale(params);
  const t = await getTranslations({ locale, namespace: 'pages.explore' });
  return { title: t('title'), description: t('description') };
}

function LoadFailure({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-8 rounded-md border border-border bg-card p-6">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

/**
 * Stage 2 explore screen: every published listing from the seed, ordered by the
 * nearest deadline. Stage 4 adds search, filters and pagination on top.
 */
export default async function ExplorePage({ params }: { params: LocaleParams }) {
  const locale = await requireLocale(params);
  const t = await getTranslations({ locale, namespace: 'pages.explore' });

  let result: OpportunitySearchResult | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    result = await searchOpportunities(supabase, { locale, limit: 100 });
  } catch (error) {
    // A missing .env.local or a stopped local stack lands here. Log the cause
    // for the developer and show the setup hint instead of a blank error page.
    console.error('[explore] could not load opportunities', error);
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        {t('title')}
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        {t('description')}
      </p>

      {result === null ? (
        <LoadFailure title={t('setupTitle')} body={t('setupBody')} />
      ) : result.items.length === 0 ? (
        <LoadFailure title={t('emptyTitle')} body={t('emptyBody')} />
      ) : (
        <>
          <p className="mt-6 text-sm font-semibold text-muted-foreground" role="status">
            {t('resultsCount', { count: result.totalCount })}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{t('demoNote')}</p>

          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((item) => (
              <li key={item.id} className="h-full">
                <Link
                  href={`/opportunities/${item.slug}`}
                  className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <OpportunityCard item={item} locale={locale} />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
