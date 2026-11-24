# TopImkon.uz

TopImkon helps students in Uzbekistan find scholarships, olympiads, internships, grants
and volunteer programs in one place — in Uzbek, Russian and English.

This repository currently contains **Stage 1 (foundation)** and **Stage 2 (database)**: the app
shell, the design system, three-language routing, the Supabase schema with 40 demo listings
in Uzbek, Russian and English, generated TypeScript types and the first real `/explore`
screen. Search, filters, accounts, saving and personalisation arrive in the next stages (see
`STAGE_PROMPTS.md`).

---

## 1. What you need installed

| Tool    | Version                            | How to check    |
| ------- | ---------------------------------- | --------------- |
| Node.js | 20.9 or newer (22 LTS recommended) | `node -v`       |
| npm     | ships with Node.js                 | `npm -v`        |
| Git     | any recent version                 | `git --version` |

Editor: VS Code with the "Prettier" and "ESLint" extensions is recommended. The project
already contains the shared settings, so formatting happens on save.

## 2. First run (step by step)

```bash
# 1. Go to the project folder
cd topimkon

# 2. Install dependencies (once, or after package.json changes)
npm install

# 3. Create your local environment file
#    Windows (PowerShell):  Copy-Item .env.example .env.local
#    macOS / Linux:         cp .env.example .env.local

# 4. Start the local Supabase stack (Docker Desktop must be running)
npm run supabase:start

# 5. Apply the migrations and the demo data (40 listings × 3 languages)
npm run db:reset

# 6. Copy the Project URL and anon key printed by `supabase:start` into .env.local
#    NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from the same output>

# 7. Start the development server
npm run dev
```

Open <http://localhost:3000> — you are redirected to <http://localhost:3000/uz>.
Other languages: `/ru` and `/en`. The demo listings appear on `/uz/explore`.

> `.env.local` is git-ignored. Only variables starting with `NEXT_PUBLIC_` reach the
> browser; everything else stays on the server. Without the Supabase values the app still
> runs, but `/explore` shows a setup hint instead of listings.

## 3. Scripts

| Command                  | What it does                                              |
| ------------------------ | --------------------------------------------------------- |
| `npm run dev`            | Development server with hot reload on port 3000           |
| `npm run build`          | Production build (also type-checks the project)           |
| `npm run start`          | Serves the production build (run `build` first)           |
| `npm run typecheck`      | TypeScript only, no output files (`tsc --noEmit`)         |
| `npm run lint`           | ESLint with the Next.js rules                             |
| `npm run test`           | Unit tests once (`vitest run`)                            |
| `npm run test:watch`     | Unit tests in watch mode                                  |
| `npm run i18n:check`     | Fails if `uz`, `ru` and `en` message files differ         |
| `npm run supabase:start` | Starts the local Supabase stack (Docker must run)         |
| `npm run supabase:stop`  | Stops the stack; the database stays in a Docker volume    |
| `npm run db:reset`       | Rebuilds the database from migrations + `seed.sql`        |
| `npm run db:types`       | Regenerates `src/lib/database.types.ts` from local DB     |
| `npm run format`         | Rewrites files with Prettier                              |
| `npm run format:check`   | Fails if a file is not Prettier-formatted                 |
| `npm run check`          | typecheck + lint + i18n + tests (use before every commit) |

`npm run check` and `npm run build` must both pass before you push. CI runs the same
commands on GitHub Actions (`.github/workflows/ci.yml`).

## 4. Project structure

```
src/
  app/
    globals.css              Tailwind entry: imports tokens + base styles
    icon.svg                 Brand mark used as the favicon
    [locale]/                every page lives under /uz, /ru, /en
      layout.tsx             <html>, Manrope font, header, footer, theme provider
      page.tsx               Home (hero, quick types, how-it-works)
      error.tsx              Error boundary for the locale segment
      not-found.tsx          404 inside the layout
      [...rest]/page.tsx     Sends unknown locale paths to that 404
      dev/design/page.tsx    Visual check of tokens and components (dev only)
      ...                    one folder per route from PROJECT_SPEC section 10
  components/
    layout/                  site header, nav, language switcher, bottom tabs, footer
    opportunity/             listing card rendered by /explore
    theme/                   theme provider + toggle (light / dark / system)
    ui/                      button, badge, card, input, skeleton
    search/                  search form
  lib/
    database.types.ts        generated from the local schema (`npm run db:types`)
    i18n/                    next-intl routing, request config, navigation helpers
    opportunity/             domain types, deadline helpers, type colours, search wrapper
    supabase/                server, browser and service-role Supabase clients
    navigation.ts            nav model + active-link logic
    theme.ts                 theme constants and storage keys
    site.ts                  site name, URL and domain
  messages/                  uz.json, ru.json, en.json (same keys, checked in CI)
  styles/tokens.css          design tokens as CSS variables (light + dark)
  proxy.ts                   locale routing (Next.js 16 `proxy` convention)
supabase/
  config.toml                local stack settings (ports, auth, storage)
  migrations/                0001-0006: extensions, schema, RLS, search functions
  seed.sql                   demo organizations, 40 listings and 120 translations
tests/                       Vitest suites (navigation, deadlines, types, theme, i18n, seed, RLS)
scripts/check-i18n-keys.mjs  message-file parity check used by CI
```

## 5. Languages

- Locales: `uz` (default), `ru`, `en`; the prefix is always in the URL
  (`localePrefix: 'always'`).
- All interface text lives in `src/messages/<locale>.json`.
- Adding text: add the key to **all three** files, then read it with
  `useTranslations('namespace')` in client components or `getTranslations('namespace')`
  in server components.
- `npm run i18n:check` (also part of `npm run check` and CI) fails when a key is missing
  in one language, a value is empty, or ICU placeholders differ between languages.
- `<html lang>` comes from the route, so screen readers and search engines get the right
  language.

## 6. Design system

- Colours, spacing, radii and shadows are CSS variables in `src/styles/tokens.css`, mapped
  to Tailwind classes (`bg-primary`, `text-foreground`, …) by the `@theme inline` block at
  the end of that same file.
- Dark mode is class based: `<html data-theme="dark">`. Users pick Light / Dark / System
  in the header; the choice is stored in `localStorage` and applied before the first paint
  (`src/lib/theme-script.ts`) so there is no colour flash.
- Font: Manrope via `next/font` (self-hosted, no request to Google at runtime).
- Open **`/uz/dev/design`** while `npm run dev` runs to see swatches, the type scale,
  buttons, badges, cards, skeletons and the Uzbek glyph test (oʻ, gʻ, ʻ, ʼ). The page
  returns 404 in production builds unless `NEXT_PUBLIC_ENABLE_DESIGN_SYSTEM=true` is set
  for a short design review.

## 7. Database (Supabase)

The schema lives in `supabase/migrations` (never edit a file that has already been applied —
add a new numbered one) and the demo data in `supabase/seed.sql`.

| File                           | Contents                                                     |
| ------------------------------ | ------------------------------------------------------------ |
| `0001_init.sql`                | extensions (`pg_trgm`, `unaccent`, `pgcrypto`) and helpers   |
| `0002_profiles.sql`            | profiles, notification settings, staff roles, signup trigger |
| `0003_opportunities.sql`       | organizations, listings, translations, search trigger, RLS   |
| `0004_user_data.sql`           | saves, tracker, saved searches, events, reports, suggestions |
| `0005_notifications_admin.sql` | notification queue + audit log (service role only)           |
| `0006_functions.sql`           | `search_opportunities(jsonb)` and `archive_expired()`        |

**Seed data.** `supabase/seed.sql` inserts 27 organizations, 40 published demo listings and one
translation per locale (120 rows: en, uz, ru). The translations are written as a
`with tr as (values ...)` block and joined to the listings by slug, so a wrong slug would drop
a row silently — `tests/seed.test.ts` guards that without touching a database.

**Row level security.** Every table enables RLS in the migration that creates it. Guests and
signed-in users read only `status = 'published'` listings (and the translations and
organizations behind them); `saved_opportunities`, `tracker_entries`, `saved_searches`,
`user_events`, `reports` and `suggestions` are limited to `user_id = auth.uid()`;
`notification_queue`, `audit_log` and `admin_roles` have no client policies and are reachable
only through the service-role key.

**Clients.** Pages use `createSupabaseServerClient()` (cookies + anon key, RLS applied),
client components use `createSupabaseBrowserClient()`, and server jobs use
`createSupabaseAdminClient()` (service role, bypasses RLS — never import it into a page).

**Types.** `src/lib/database.types.ts` is generated, not hand-written. After a migration run:

```bash
npm run db:reset   # apply migrations + seed
npm run db:types   # rewrite src/lib/database.types.ts
```

**Testing RLS.** `tests/rls.test.ts` talks to the local stack with the anon key. It is skipped
unless both variables are set:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL='http://127.0.0.1:54321'
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY='<anon key from npm run supabase:start>'
npm run test
```

**Resetting.** `npm run db:reset` drops and recreates the local database, then runs
`supabase/seed.sql` again — manual edits in the local database are lost.

## 8. Tests

```bash
npm run test          # once
npm run test:watch    # while developing
```

Suites in `tests/` cover the navigation model and active links, deadline helpers, opportunity
types and colours, theme storage, the message files (key parity, no empty values, ICU
placeholder parity), the seed file (every demo listing has en/uz/ru translations) and the row
level security rules (skipped while no local database is configured).

## 9. Troubleshooting

| Problem                                     | Fix                                                                                                                           |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `npm run start` says the build is missing   | Run `npm run build` first                                                                                                     |
| Port 3000 is busy                           | `npm run dev -- -p 3001`, then open localhost:3001                                                                            |
| Node version error during install           | Install Node 22 LTS (`node -v` must be ≥ 20.9)                                                                                |
| `npm` says `npm.ps1 cannot be loaded`       | PowerShell blocks scripts. Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or call `npm.cmd` instead of `npm` |
| Lint or types fail after pulling            | `npm install`, then `npm run check`                                                                                           |
| Text looks unstyled                         | Restart `npm run dev` after CSS/Tailwind changes                                                                              |
| `supabase start` says Docker is not running | Start Docker Desktop and wait until it reports "running"                                                                      |
| `supabase start` stops with "out of memory" | Give Docker Desktop more memory, or close other apps                                                                          |
| `/explore` shows the "database" hint        | Fill the Supabase values in `.env.local`, then `db:reset`                                                                     |
| Ports 54321-54324 are taken                 | Stop the other Supabase project (`npm run supabase:stop`)                                                                     |

## 10. Deployment (later stages)

Target: Vercel for the Next.js app and Supabase for the database, per
`ARCHITECTURE.md`. Build command `npm run build`; Next.js handles the output. Add the
variables from `.env.example` in the hosting dashboard — never commit real values.
