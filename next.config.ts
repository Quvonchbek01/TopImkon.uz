import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Typed routes arrive with the real navigation in a later stage.
  typedRoutes: false,
};

export default withNextIntl(nextConfig);
