/**
 * Public site configuration. Only `NEXT_PUBLIC_*` variables may be read here,
 * because this module is imported by client components as well.
 */

const fallbackUrl = 'http://localhost:3000';

/**
 * `metadataBase` runs the value through `new URL()`, which throws on a bare
 * host such as `topimkon.uz`. Normalise the input here and fall back instead of
 * failing the build in `generateMetadata`.
 */
function readSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) return fallbackUrl;

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    console.warn(
      `NEXT_PUBLIC_SITE_URL is not a valid URL ("${value}"); using ${fallbackUrl} instead.`,
    );
    return fallbackUrl;
  }
}

export const siteConfig = {
  name: 'TopImkon',
  domain: 'topimkon.uz',
  url: readSiteUrl(),
} as const;
