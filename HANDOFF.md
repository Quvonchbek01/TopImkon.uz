# HANDOFF — TopImkon.uz, Stage 1 + Stage 2

Prepared: 2026-11-24
Audience: the engineer taking over before Stage 3 (auth, accounts, saving).

This file is deliberately blunt. It separates **verified**, **implemented but
unverified**, and **not implemented**. Read section 4 before planning anything.

## TL;DR

| Area                                                          | State                                                                                                                            |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Stage 1 — app shell, i18n, theme, tokens, navigation          | **Done**, all static checks pass, no human design review                                                                         |
| Stage 2 — schema, seed, generated types, `/explore` list, RLS | **Done with caveats** (sections 1 and 3)                                                                                         |
| Stage 3 — auth, profiles, saving                              | **Not started**; those routes are placeholders                                                                                   |
| Stages 4–9 — search UI, feed, tracker, notifications, admin   | **Not started**                                                                                                                  |
| Checks on this machine (2026-11-24)                           | 39 tests passed, 6 skipped; typecheck, ESLint, i18n, Prettier clean; build OK                                                    |
| Database                                                      | Migrations + seed ran on a **throwaway plain Postgres 17 container**, not via the Supabase CLI stack and not on a hosted project |
| RLS                                                           | Verified with SQL (`set role anon`) only. The anon-key/PostgREST path has **never** been executed                                |

Nothing is known to be broken. The risk is in the **unverified** parts:
PostgREST access with the anon key, auth (not built at all), and UI copy that
still says "arrives in Stage 3" on screens that already show demo rows.

## 1. Stages: honest status

### Stage 1 — foundation: done

Delivered:

- next-intl routing: `uz` (default), `ru`, `en`, prefix always in the URL;
  `src/proxy.ts` (Next.js 16 renamed the `middleware` convention to `proxy`).
- Layout shell: header, desktop nav, mobile bottom tabs, footer, language
  switcher, account menu (static links only), theme provider + toggle
  (light/dark/system, applied before first paint).
- Design tokens as CSS variables in `src/styles/tokens.css` + Tailwind v4
  `@theme inline` mapping; Manrope via `next/font`; UI primitives `button`,
  `badge`, `card`, `input`, `skeleton`.
- Home page: hero band, GET search form, type shortcuts, "how it works", plus
  two sections that render **permanent skeletons** (see section 4).
- One placeholder page per later-stage route (about, contact, privacy, terms,
  auth ×3, onboarding, profile, saved, tracker, alerts, for-you, suggest,
  admin, opportunity detail), all translated in three languages.
- `/dev/design` reference page, hidden in production unless
  `NEXT_PUBLIC_ENABLE_DESIGN_SYSTEM=true`.

Evidence: `typecheck`, `lint`, `i18n:check`, `prettier --check`, `vitest` and
`next build` all pass (section 7).

Caveats:

- No human design/UX review on real devices; `/uz/dev/design` is the only
  visual QA artifact.
- Placeholder screens show a visible developer-facing note ("This page is only
  a skeleton for now. Content arrives in later stages."). Intentional for
  Stage 1, but it must not ship to real users.

### Stage 2 — database layer: done with caveats

Delivered:

- `supabase/migrations/0001–0006`: extensions, profiles/roles/signup trigger,
  organizations/opportunities/translations + search trigger + RLS, user data
  tables, notification queue/audit log, `search_opportunities(jsonb)` and
  `archive_expired()`.
- `supabase/seed.sql`: 27 demo organizations, 40 published demo listings,
  120 translations (one per locale), 40 translated slugs; all fictional, all
  URLs on `example.org`; rerunnable (deletes its own demo rows first).
- `src/lib/database.types.ts` generated from the schema (committed).
- Supabase clients: server (cookies + anon key), browser, service-role admin;
  `readSupabaseEnv()` throws a readable error when env vars are missing.
- `src/lib/opportunity/search.ts`: typed wrapper over the RPC with options for
  query, types, limit/offset, expiry/rolling/remote/verified filters and sort.
- `/explore`: server-rendered list of published listings (up to 100), demo
  badge, deadline formatting, empty state and a setup hint when Supabase is
  not configured.
- Tests: `tests/seed.test.ts` (static seed checks) and `tests/rls.test.ts`
  (self-skipping integration suite). README sections 7–8.

Caveats — read these before trusting Stage 2:

1. **The database was never created the normal way.** `supabase start` /
   `supabase db reset` were never executed on this machine. All six migrations
   and the seed were applied with `psql` to a temporary plain Postgres 17
   container plus a hand-written auth stub (section 3).
2. **RLS only verified at SQL level.** `tests/rls.test.ts` has never run
   (always skipped: no `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`). PostgREST,
   the anon key, schema exposure and `max_rows` behaviour are unverified.
3. **Search is not wired.** The search form submits `?q=…` (and home shortcuts
   submit `?type=…`), but `/explore` ignores every query parameter. Nothing
   filters yet.
4. **Card links dead-end.** `/opportunities/[slug]` is a placeholder, so
   clicking any card opens a "skeleton" page.
5. No unit tests for `searchOpportunities()` or for the `/explore` page.
6. `database.types.ts` was generated against the stub schema, not against a
   real Supabase instance (public schema only, so the difference should be
   nil — but it is not the documented `npm run db:types` path).

### Stage 3 — auth / accounts / saving: not started

There are no Supabase auth calls anywhere (`signInWithPassword`, `getUser`,
`exchangeCodeForSession` etc. do not appear in `src`). The login, signup and
reset pages are placeholders, the proxy only does locale routing (no session
refresh), and `createSupabaseBrowserClient()` is currently unused.
`/saved`, `/tracker`, `/profile`, `/alerts`, `/for-you`, `/onboarding`,
`/suggest`, `/admin` are all placeholders.

### Stages 4–9: not started

Per the in-code comments: Stage 4 search/filters/pagination, Stage 5 feed and
profile, Stage 6 saved list, Stage 7 tracker, Stage 8 alerts/notifications/
suggestions, Stage 9 admin.

## 2. Exact commands to install, run, test and build

Requirements: Node.js ≥ 20.9 (22 LTS used), npm, Docker Desktop (only for the
local Supabase stack), Git.

```bash
# 1. Install (use `npm ci` when you want the lockfile exactly)
npm install

# 2. Environment file (never commit it)
cp .env.example .env.local          # PowerShell: Copy-Item .env.example .env.local
# Required for /explore:
#   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key printed by `npm run supabase:start`>

# 3. Local database (Docker Desktop must be running)
npm run supabase:start              # start stack, prints API URL + anon key
npm run db:reset                    # migrations + seed.sql
npm run db:types                    # regenerate src/lib/database.types.ts

# 4. Develop
npm run dev                         # http://localhost:3000 -> /uz

# 5. Checks (what CI runs, in this order)
npm run typecheck                   # tsc --noEmit
npm run lint                        # eslint .
npm run i18n:check                  # message-file parity
npm run test                        # vitest run
npm run format:check                # prettier --check .
npm run check                       # typecheck + lint + i18n + tests (no Prettier)

# 6. Production build / serve
npm run build
npm run start                       # http://localhost:3000
```

Platform notes that cost time on this machine:

- **Windows PowerShell blocks npm.** `npm run …` can print
  "npm.ps1 cannot be loaded because running scripts is disabled". Either run
  `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or call
  `npm.cmd run <script>` (this is what was used for the verification below).
- **Build memory.** This 5.9 GB machine OOMs with the default Node heap.
  Run `$env:NODE_OPTIONS='--max-old-space-size=3072'; npm.cmd run build`.
  No code change is needed; GitHub Actions runners build with defaults.
- **PowerShell env vars** are per process:
  `$env:NEXT_PUBLIC_SUPABASE_URL='http://127.0.0.1:54321'`.

Enable the RLS integration suite (otherwise its 6 tests are skipped):

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL='http://127.0.0.1:54321'
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY='<anon key from npm run supabase:start>'
npm.cmd run test
```

Supabase CLI is a devDependency (`supabase` 3.3.0), so the `npm run supabase:*`
and `db:*` scripts work after `npm install` without a global install.

## 3. Supabase migrations: required vs. what actually ran

### What must be applied, in this order

| File                           | Creates                                                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `0001_init.sql`                | `pg_trgm`, `unaccent`, `pgcrypto` in the `extensions` schema; helper functions                                                           |
| `0002_profiles.sql`            | `profiles`, `notification_settings`, `admin_roles`, `is_admin()`/`is_staff()`, signup trigger on `auth.users`                            |
| `0003_opportunities.sql`       | `organizations`, `opportunities`, `opportunity_translations`, search trigger + indexes, RLS (public read of published rows, staff write) |
| `0004_user_data.sql`           | `saved_opportunities`, `tracker_entries`, `saved_searches`, `user_events`, `reports`, `suggestions` + per-user RLS                       |
| `0005_notifications_admin.sql` | `notification_queue`, `audit_log` (no client policies; service role only)                                                                |
| `0006_functions.sql`           | `search_opportunities(jsonb)` (SECURITY INVOKER, clamps limit to 1–100) and `archive_expired()`                                          |
| `seed.sql`                     | 27 orgs, 40 demo listings, 120 translations (not a migration; `db reset` runs it automatically because of `[db.seed]` in `config.toml`)  |

Normal way to apply on a fresh machine (never edit an applied migration, add a
new numbered file):

```bash
npm run supabase:start
npm run db:reset          # runs all migrations, then supabase/seed.sql
```

For a hosted project: `supabase link --project-ref <ref>` then
`supabase db push` (not done here). Do **not** run `seed.sql` against
production: its first statements delete demo rows by `is_demo = true` and
organizations named `Demo %`.

### What I actually ran (and how)

- **All six migrations + `seed.sql` were applied successfully, once, to a
  throwaway database**: `public.ecr.aws/supabase/postgres:17.12.0.002`
  (plain Postgres 17) running locally in Docker, database `postgres`, user
  `postgres`.
- The migrations require Supabase's auth schema and API roles, so before
  applying them I created a **hand-written stub** (temporary file, not in the
  repo): schemas `auth` and `extensions`, roles `anon`, `authenticated`,
  `service_role`, a minimal `auth.users` table and `auth.uid()`. The stub must
  never be applied to a real Supabase project.
- Files were piped through `psql -v ON_ERROR_STOP=1` in numeric order, then
  `seed.sql`. All statements completed without error.
- Verified in that database: 27 organizations, 40 published listings,
  120 translation rows, 40 distinct listing slugs with translations;
  `search_opportunities` returned the expected rows for `en` and `uz`; guest
  access checked with `set role anon` (drafts and their translations
  invisible; `admin_roles`, `notification_queue`, `reports` denied; inserts
  into `opportunities` denied).
- `src/lib/database.types.ts` was generated from that database with
  `supabase gen types typescript --remote=postgresql://postgres:postgres@127.0.0.1:54329/postgres --schema public`
  (preamble trimmed, Prettier applied). It was **not** produced by
  `npm run db:types`.
- The container was deleted afterwards. There is **no local database state
  left** on this machine.

### What I did NOT run (important)

- `npm run supabase:start` — the full Supabase stack (Kong/PostgREST/GoTrue/
  Studio) was never started here. Docker memory on this machine was too tight.
- `npm run db:reset`, `supabase db push`, `supabase link` — never executed.
- `tests/rls.test.ts` — never executed; it always reports 6 skipped. The
  anon-key HTTP path, PostgREST schema exposure and real JWT/`auth.uid()`
  behaviour are therefore unverified end-to-end.
- No hosted Supabase project exists or is linked. No production data exists.

### Known migration risks

- The signup trigger lives on `auth.users`; if the auth schema is created after
  these migrations (or differs), `0002` fails. This is standard Supabase
  behaviour, not a bug, but it is why applying to vanilla Postgres fails
  without a stub.
- `0003` depends on `extensions.unaccent`, `extensions.gin_trgm_ops` and
  `extensions.similarity`; `0001` must run first with `create extension … with
schema extensions`.
- Types were generated against the stub; regenerate them after the first
  real `db:reset` and commit the diff if any.

## 4. Known bugs, shortcuts, TODOs and skipped work

### Visible functional gaps

1. **Search does nothing.** `SearchForm` submits `?q=…` and the home shortcuts
   link to `?type=…` / `?sort=deadline`, but `src/app/[locale]/explore/page.tsx`
   never reads `searchParams`. Expect "search returns everything" reports
   until Stage 4.
2. **Every card dead-ends.** `/opportunities/[slug]` is a placeholder; any
   slug renders the same page and no 404 is produced for unknown slugs.
3. **Home "closing soon" and "featured" are permanent skeletons**
   (`aria-busy="true"`, three/four cards) with copy saying listings arrive in
   Stage 3 — stale, since Stage 2 already seeds 40 rows.
4. **Placeholder pages show developer copy** (`common.stageNote`: "This page is
   only a skeleton for now…") to end users on about/contact/privacy/terms/auth/
   profile/saved/tracker/alerts/for-you/suggest/admin/onboarding/detail.
5. Auth and all account features are placeholders (section 1).
6. **No pagination.** `/explore` asks for `limit: 100`; the RPC clamps to
   1–100 and `config.toml` caps responses at 1000 rows.
7. No `loading.tsx`/streaming; the dynamic page waits for the RPC before the
   first byte.
8. The search input does not keep the submitted value (no `defaultValue`).

### Test weaknesses (fix before trusting RLS)

9. **`tests/rls.test.ts` can pass for the wrong reason.** The
   `saved_opportunities` insert uses zero UUIDs (FK violation) and the
   `opportunities` insert omits the required `deadline_type` (NOT NULL
   violation). Both produce an error even if RLS were disabled. Assert on
   `error.code === '42501'` or insert otherwise-valid data.
10. The suite has **never run** (6 skipped) and CI never runs it, so there is
    no automated regression test for the policies.
11. No tests for `searchOpportunities()`, the `/explore` page or the RPC
    contract. `toListItem` silently drops rows whose `type` is not in the
    TypeScript union.
12. `total_count` is read from the first returned row only; with zero rows it
    is reported as 0 (no separate count query).
13. `tests/seed.test.ts` is a regex test; a SQL syntax error is only caught by
    actually loading the seed into a database.

### Data / schema shortcuts

14. `seed.sql` deletes its own demo rows and `Demo %` organizations before
    inserting. Never run it against production.
15. No profiles, `admin_roles` or `notification_settings` rows are seeded; there
    is no test user and no auth flow to create one.
16. `archive_expired()` exists but has no caller (no cron route; Stage 8).
17. No storage buckets or policies (avatar upload is not implemented).
18. Migrations need Supabase's `auth` schema/roles (section 3), so they cannot
    be applied to a bare Postgres without a stub.
19. `database.types.ts` came from the stub database — regenerate and diff after
    the first real `db:reset`.

### Tooling / CI / environment

20. `next build` OOMs with the default Node heap on this 5.9 GB machine; the
    workaround is documented in section 2 but is **not** in `package.json`.
21. `npm.ps1` is blocked by the PowerShell execution policy on this machine
    (use `npm.cmd` or fix the policy).
22. There is **no `.vscode` folder**, although README section 1 claims shared
    editor settings exist. `.gitignore` would also ignore
    `.vscode/settings.json` (only `extensions.json` is allowed).
23. `npm run check` does not run Prettier, while README says "check and build
    must pass before you push". CI does run `format:check` separately.
24. CI has no Supabase environment and no database job; the RLS tests are
    always skipped there. Only static checks + build are enforced.
25. `npm run db:types` (`--local`) has never been exercised.
26. `git add` warned that ~95 files will be converted LF→CRLF on a Windows
    checkout (no `.gitattributes` in the repo). Consider adding one to stop
    line-ending churn between Windows and Linux contributors.
27. No remote or CI run existed at handoff time; every result in section 7 is
    from this machine only.
28. Sentry/PostHog variables are declared but no monitoring is wired.

### Documentation drift

29. README, `.env.example` and many code comments cite `PROJECT_SPEC.md`,
    `ARCHITECTURE.md`, `DESIGN.md` and `STAGE_PROMPTS.md`. **None of these
    files exist in the repository** — see section 5.
30. README section 5 says `npm run i18n:check` compares ICU placeholders. It
    does not; that check lives in `tests/messages.test.ts`. The script checks
    key parity, empty values and duplicate keys only.
31. `src/app/[locale]/auth/login/page.tsx` says "Stage 2 replaces this with
    email and Google sign-in", while every other file says auth is Stage 3.
32. Placeholder comments reference stages 5–9, which only make sense with the
    missing `STAGE_PROMPTS.md`.

### Security notes

33. `src/lib/supabase/admin.ts` (service role) is unused so far. Keep it out of
    client bundles.
34. No auth yet, so no user data is exposed — but there is also no CSP, rate
    limiting or Turnstile (all Stage 3+).
35. `/explore` calls `console.error` with the raw Supabase error. Review before
    production logging.
36. No `.env.local` exists and no secrets are committed (verified: 97 files
    staged, `.env.local` and `node_modules` not tracked).

### Deliberately skipped (not bugs)

- Search UI, filters, pagination, facets (Stage 4).
- Personalised feed, profile editing, saved list, tracker, alerts, admin
  (Stages 5–9).
- Auth, onboarding persistence, Turnstile, Upstash rate limiting (Stage 3).
- `sitemap.xml`, `robots.txt`, OG images, hreflang alternates beyond per-page
  metadata.
- E2E/browser tests — no Playwright or Cypress dependency is installed.

## 5. Decisions that differ from PROJECT_SPEC.md / ARCHITECTURE.md / DESIGN.md

**The three documents are not in this repository**, so compliance cannot be
checked here. Files that cite them: `README.md` (lines 10, 96, 228),
`.env.example` (line 1), `src/proxy.ts`, `src/lib/supabase/env.ts`,
`src/app/[locale]/page.tsx`, `src/components/search/search-form.tsx`,
`src/app/[locale]/auth/login/page.tsx`, `scripts/check-i18n-keys.mjs`,
`supabase/migrations/0003_opportunities.sql`, `0006_functions.sql` and
`supabase/seed.sql`. **Decision needed:** either add the real documents or
strip the citations. Treat every "section X" reference as unverifiable.

What follows is what a spec/DESIGN review should compare, because these are
choices that could differ from what those documents say.

### Contradictions inside the repo itself

- README says shared VS Code settings are included; there is no `.vscode`
  folder, and `.gitignore` would exclude `settings.json` anyway.
- README says `npm run i18n:check` checks ICU placeholder parity; the script
  does not (only `tests/messages.test.ts` does).
- `src/app/[locale]/auth/login/page.tsx` says auth arrives in Stage 2; every
  other file and the missing `STAGE_PROMPTS.md` mapping say Stage 3.
- Home copy says real listings arrive in Stage 3, yet Stage 2 already ships 40
  demo listings and the real ingestion stage is later.
- README's "40 translated slugs" is misleading: `opportunity_translations` has
  no `slug` column. There is one canonical `opportunities.slug` per listing
  and 40 listings have translations; URLs are not localised.
- `.env.example` labels Upstash and Turnstile as "Stage 3", but no code reads
  any of those variables yet.

### Technical choices to check against the spec

- **Stack versions:** Next.js 16.4 (`proxy.ts` instead of `middleware.ts`,
  `typedRoutes: false`), React 19, Tailwind CSS 4 with CSS-first tokens (no
  `tailwind.config.*`), ESLint 10 flat config, next-intl 4, Supabase JS 2.
  A spec written for Next 14/15 or `tailwind.config.js` will not match.
- **Routing:** `localePrefix: 'always'`, `uz` default, no `/` page (the proxy
  redirects to `/uz`); `<html lang>` comes from the route. No localised URLs.
- **Search contract:** one `search_opportunities(jsonb)` RPC
  (`SECURITY INVOKER`, `search_path = ''`, limit clamped 1–100) with
  `websearch_to_tsquery` plus a trigram fallback, and translation fallback
  `requested locale → en → any`. The RPC accepts more filters
  (`education_levels`, `fields_of_study`, `countries`, `regions`,
  `funding_types`, `deadline_from/to`, `duration_min/max`) than
  `search.ts` exposes today — Stage 4 must extend the wrapper, not the SQL.
- **`/explore` rendering:** `export const dynamic = 'force-dynamic'`, one
  request, up to 100 rows, no cache/ISR, no pagination, no URL state. If the
  spec asks for static/ISR or server-side pagination, this differs.
- **Generated types are committed** (`src/lib/database.types.ts`) rather than
  generated during CI/build.
- **Seed model:** fictional organizations, `is_demo = true`, `example.org`
  URLs, deadlines relative to `current_date`, one canonical slug per listing,
  destructive re-run. It is a demo fixture, not real content.
- **Theme:** `data-theme="light|dark"` on `<html>` plus a Tailwind
  `@custom-variant dark`, not the `.dark` class strategy. Inline script applies
  the stored choice before paint.
- **Error strategy:** missing Supabase env or a failing RPC is logged and
  replaced by a setup card, so production misconfiguration looks like a
  content hint instead of an error page. No monitoring is wired.
- **Placeholders:** every later-stage route exists with a translated shell and
  a visible "skeleton" note; the opportunity detail route accepts any slug
  (no 404). A spec that expects missing routes to 404 sees different
  behaviour.
- **Auth/session:** no auth middleware, no cookie refresh, no
  `signIn*`/`getUser` calls; `createSupabaseBrowserClient()` and
  `createSupabaseAdminClient()` are unused.
- **Account UI:** the header account menu is static (links only), not driven by
  a session.
- **Checks:** `npm run check` omits Prettier; CI runs `format:check`
  separately. The build needs extra Node heap on low-RAM machines, which is
  documented but not encoded in `package.json`.

## 6. Environment variables (names only, no values)

Actually read by application code:

| Variable                           | Read in                                                                     | Needed today                                                           |
| ---------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`             | `src/lib/site.ts`                                                           | Optional (falls back to `http://localhost:3000`); set it in production |
| `NEXT_PUBLIC_SUPABASE_URL`         | `src/lib/supabase/env.ts`, `src/lib/supabase/admin.ts`, `tests/rls.test.ts` | Yes, for `/explore` and the RLS suite                                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`    | same files                                                                  | Yes, for `/explore` and the RLS suite                                  |
| `SUPABASE_SERVICE_ROLE_KEY`        | `src/lib/supabase/admin.ts`                                                 | Not used yet (Stage 3+ server jobs)                                    |
| `NEXT_PUBLIC_ENABLE_DESIGN_SYSTEM` | `src/app/[locale]/dev/design/page.tsx`                                      | Optional (`true` only for a short review)                              |
| `NODE_ENV`                         | `src/app/[locale]/dev/design/page.tsx` (built-in)                           | Managed by Next.js                                                     |

CI-only (`.github/workflows/ci.yml`): `NEXT_TELEMETRY_DISABLED`.

Declared in `.env.example` but **not read anywhere yet**:
`BREVO_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`, `UPSTASH_REDIS_REST_URL`,
`UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
`TURNSTILE_SECRET_KEY`, `SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY`,
`UNSUBSCRIBE_SIGNING_SECRET`.

Present only as commented `env(...)` placeholders in Supabase's default
`config.toml` (nothing requires them): `OPENAI_API_KEY`,
`SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN`, `SUPABASE_AUTH_EXTERNAL_APPLE_SECRET`,
`S3_HOST`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `SECRET_VALUE`.

No `.env.local` exists in the working copy, and no real values are in the
repository.

## 7. Verification log (what was actually run)

All commands were executed on 2026-11-24 on this machine (Windows 11,
Node 22, 5.9 GB RAM). Because PowerShell blocks `npm.ps1`, the binaries in
`node_modules\.bin\*.cmd` were called directly; the results are identical to
the npm scripts.

| Check                                                              | Result                                                                                                                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tsc --noEmit` (`npm run typecheck`)                               | 0 errors                                                                                                                                                |
| `eslint .` (`npm run lint`)                                        | 0 problems                                                                                                                                              |
| `node scripts/check-i18n-keys.mjs`                                 | 143 keys in `uz`, `ru`, `en`; no missing/empty/duplicate keys                                                                                           |
| `vitest run` (`npm run test`)                                      | 39 passed, 6 skipped (the RLS suite)                                                                                                                    |
| `prettier --check .`                                               | clean                                                                                                                                                   |
| `next build` with `NODE_OPTIONS=--max-old-space-size=3072`         | success, 57 routes; `/explore` is dynamic (`ƒ`)                                                                                                         |
| Runtime smoke test: `next start` on port 3100, `GET /uz/explore`   | HTTP 200, rendered the Uzbek title and the "Supabase not configured" setup card; the expected `[explore] could not load opportunities` error was logged |
| Database: migrations + seed on the temporary Postgres 17 container | all statements OK; 27 orgs / 40 listings / 120 translations / 40 listings with translations                                                             |
| Database: `search_opportunities`                                   | returned rows for `en` and `uz` with the expected titles                                                                                                |
| Database: guest checks via `set role anon`                         | published rows visible; drafts, staff tables and writes denied                                                                                          |

Not run, therefore unverified: `npm run supabase:start`, `npm run db:reset`,
`npm run db:types`, `tests/rls.test.ts` (always skipped), any GitHub Actions
run, any browser/E2E test, and any device/visual review.

## 8. Repository state and suggested next steps

- Remote: `https://github.com/Quvonchbek01/TopImkon.uz` (public, default branch
  `main`), created before this handoff and empty at that point.
- First and only commit at handoff: `31c9e74 chore: Stage 1 + Stage 2 handoff`
  (97 files, 16749 insertions), author `Quvonchbek01
<Quvonchbek01@users.noreply.github.com>` (no git identity was configured on
  the machine, so the GitHub noreply address was used; amend it if you want a
  real address).
- The push was done with a personal access token supplied interactively; that
  token is not stored in `.git/config` and must be revoked by its owner. Do not
  reuse it.
- `.env.local` is absent and no secrets are committed (verified before the
  push: `node_modules`, `.env.local`, `supabase/.temp`, `.next` are ignored).
- Line endings: the commit was made on Windows and `git add` warned that ~95
  files will be checked out as CRLF. There is no `.gitattributes`, so a Linux
  contributor will see no-op diffs after editing.
- **Unrelated older repositories by the same author** exist and contain an
  earlier implementation of the same product (Next.js 14, `schema.sql` +
  `stage4.sql` instead of numbered migrations, Playwright, grammY bot):
  `Quvonchbek01/TopImkon` and `Quvonchbek01/topimkon-web`. They were **not**
  audited, are not this codebase and were not touched. Treat this repository
  (`TopImkon.uz`) as the current one, but read the old repos before repeating
  work — they may already contain Stage 4–7 attempts.

Suggested order for the next engineer:

1. **Create the real database.** Link a Supabase project (or start Docker
   Desktop and run `npm run supabase:start`), apply `0001–0006` with
   `db push`/`db reset`, then run `npm run db:types` and commit any diff.
2. **Prove RLS over HTTP.** Export the URL + anon key, run the RLS suite, and
   fix the two false-positive assertions described in section 4 (item 9).
3. **Stage 3 (auth).** Add the session-refresh step to `src/proxy.ts`, build
   login/signup/reset, replace the static account menu, and add signed-in RLS
   tests. Do not add Upstash/Turnstile until the flows exist.
4. **Stale copy.** Fix the "arrives in Stage 3" strings and the placeholder
   `stageNote` before any public demo.
5. **Docs.** Either add `PROJECT_SPEC.md`, `ARCHITECTURE.md`, `DESIGN.md` and
   `STAGE_PROMPTS.md` or remove the citations; update README claims that do
   not match the code (section 5).
6. **Stage 4.** Read `searchParams` in `/explore`, extend
   `searchOpportunities()` to all RPC filters, add pagination and URL state.
7. **Housekeeping.** Consider `.gitattributes` (`* text=auto eol=lf`) to stop
   the LF/CRLF churn, and a documented `build:lowmem` script or README note
   for the heap flag.

Never run `supabase/seed.sql` against production (it deletes demo rows first).
