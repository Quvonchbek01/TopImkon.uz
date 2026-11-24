/**
 * Theme preference handling (DESIGN.md section 2.6).
 *
 * The user picks `light`, `dark` or `system`. The resolved theme is written to
 * `data-theme` on <html>, which drives the CSS variables in `styles/tokens.css`.
 * Everything in this file is pure so it can be unit tested.
 */

export const THEMES = ['light', 'dark', 'system'] as const;

export type ThemePreference = (typeof THEMES)[number];
export type ResolvedTheme = 'light' | 'dark';

export const DEFAULT_THEME: ThemePreference = 'system';

/** localStorage key, also used by the pre-paint script in `theme-script.ts`. */
export const THEME_STORAGE_KEY = 'topimkon-theme';

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

/** Turn a preference plus the OS setting into the theme that is actually shown. */
export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light';
  return preference;
}

/** light -> dark -> system -> light ... */
export function nextTheme(preference: ThemePreference): ThemePreference {
  const index = THEMES.indexOf(preference);
  return THEMES[(index + 1) % THEMES.length] ?? DEFAULT_THEME;
}
