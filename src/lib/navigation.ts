/**
 * Small helpers for the navigation components. Kept separate from the
 * components so they can be unit tested without React.
 */

/** True when `pathname` is `href` or a child route of it. */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/' || pathname === '';
  return pathname === href || pathname.startsWith(`${href}/`);
}
