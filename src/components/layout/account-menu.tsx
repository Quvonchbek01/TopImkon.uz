'use client';

import { Bell, Bookmark, ChevronDown, ClipboardList, LogIn, Sparkles, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';

import { Link } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils';

const items = [
  { href: '/for-you', labelKey: 'forYou', icon: Sparkles },
  { href: '/saved', labelKey: 'saved', icon: Bookmark },
  { href: '/tracker', labelKey: 'tracker', icon: ClipboardList },
  { href: '/alerts', labelKey: 'alerts', icon: Bell },
  { href: '/profile', labelKey: 'profile', icon: User },
] as const;

/**
 * Avatar menu with the account links (DESIGN.md section 5: For You, Saved and
 * Tracker live here on desktop). A disclosure pattern is used instead of
 * `role="menu"` so nothing promises arrow-key navigation we do not implement.
 */
export function AccountMenu() {
  const t = useTranslations('nav');
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t('account')}
        className="inline-flex h-11 items-center gap-1 rounded-md px-1 text-foreground hover:bg-accent"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-peach-100 text-tag-orange-fg">
          <User aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'hidden size-4 text-muted-foreground transition-transform sm:block',
            open && 'rotate-180',
          )}
          strokeWidth={1.75}
        />
      </button>

      {open ? (
        <div
          id={menuId}
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 rounded-md border border-border bg-popover p-1.5 text-popover-foreground shadow-raised"
        >
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('account')}
          </p>
          <ul className="flex flex-col">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-sm px-3 text-sm font-semibold text-foreground hover:bg-accent"
                >
                  <item.icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="my-1.5 border-t border-border" />
          <Link
            href="/auth/login"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-3 rounded-sm px-3 text-sm font-semibold text-foreground hover:bg-accent"
          >
            <LogIn aria-hidden="true" className="size-5" strokeWidth={1.75} />
            {t('login')}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
