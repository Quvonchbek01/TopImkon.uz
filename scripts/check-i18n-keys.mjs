#!/usr/bin/env node
/**
 * Fails if the three message files do not share exactly the same keys.
 * ARCHITECTURE.md section 14: "CI fails if a key exists in one language but is
 * missing in another."
 *
 * Usage: npm run i18n:check
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const MESSAGES_DIR = join(process.cwd(), 'src', 'messages');
const REQUIRED_LOCALES = ['uz', 'ru', 'en'];

/** @param {unknown} value @param {string} prefix @returns {string[]} */
function flattenKeys(value, prefix = '') {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

/** Collect empty string values so translators notice unfinished keys. */
/** @param {unknown} value @param {string} prefix @param {string[]} out */
function findEmptyValues(value, prefix = '', out = []) {
  if (typeof value === 'string') {
    if (value.trim() === '') out.push(prefix);
    return out;
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return out;

  for (const [key, child] of Object.entries(value)) {
    findEmptyValues(child, prefix ? `${prefix}.${key}` : key, out);
  }
  return out;
}

async function main() {
  const files = await readdir(MESSAGES_DIR);
  const localeFiles = files.filter((file) => file.endsWith('.json')).sort();
  const locales = localeFiles.map((file) => file.replace(/\.json$/, ''));

  const problems = [];
  for (const locale of REQUIRED_LOCALES) {
    if (!locales.includes(locale))
      problems.push(`missing message file: src/messages/${locale}.json`);
  }

  /** @type {Record<string, Set<string>>} */
  const keysByLocale = {};
  let allKeys = new Set();

  for (const file of localeFiles) {
    const raw = await readFile(join(MESSAGES_DIR, file), 'utf8');
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      problems.push(
        `${file}: invalid JSON (${error instanceof Error ? error.message : 'parse error'})`,
      );
      continue;
    }

    const locale = file.replace(/\.json$/, '');
    const keys = flattenKeys(parsed);
    keysByLocale[locale] = new Set(keys);
    allKeys = new Set([...allKeys, ...keys]);

    const empty = findEmptyValues(parsed);
    for (const key of empty) problems.push(`${file}: empty value for "${key}"`);

    const duplicates = keys.length - keysByLocale[locale].size;
    if (duplicates > 0) problems.push(`${file}: ${duplicates} duplicated key(s)`);
  }

  for (const [locale, keys] of Object.entries(keysByLocale)) {
    const missing = [...allKeys].filter((key) => !keys.has(key)).sort();
    for (const key of missing) problems.push(`${locale}.json: missing key "${key}"`);
  }

  if (problems.length > 0) {
    console.error('i18n check failed:\n');
    for (const problem of problems) console.error(`  - ${problem}`);
    console.error(`\n${problems.length} problem(s) found.`);
    process.exit(1);
  }

  console.log(
    `i18n check passed: ${allKeys.size} keys in ${locales.length} locales (${locales.join(', ')}).`,
  );
}

await main();
