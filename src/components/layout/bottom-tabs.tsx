'use client';

import { Bookmark, Compass, House, Sparkles, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/lib/i18n/navigation';
import { isActivePath } from '@/lib/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/', labelKey: 'home', icon: House },
  { href: '/explore', labelKey: 'explore', icon: Compass },
  { href: '/for-you', labelKey: 'forYou', icon: Sparkles },
  { href: '/saved', labelKey: 'saved', icon: Bookmark },
  { href: '/profile', labelKey: 'profile', icon: User },
] as const;

/**
 * Mobile bottom tab bar (DESIGN.md section 5): 5 items, 64px tall, active item
 * shows an orange icon on a peach pill. Respects the phone safe area.
 */
export function BottomTabs() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <nav
      aria-label={t('primary')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex h-16 w-full max-w-[1200px] items-stretch">
        {tabs.map((tab) => {
          const active = isActivePath(pathname, tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className="flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold"
              >
                <span
                  className={cn(
                    'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                    active ? 'bg-tag-orange-bg text-tag-orange-fg' : 'text-muted-foreground',
                  )}
                >
                  <tab.icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
                </span>
                <span className={active ? 'text-tag-orange-fg' : 'text-muted-foreground'}>
                  {t(tab.labelKey)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
