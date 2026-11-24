'use client';

import { useTranslations } from 'next-intl';

import { NavLink } from './nav-link';

const items = [
  { href: '/explore', labelKey: 'explore' },
  { href: '/about', labelKey: 'about' },
] as const;

/** Desktop top navigation (DESIGN.md section 5). Account links live in the avatar menu. */
export function DesktopNav({ className }: { className?: string }) {
  const t = useTranslations('nav');

  return (
    <nav aria-label={t('primary')} className={className}>
      <ul className="flex items-center gap-1">
        {items.map((item) => (
          <li key={item.href}>
            <NavLink
              href={item.href}
              className="inline-flex h-11 items-center rounded-md px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeClassName="text-foreground"
            >
              {t(item.labelKey)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
