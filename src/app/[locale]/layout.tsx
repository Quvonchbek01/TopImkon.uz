import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { BottomTabs } from '@/components/layout/bottom-tabs';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { routing, type Locale } from '@/lib/i18n/routing';
import { siteConfig } from '@/lib/site';
import { themeInitScript } from '@/lib/theme-script';

/**
 * Manrope (DESIGN.md section 3). Google Fonts serves Latin and Cyrillic subsets;
 * Next.js self-hosts the files, so no request goes to Google at runtime.
 * `latin` includes U+02BB (ʻ) and U+02BC (ʼ) used by Uzbek.
 */
const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

/** Open Graph wants `language_TERRITORY` codes, not the bare locale codes. */
const OG_LOCALES: Record<Locale, string> = {
  uz: 'uz_UZ',
  ru: 'ru_RU',
  en: 'en_US',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFAF4' },
    { media: '(prefers-color-scheme: dark)', color: '#1A100A' },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'pages.home' });

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} — ${t('title')}`,
      template: `%s · ${siteConfig.domain}`,
    },
    description: t('subtitle'),
    applicationName: siteConfig.name,
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      locale: OG_LOCALES[locale],
      alternateLocale: routing.locales
        .filter((item) => item !== locale)
        .map((item) => OG_LOCALES[item]),
      title: `${siteConfig.name} — ${t('title')}`,
      description: t('subtitle'),
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations('common');

  return (
    <html lang={locale} dir="ltr" className={manrope.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {/* Applies the saved theme before first paint to avoid a colour flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />

        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:font-bold focus:text-primary-foreground"
            >
              {t('skipToContent')}
            </a>

            {/* The mobile tab bar adds the safe-area inset, so the page reserves both. */}
            <div className="flex min-h-dvh flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
              <SiteHeader />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <SiteFooter />
            </div>

            <BottomTabs />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
