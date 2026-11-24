import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { requireLocale, type LocaleParams } from '@/lib/i18n/server';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Admin panel entry point. Stage 9 adds the role check (`admin`, `editor`) in
 * middleware plus the dashboard, listing CRUD, queues and audit log.
 */
export default async function AdminPage({ params }: { params: LocaleParams }) {
  const locale = await requireLocale(params);
  const t = await getTranslations({ locale, namespace: 'pages.admin' });

  return <PagePlaceholder title={t('title')} description={t('description')} />;
}
