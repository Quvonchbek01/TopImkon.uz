import { getTranslations } from 'next-intl/server';

import { Link } from '@/lib/i18n/navigation';

import { Logo } from './logo';

const pages = [
  { href: '/explore', labelKey: 'explore' },
  { href: '/about', labelKey: 'about' },
  { href: '/suggest', labelKey: 'suggest' },
] as const;

const legal = [
  { href: '/privacy', labelKey: 'privacy' },
  { href: '/terms', labelKey: 'terms' },
  { href: '/contact', labelKey: 'contact' },
] as const;

/** Deep espresso footer with cream text and orange hover links (DESIGN.md section 5). */
export async function SiteFooter() {
  const t = await getTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-inverse text-inverse-foreground">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.6fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <Logo tone="inverse" />
          <p className="mt-4 text-sm leading-6 text-inverse-muted">{t('tagline')}</p>
        </div>

        <nav aria-label={t('navTitle')}>
          <h2 className="text-sm font-bold uppercase tracking-wide text-inverse-foreground">
            {t('navTitle')}
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {pages.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="text-sm text-inverse-muted transition-colors hover:text-inverse-accent"
                >
                  {t(page.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t('legalTitle')}>
          <h2 className="text-sm font-bold uppercase tracking-wide text-inverse-foreground">
            {t('legalTitle')}
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {legal.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="text-sm text-inverse-muted transition-colors hover:text-inverse-accent"
                >
                  {t(page.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-inverse-foreground/15">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-sm text-inverse-muted">{t('copyright', { year })}</p>
        </div>
      </div>
    </footer>
  );
}
