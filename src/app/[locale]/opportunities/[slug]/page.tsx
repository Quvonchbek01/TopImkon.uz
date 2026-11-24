import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { requireLocale } from '@/lib/i18n/server';

type OpportunityParams = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: OpportunityParams;
}): Promise<Metadata> {
  const locale = await requireLocale(params);
  const t = await getTranslations({ locale, namespace: 'pages.opportunity' });
  return { title: t('title'), description: t('description') };
}

/**
 * Detail page. Stage 3 loads the listing by slug, adds the key facts bar,
 * JSON-LD and the apply/save/share actions.
 */
export default async function OpportunityPage({ params }: { params: OpportunityParams }) {
  const { slug } = await params;
  await requireLocale(params);
  const t = await getTranslations('pages.opportunity');

  return (
    <PagePlaceholder title={t('title')} description={t('description')}>
      <p className="mt-4 font-mono text-sm text-muted-foreground">/{slug}</p>
    </PagePlaceholder>
  );
}
