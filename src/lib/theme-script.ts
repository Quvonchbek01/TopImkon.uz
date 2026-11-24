import { DEFAULT_THEME, THEME_STORAGE_KEY } from './theme';

/**
 * Inline script that runs before the first paint, so a dark-mode user never
 * sees a flash of the light theme. It mirrors `resolveTheme` from `theme.ts`.
 *
 * Rendered with `dangerouslySetInnerHTML` on purpose: it must not wait for React
 * hydration. A CSP nonce/hash will be added together with the security headers
 * in a later stage.
 */
export const themeInitScript = `(function(){try{var key=${JSON.stringify(
  THEME_STORAGE_KEY,
)};var stored=window.localStorage.getItem(key);var allowed=['light','dark','system'];var pref=allowed.indexOf(stored)===-1?${JSON.stringify(
  DEFAULT_THEME,
)}:stored;var dark=pref==='dark'||(pref==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var theme=dark?'dark':'light';var root=document.documentElement;root.setAttribute('data-theme',theme);root.style.colorScheme=theme;}catch(error){/* storage can be blocked; the CSS default is light */}})();`;
