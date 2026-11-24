import { describe, expect, it } from 'vitest';

import {
  DEFAULT_THEME,
  isThemePreference,
  nextTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  THEMES,
} from '@/lib/theme';
import { themeInitScript } from '@/lib/theme-script';

describe('isThemePreference', () => {
  it('accepts the three supported preferences', () => {
    expect(isThemePreference('light')).toBe(true);
    expect(isThemePreference('dark')).toBe(true);
    expect(isThemePreference('system')).toBe(true);
  });

  it('rejects anything else that may be sitting in localStorage', () => {
    expect(isThemePreference('')).toBe(false);
    expect(isThemePreference('Dark')).toBe(false);
    expect(isThemePreference('auto')).toBe(false);
    expect(isThemePreference(null)).toBe(false);
    expect(isThemePreference({ theme: 'dark' })).toBe(false);
  });
});

describe('resolveTheme', () => {
  it('follows the system setting for the system preference', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('ignores the system setting for an explicit preference', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

describe('nextTheme', () => {
  it('cycles light -> dark -> system -> light', () => {
    expect(nextTheme('light')).toBe('dark');
    expect(nextTheme('dark')).toBe('system');
    expect(nextTheme('system')).toBe('light');
  });

  it('visits every preference exactly once per cycle', () => {
    const seen = new Set<string>();
    let preference = DEFAULT_THEME;
    for (let step = 0; step < THEMES.length; step += 1) {
      seen.add(preference);
      preference = nextTheme(preference);
    }
    expect(seen.size).toBe(THEMES.length);
    expect(preference).toBe(DEFAULT_THEME);
  });
});

describe('themeInitScript', () => {
  it('reads the same storage key as the provider', () => {
    expect(themeInitScript).toContain(THEME_STORAGE_KEY);
  });

  it('sets data-theme before the first paint and never throws', () => {
    expect(themeInitScript).toContain("setAttribute('data-theme'");
    expect(themeInitScript).toContain('try{');
    expect(themeInitScript).toContain('catch(error)');
  });
});
