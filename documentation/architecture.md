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
  composables/          useSite, useLocalizedContent, useNavigation
  layouts/default.vue   Public layout (skip link + header + main + footer)
  pages/                File-based routes
  plugins/theme.client  Writes theme tokens to <html> as CSS variables
  stores/               Pinia: theme, quote
  utils/                format.ts, validation.ts
  app.vue               Root: <html lang/dir>, SEO defaults, favicon
  error.vue             404 / 500 page

shared/                 Code shared by app AND server (Nuxt 4 `shared/` layer)
  types/                Domain models — the contract for everything
  data/                 Seed content (not read at runtime)
  theme/brand.ts        Single source of truth for brand colours

server/
  api/                  Nitro route handlers
  services/             Business logic (validation + persistence)
  database/             Drizzle schema and lazy client

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
mock content, brand colours — lives in `shared/`. This is why `brand.ts` sits in
`shared/theme/` rather than `app/`.

## Where does new code go?

| I want to add… | Put it in |
| --- | --- |
| A new page | `app/pages/` |
| A component used on 2+ pages | `app/components/ui/` |
| A component used by exactly one page | `app/components/<page>/` |
| A new domain entity | `shared/types/` first, then data |
| Content for the site | `shared/data/` |
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
