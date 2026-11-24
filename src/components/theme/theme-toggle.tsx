'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import type { ThemePreference } from '@/lib/theme';

import { useTheme } from './theme-provider';

const icons: Record<ThemePreference, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

/**
 * Cycles light -> dark -> system (DESIGN.md section 2.6). The current state is
 * announced through the button title; the icon shows it visually.
 */
export function ThemeToggle() {
  const t = useTranslations('theme');
  const { theme, cycleTheme } = useTheme();

  const Icon = icons[theme];

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label={`${t('switchLabel')}: ${t(theme)}`}
      title={`${t('label')}: ${t(theme)}`}
      className="text-muted-foreground hover:text-foreground"
    >
      <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
    </Button>
  );
}
