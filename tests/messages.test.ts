import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Guards the three message files against drift. The runtime `i18n:check` script
 * compares keys as well; this test keeps the same guarantee inside CI's test run
 * and additionally rejects empty strings, because next-intl renders those as
 * blank UI instead of failing loudly.
 */

const LOCALES = ['uz', 'ru', 'en'] as const;
const MESSAGES_DIR = join(process.cwd(), 'src', 'messages');

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function loadMessages(locale: (typeof LOCALES)[number]): Record<string, Json> {
  return JSON.parse(readFileSync(join(MESSAGES_DIR, `${locale}.json`), 'utf8')) as Record<
    string,
    Json
  >;
}

function flatten(value: Record<string, Json>, prefix = ''): Map<string, string> {
  const entries = new Map<string, string>();
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === 'object' && !Array.isArray(child)) {
      for (const [childPath, leaf] of flatten(child as Record<string, Json>, path)) {
        entries.set(childPath, leaf);
      }
    } else {
      entries.set(path, String(child));
    }
  }
  return entries;
}

const messages = Object.fromEntries(
  LOCALES.map((locale) => [locale, flatten(loadMessages(locale))]),
) as Record<(typeof LOCALES)[number], Map<string, string>>;

describe('message files', () => {
  it('have exactly the same keys in every locale', () => {
    const reference = [...messages.uz.keys()].sort();
    for (const locale of LOCALES) {
      expect([...messages[locale].keys()].sort(), `keys in ${locale}.json`).toEqual(reference);
    }
  });

  it('contain no empty strings', () => {
    for (const locale of LOCALES) {
      const empty = [...messages[locale]]
        .filter(([, text]) => text.trim() === '')
        .map(([key]) => key);
      expect(empty, `empty values in ${locale}.json`).toEqual([]);
    }
  });

  it('keep the same ICU placeholders in every locale', () => {
    const placeholders = (text: string) =>
      [...text.matchAll(/\{(\w+)/g)].map((match) => match[1]).sort();

    for (const [key, uzText] of messages.uz) {
      const expected = placeholders(uzText);
      for (const locale of LOCALES) {
        expect(placeholders(messages[locale].get(key) ?? ''), `${key} in ${locale}.json`).toEqual(
          expected,
        );
      }
    }
  });

  it('translate the navigation and opportunity type labels', () => {
    for (const locale of LOCALES) {
      expect(messages[locale].get('nav.home')).toBeTruthy();
      expect(messages[locale].get('types.internship')).toBeTruthy();
      expect(messages[locale].get('pages.home.featuredTitle')).toBeTruthy();
    }
  });
});
