import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { requireLocale, type LocaleParams } from '@/lib/i18n/server';

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await requireLocale(params);
  const t = await getTranslations({ locale, namespace: 'pages.signup' });
  return { title: t('title'), description: t('description') };
}

/** Stage 2 replaces this with the sign-up form. */
export default async function SignupPage({ params }: { params: LocaleParams }) {
  const locale = await requireLocale(params);
  const t = await getTranslations({ locale, namespace: 'pages.signup' });

  return <PagePlaceholder title={t('title')} description={t('description')} />;
}
