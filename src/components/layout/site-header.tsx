import { Search } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

import { SearchForm } from '@/components/search/search-form';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/i18n/navigation';

import { AccountMenu } from './account-menu';
import { DesktopNav } from './desktop-nav';
import { LanguageSwitcher } from './language-switcher';
import { Logo } from './logo';

/**
 * Sticky top bar (DESIGN.md section 5).
 * Mobile: logo, search icon, language, theme, avatar.
 * Desktop: logo, nav links, centred search field, language, theme, avatar menu.
 */
export async function SiteHeader() {
  const locale = await getLocale();
  const t = await getTranslations('search');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Logo />
        <DesktopNav className="ml-2 hidden lg:block" />

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <SearchForm locale={locale} id="header-search" className="hidden w-64 md:flex xl:w-80" />

          <Button asChild variant="ghost" size="icon" className="md:hidden">
            <Link href="/explore" aria-label={t('label')}>
              <Search aria-hidden="true" className="size-5" strokeWidth={1.75} />
            </Link>
          </Button>

          <LanguageSwitcher />
          <ThemeToggle />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
