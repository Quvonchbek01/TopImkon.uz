import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { requireLocale, type LocaleParams } from '@/lib/i18n/server';

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await requireLocale(params);
  const t = await getTranslations({ locale, namespace: 'pages.about' });
  return { title: t('title'), description: t('description') };
}

/** Real copy arrives with the marketing pages in Stage 10. */
export default async function AboutPage({ params }: { params: LocaleParams }) {
  const locale = await requireLocale(params);
  const t = await getTranslations({ locale, namespace: 'pages.about' });

  return <PagePlaceholder title={t('title')} description={t('description')} />;
}
