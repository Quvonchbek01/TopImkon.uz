import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { requireLocale, type LocaleParams } from '@/lib/i18n/server';

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await requireLocale(params);
  const t = await getTranslations({ locale, namespace: 'pages.contact' });
  return { title: t('title'), description: t('description') };
}

/** Stage 10 adds the contact form and the support address. */
export default async function ContactPage({ params }: { params: LocaleParams }) {
  const locale = await requireLocale(params);
  const t = await getTranslations({ locale, namespace: 'pages.contact' });

  return <PagePlaceholder title={t('title')} description={t('description')} />;
}
