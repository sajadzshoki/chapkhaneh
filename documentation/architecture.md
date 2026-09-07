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
  data/                 Realistic mock content
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

## Data flow today vs. later

```
shared/data/*.ts  ──►  pages/components        (phase 1: typed mock data)
                  ──►  server/api/*.get.ts     (same data, served over HTTP)

PostgreSQL ──► Drizzle ──► server/services ──► server/api ──► pages  (phase 2+)
```

The public UI already consumes typed domain objects, so swapping the source
from mock data to the database does not change component code.

## Server layer

`server/api/` handlers stay thin: parse, validate, delegate, respond.
Business logic lives in `server/services/`.

`server/database/client.ts` returns `null` when `DATABASE_URL` is unset. The
quote service handles that by logging the submission instead of persisting it,
so phase 1 runs and builds with no database attached.
