import createMiddleware from 'next-intl/middleware';

import { routing } from './lib/i18n/routing';

/**
 * Locale routing proxy (Next.js 16 renamed the `middleware` file convention to
 * `proxy`). Kept intentionally tiny (ARCHITECTURE.md section 3) so the project
 * stays portable to the Cloudflare Workers adapter.
 */
export default createMiddleware(routing);

export const config = {
  // Run on everything except API routes, Next.js internals and static files.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
