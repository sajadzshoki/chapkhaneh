# Mobin Bartar — Printing Company Website

A production-ready, **white-label** website product for professional printing
companies. A different company is onboarded by changing settings, content and
colours through the admin — not by editing code. The seeded demo brand is
**Mobin Bartar / مبین برتر**.

Persian-first and RTL by default, with full English (LTR) support.

## Documentation index

| Document | Purpose |
| --- | --- |
| [`architecture.md`](./architecture.md) | Folder layout and where each kind of code belongs |
| [`white-label.md`](./white-label.md) | **Start here to onboard a new company** — the 13-step workflow |
| [`theming.md`](./theming.md) | Design tokens, the theme editor and how colour reaches the screen |
| [`content.md`](./content.md) | Where site content lives and how it is edited |
| [`database.md`](./database.md) | Schema, relationships, migrations and seeding |
| [`admin.md`](./admin.md) | Admin authentication, CRUD API, validation and the CMS |
| [`quote-requests.md`](./quote-requests.md) | Quote workflow, uploads, storage and download security |
| [`seo.md`](./seo.md) | Metadata, structured data, sitemap, robots and 404s |
| [`deployment.md`](./deployment.md) | Environment variables, deploy steps and database commands |
| [`i18n.md`](./i18n.md) | Translations, locales and RTL/LTR |
| [`roadmap.md`](./roadmap.md) | What each phase delivered and what comes next |

## Tech stack

Nuxt 4 · Vue 3 · TypeScript · Nuxt UI · Tailwind CSS v4 · @nuxtjs/i18n · Pinia ·
Nitro server routes · Drizzle ORM · PostgreSQL

## Getting started

```bash
npm install
cp .env.example .env     # then set DATABASE_URL and the secrets
npm run db:migrate       # create the tables
npm run db:seed          # load the demo content and the admin account
npm run dev              # http://localhost:3000
```

The database is required from phase 3 onwards: all site content is served from
PostgreSQL. See [`database.md`](./database.md) for the full workflow.

Useful scripts:

```bash
npm run build        # production build
npm run typecheck    # vue-tsc — must stay clean
npm run db:generate  # generate a migration after editing schema.ts
npm run db:migrate   # apply pending migrations
npm run db:seed      # (re)load the demo dataset
npm run db:reset     # drop everything — development only
```

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `NUXT_PUBLIC_SITE_URL` | Public base URL for canonical/OG tags |
| `NUXT_SESSION_PASSWORD` | Signs the admin session cookie — min 32 chars |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used once, by the seed, to create the admin |

`.env` is gitignored and must never be committed. `.env.example` documents the
shape with placeholder values only.

### Fonts

Persian text uses **Vazirmatn**. The woff2 files are not committed — see
[`public/fonts/README.md`](../public/fonts/README.md) for the four filenames to
drop in. Until then the site falls back to Tahoma, which renders Persian
correctly with slightly different metrics.

## Rebranding for another printing company

**No code changes required.** Company details, brand assets, the eight brand
colours and all site content are stored in PostgreSQL and edited through the
admin at `/admin`. Theme changes take effect without a rebuild.

See [`white-label.md`](./white-label.md) for the full 13-step onboarding
workflow, and [`theming.md`](./theming.md) for how colour reaches the screen.

Only three things still live in code: UI labels (`i18n/locales/`), the default
palette used before an owner picks their own (`shared/theme/brand.ts`), and the
seed content for a fresh install (`shared/data/`).

## For the next AI or developer

Read this before changing anything.

- **Business content is data; interface text is code.** Do not move UI labels
  into the database, and do not hardcode a company detail into a component.
- **`useSiteSettingsData()` is the only place that declares the `site-settings`
  fetch.** Redeclaring that `useAsyncData` key elsewhere causes NUXT_E3004.
  New consumers call the composable.
- **Editing `shared/theme/brand.ts` requires `npm run theme:generate`.**
  `app/assets/css/tokens.css` and the `@theme static` block in `main.css` are
  generated. Never hand-edit them. See theming.md for why the duplication
  exists.
- **A bare `|` in a locale message is @intlify's plural separator** and
  silently truncates the string; escape it as `{'|'}`. A bare `@` is a linked
  message token; escape it as `{'@'}`. The company name is injected via the
  linked message `@:brand.company`.
- **Never inject a theme value into CSS without `sanitizeTheme()`.** Both the
  write path and the read path validate against `/^#[0-9a-fA-F]{6}$/`.
- **`app/plugins/site-identity.ts` must use `nuxtApp.$i18n`, not `useI18n()`,**
  and must merge per request. Module-scope mutable state leaks across
  concurrent SSR requests.
- **Locale files must stay at parity.** Both are currently 762 keys; a missing
  key renders as a raw key path in the UI.
- **The database is the source of truth.** Do not reintroduce runtime mock
  data or a fallback-to-fixtures path.
- **Do not add** ecommerce, payments, customer accounts, CRM, role-based
  permissions, multi-tenancy, an analytics platform, a media library or a
  destructive admin reset button. The admin is a practical CMS for a
  non-technical owner, not an ERP.
