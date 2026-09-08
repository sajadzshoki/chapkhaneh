# Architecture

## Folder layout

```
app/                    Nuxt application (srcDir)
  assets/css/           main.css, tokens.css, fonts.css
  components/
    app/                Shell: Header, Footer, Logo, LanguageSwitcher, ContactStrip
    home/               Homepage-only sections (Hero, WhySection, ProcessSection)
    quote/              Quote form parts (Field, Sidebar)
    ui/                 Reusable presentational components used across pages
  composables/          useSite, useSiteSettings, usePageSeo, useStructuredData, …
  layouts/              default.vue (public), admin.vue (admin shell)
  middleware/           admin-auth
  pages/                File-based routes ([...slug].vue = branded 404)
  plugins/              site-identity (injects the company name into i18n)
  stores/               Pinia: theme (admin preview only), quote
  utils/                format.ts, validation.ts
  app.vue               Root: <html lang/dir>, /theme.css, SEO defaults, favicon
  error.vue             Error page for thrown errors

shared/                 Code shared by app AND server (Nuxt 4 `shared/` layer)
  types/                Domain models — the contract for everything
  data/                 Seed content (not read at runtime)
  theme/brand.ts        Default palette (compile-time seed)
  theme/tokens.ts       8 editable colours -> semantic tokens + scales

server/
  api/                  Nitro route handlers (public + /api/admin/**)
  routes/               theme.css, sitemap.xml, robots.txt
  middleware/           admin-guard (single auth boundary for /api/admin/**)
  repositories/         content (public reads) and admin (all admin CRUD)
  services/             Business logic (validation + persistence)
  database/             Drizzle schema, migrations, seed
  error-handler.ts      Sanitised JSON errors for /api/**

i18n/locales/           fa.json, en.json
public/                 brand/, portfolio/, photos/, fonts/, favicon.svg
documentation/          This folder
```

## Import aliases

| Alias | Points at | Use for |
| --- | --- | --- |
| `~/` | `app/` | Components, composables, stores, utils |
| `~~/` | project root | `~~/shared/types`, `~~/shared/data/...` |

Server code cannot import from `app/`. Anything both sides need — domain types,
seed content, theme derivation — lives in `shared/`. This is why `brand.ts` and
`tokens.ts` sit in `shared/theme/` rather than `app/`: the theme stylesheet is
generated on the server, and the admin preview uses the identical function.

## Where does new code go?

| I want to add… | Put it in |
| --- | --- |
| A new page | `app/pages/` |
| A component used on 2+ pages | `app/components/ui/` |
| A component used by exactly one page | `app/components/<page>/` |
| A new domain entity | `shared/types/` first, then data |
| Seed content for a fresh install | `shared/data/` |
| Company-specific content | The database, via the admin — not code |
| An API endpoint | `server/api/`, logic in `server/services/` |
| A database table | `server/database/schema.ts` |

## Component conventions

Nuxt auto-imports components with a prefix derived from the directory, so
`app/components/ui/ServiceCard.vue` is used as `<UiServiceCard>` and
`app/components/app/Header.vue` as `<AppHeader>`.

Rules the codebase follows:

- Components take data via **props**; they never import mock data themselves.
  (`ui/ServiceCard` receives a `Service`; it does not reach into `shared/data`.)
- No user-facing string is hardcoded in a reusable component — use `$t()`.
- No hardcoded brand colours — use the `var(--color-*)` tokens.
- A component is only created when it is reused or it meaningfully simplifies a
  page. One-off markup stays in the page.

## Data flow

```
PostgreSQL
   └─ Drizzle (server/database/schema.ts)
        └─ server/repositories/content.repository.ts   queries
             └─ server/database/mappers.ts             rows -> Localized DTOs
                  └─ server/api/*.get.ts               public/admin endpoints
                       └─ app/composables/useContent.ts  useAsyncData wrappers
                            └─ pages / components
```

`shared/data/*.ts` is seed input only — the public pages no longer import it.
Because the UI consumed typed domain objects from the start, switching the
source to PostgreSQL required no redesign.

The mappers are also the **field allow-list**: anything not returned there
(password hashes, internal notes) can never reach a response.

### Fetching rules

`useContent.ts` wraps each dataset in `useAsyncData` with a stable key, so
concurrent callers on one page share a single query.

Page components **must await** these helpers
(`const { data } = await useServices()`); otherwise during SSR the data is still
empty when the component renders and a slug lookup produces a false
"not found". Child components rendered inside a layout (`Footer`,
`PortfolioCard`) instead read the shared handle *without* awaiting, so they do
not suspend the whole layout — the parent page has already resolved it.

## Server layer

`server/api/` handlers stay thin: validate, call a repository function, respond.
Query logic lives in `server/repositories/`, business logic in
`server/services/`. No route hand-rolls its own SQL.

`server/database/client.ts` throws when `DATABASE_URL` is missing rather than
degrading to mock data — from phase 3 a missing database is a real
misconfiguration and should be loud. `tryDatabase()` is available where a
`null` is genuinely acceptable.
