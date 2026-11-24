import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { requireLocale, type LocaleParams } from '@/lib/i18n/server';

/** Core palette (DESIGN.md section 2.1) plus harmonizing colours (2.2). */
const coreTokens = [
  '--orange-500',
  '--orange-600',
  '--orange-700',
  '--apricot-400',
  '--peach-100',
  '--peach-50',
  '--cream-25',
  '--surface',
  '--espresso-900',
  '--cocoa-700',
  '--brown-500',
  '--sand-200',
  '--sand-100',
];

const accentTokens = [
  '--teal-700',
  '--teal-500',
  '--teal-100',
  '--sunflower-400',
  '--sunflower-100',
  '--sunflower-800',
  '--plum-600',
  '--plum-100',
  '--berry-600',
  '--berry-100',
];

function Swatch({ token }: { token: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div
        className="h-14 w-full rounded-sm border border-border"
        style={{ backgroundColor: `var(${token})` }}
      />
      <code className="mt-2 block text-xs font-semibold text-foreground">{token}</code>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border pt-8 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-extrabold tracking-tight text-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * Stage 1 visual check page for tokens and components. It exists so design
 * regressions are obvious while building the app and is hidden in production
 * builds unless `NEXT_PUBLIC_ENABLE_DESIGN_SYSTEM=true` (see `.env.example`).
 * `force-dynamic` keeps the check at request time instead of build time.
 */
export const dynamic = 'force-dynamic';

const designSystemEnabled =
  process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_ENABLE_DESIGN_SYSTEM === 'true';

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await requireLocale(params);
  if (!designSystemEnabled) return {};

  const t = await getTranslations({ locale, namespace: 'pages.devDesign' });

  return {
    title: t('title'),
    description: t('description'),
    robots: { index: false, follow: false },
  };
}

export default async function DesignPage({ params }: { params: LocaleParams }) {
  if (!designSystemEnabled) {
    notFound();
  }

  await requireLocale(params);
  const t = await getTranslations('dev');
  const tPage = await getTranslations('pages.devDesign');

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{tPage('title')}</h1>
        <p className="flex items-start gap-3 rounded-md border border-deadline-urgent-fg/30 bg-deadline-urgent-bg p-4 text-sm font-semibold text-deadline-urgent-fg">
          {t('warning')}
        </p>
        <p className="text-sm text-muted-foreground">{tPage('description')}</p>
      </header>

      <Section title={t('paletteCore')}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {coreTokens.map((token) => (
            <Swatch key={token} token={token} />
          ))}
        </div>
      </Section>

      <Section title={t('paletteAccent')}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {accentTokens.map((token) => (
            <Swatch key={token} token={token} />
          ))}
        </div>
      </Section>

      <Section title={t('semanticTitle')}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'background', className: 'bg-background text-foreground border-border' },
            { label: 'card', className: 'bg-card text-card-foreground border-border' },
            { label: 'muted', className: 'bg-muted text-foreground border-border' },
            { label: 'primary', className: 'bg-primary text-primary-foreground border-primary' },
            {
              label: 'secondary',
              className: 'bg-secondary text-secondary-foreground border-secondary',
            },
            { label: 'success', className: 'bg-success text-inverse-foreground border-success' },
            { label: 'warning', className: 'bg-warning-bg text-warning-fg border-warning-fg' },
            { label: 'info', className: 'bg-info-bg text-info-fg border-info-fg' },
            {
              label: 'destructive',
              className: 'bg-destructive text-destructive-foreground border-destructive',
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-md border p-4 text-sm font-semibold ${item.className}`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </Section>

      <Section title={t('typographyTitle')}>
        <div className="space-y-2 rounded-lg bg-card p-5 shadow-card">
          <p className="text-4xl font-extrabold leading-[1.1] tracking-tight">H1 · 36px / 800</p>
          <p className="text-2xl font-bold leading-8">H2 · 24px / 700</p>
          <p className="text-lg font-bold leading-7">H3 · 18px / 700</p>
          <p className="text-base leading-6">Body · 16px / 400 — oddiy matn oʻlchami.</p>
          <p className="text-sm leading-6 text-muted-foreground">Small · 14px / muted</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Caption · 12px / 600
          </p>
          <p className="tabular-nums text-base">1 234 567 · 12.05.2026</p>
        </div>
      </Section>

      <Section title={t('glyphTitle')}>
        <div className="rounded-lg bg-card p-5 shadow-card">
          <p className="text-lg leading-8">
            Oʻzbekiston — gʻalaba — taʼlim — maʼno — eʼlon — oʻqituvchi — gʻoya — ʼ
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t('glyphNote')}</p>
        </div>
      </Section>

      <Section title={t('buttonsTitle')}>
        <div className="rounded-lg bg-card p-5 shadow-card">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="dark">Dark</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="mt-4 rounded-md border border-espresso-900/35 bg-orange-500 p-4">
            <Button variant="onOrange">On orange</Button>
          </div>
        </div>
      </Section>

      <Section title={t('badgesTitle')}>
        <div className="flex flex-wrap gap-2 rounded-lg bg-card p-5 shadow-card">
          {(['orange', 'teal', 'sunflower', 'plum', 'espresso', 'berry'] as const).map((tone) => (
            <Badge key={tone} variant={tone}>
              {tone}
            </Badge>
          ))}
          <Badge variant="neutral">neutral</Badge>
          <Badge variant="outline">outline</Badge>
          <Badge variant="match">match</Badge>
          <Badge variant="urgent">urgent</Badge>
          <Badge variant="soon">soon</Badge>
          <Badge variant="warning">warning</Badge>
          <Badge variant="far">far</Badge>
          <Badge variant="closed">closed</Badge>
        </div>
      </Section>

      <Section title={t('cardsTitle')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="teal">grant</Badge>
                <Badge variant="soon">12 days left</Badge>
              </div>
              <CardTitle>Fulbright visiting scholar programme</CardTitle>
              <CardDescription>
                Open to researchers in the humanities and social sciences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Deadline: 04.12.2026 · Remote · Fully funded
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">View</Button>
              <Button size="sm" variant="outline">
                Save
              </Button>
            </CardFooter>
          </Card>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Raised surface</CardTitle>
              <CardDescription>The same card with the stronger shadow.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-peach-50 p-4 text-sm">
                Accent surface inside a card.
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title={t('skeletonsTitle')}>
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-3 rounded-lg bg-card p-5 shadow-card">
              <div className="flex gap-2">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
              </div>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </Section>

      <Section title={t('themeTitle')}>
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-card p-5 shadow-card">
          <ThemeToggle />
          <p className="text-sm text-muted-foreground">
            Light → dark → system. The choice is stored in <code>localStorage</code> and the system
            preference is followed when it is set to system.
          </p>
        </div>
      </Section>
    </div>
  );
}
