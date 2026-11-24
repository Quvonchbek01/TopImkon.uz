import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { requireLocale, type LocaleParams } from '@/lib/i18n/server';

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await requireLocale(params);
  const t = await getTranslations({ locale, namespace: 'pages.privacy' });
  return { title: t('title'), description: t('description') };
}

/** The legal text is written together with the data model in Stage 2. */
export default async function PrivacyPage({ params }: { params: LocaleParams }) {
  const locale = await requireLocale(params);
  const t = await getTranslations({ locale, namespace: 'pages.privacy' });

  return <PagePlaceholder title={t('title')} description={t('description')} />;
}
