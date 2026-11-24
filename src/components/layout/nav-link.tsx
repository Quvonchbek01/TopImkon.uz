'use client';

import type { ReactNode } from 'react';

import { Link, usePathname } from '@/lib/i18n/navigation';
import { isActivePath } from '@/lib/navigation';
import { cn } from '@/lib/utils';

type NavLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
};

/** Locale-aware link that marks itself as the current page for assistive tech. */
export function NavLink({ href, children, className, activeClassName }: NavLinkProps) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(className, active && activeClassName)}
    >
      {children}
    </Link>
  );
}
