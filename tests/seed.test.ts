import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Static checks on `supabase/seed.sql`. They run without a database, so CI keeps
 * the demo data complete even when nobody executed `npm run db:reset`.
 *
 * The seed writes translations with a `with ... as (values ...)` block, one row
 * per (slug, locale); the insert at the end joins them to the listings by slug.
 * A typo in a slug therefore drops a translation silently in Postgres, which is
 * exactly what these assertions catch.
 */

const SEED_SQL = readFileSync(join(process.cwd(), 'supabase', 'seed.sql'), 'utf8');

const LOCALES = ['en', 'uz', 'ru'] as const;

/** Matches translation rows such as `  ('demo-kyoto-robotics-summer-school', 'en', 'Title', ...`. */
const TRANSLATION_ROW = /^ {2}\('([a-z0-9-]+)', '(en|uz|ru)',/gm;

type TranslationRow = { slug: string; locale: (typeof LOCALES)[number] };

function translationRows(): TranslationRow[] {
  return [...SEED_SQL.matchAll(TRANSLATION_ROW)].map((match) => ({
    slug: match[1]!,
    locale: match[2]! as (typeof LOCALES)[number],
  }));
}

const rows = translationRows();
const slugs = [...new Set(rows.map((row) => row.slug))];

describe('seed.sql', () => {
  it('ends the translations block with an insert that joins on slug', () => {
    expect(SEED_SQL).toContain('insert into public.opportunity_translations');
    expect(SEED_SQL).toContain('join public.opportunities o on o.slug = tr.slug');
  });

  it('contains translations for the demo listings', () => {
    expect(slugs.length).toBeGreaterThanOrEqual(40);
    expect(slugs.every((slug) => slug.startsWith('demo-'))).toBe(true);
  });

  it('gives every demo listing exactly one row per locale', () => {
    for (const slug of slugs) {
      const locales = rows
        .filter((row) => row.slug === slug)
        .map((row) => row.locale)
        .sort();

      expect(locales, `translations for ${slug}`).toEqual([...LOCALES].sort());
    }
  });

  it('never repeats the same slug and locale pair', () => {
    const seen = new Set(rows.map((row) => `${row.slug}|${row.locale}`));
    expect(seen.size).toBe(rows.length);
  });

  it('uses the Uzbek modifier letters in the Uzbek titles', () => {
    const uzRows = rows.filter((row) => row.locale === 'uz');
    expect(uzRows.length).toBeGreaterThan(0);
    expect(SEED_SQL).toMatch(/[ʻʼ]/);
  });
});
