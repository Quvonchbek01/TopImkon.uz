'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  isThemePreference,
  nextTheme,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '@/lib/theme';

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  cycleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Notifies subscribers when this tab writes a new preference. */
const preferenceListeners = new Set<() => void>();

function readStoredPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : DEFAULT_THEME;
  } catch {
    // Storage can be blocked by the browser; the light default still applies.
    return DEFAULT_THEME;
  }
}

const getServerPreference = (): ThemePreference => DEFAULT_THEME;

function subscribeToPreference(onChange: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === THEME_STORAGE_KEY) onChange();
  };

  preferenceListeners.add(onChange);
  window.addEventListener('storage', handleStorage);

  return () => {
    preferenceListeners.delete(onChange);
    window.removeEventListener('storage', handleStorage);
  };
}

function writePreference(theme: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore: the theme still applies for this page view.
  }

  for (const listener of preferenceListeners) listener();
}

function readSystemPrefersDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

const getServerSystemPrefersDark = (): boolean => false;

function subscribeToSystem(onChange: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function applyResolvedTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // `useSyncExternalStore` reads localStorage and the OS setting during render
  // instead of copying them into state inside an effect, so a first visit and a
  // hydration pass both stay warning-free.
  const theme = useSyncExternalStore(
    subscribeToPreference,
    readStoredPreference,
    getServerPreference,
  );
  const systemPrefersDark = useSyncExternalStore(
    subscribeToSystem,
    readSystemPrefersDark,
    getServerSystemPrefersDark,
  );
  const resolvedTheme = resolveTheme(theme, systemPrefersDark);

  // The only side effect: mirror the resolved theme onto <html>, which the
  // pre-paint script in the layout already did for the first render.
  useEffect(() => {
    applyResolvedTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: ThemePreference) => {
    writePreference(next);
  }, []);

  const cycleTheme = useCallback(() => {
    writePreference(nextTheme(readStoredPreference()));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, cycleTheme }),
    [theme, resolvedTheme, setTheme, cycleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside <ThemeProvider>.');
  }

  return context;
}
