# Mobin Bartar — Printing Company Website

A production-oriented, reusable website product for large professional printing
companies. The current demo brand is **Mobin Bartar / مبین برتر**.

Persian-first and RTL by default, with full English (LTR) support.

## Documentation index

| Document | Purpose |
| --- | --- |
| [`architecture.md`](./architecture.md) | Folder layout and where each kind of code belongs |
| [`theming.md`](./theming.md) | Design tokens and how to rebrand |
| [`content.md`](./content.md) | Where site content and mock data live |
| [`i18n.md`](./i18n.md) | Translations, locales and RTL/LTR |
| [`roadmap.md`](./roadmap.md) | What phase 1 delivered and what comes next |

## Tech stack

Nuxt 4 · Vue 3 · TypeScript · Nuxt UI · UnoCSS · @nuxtjs/i18n · Pinia ·
Nitro server routes · Drizzle ORM · PostgreSQL

## Getting started

```bash
npm install
cp .env.example .env     # optional in phase 1 — the site runs without a database
npm run dev              # http://localhost:3000
```

Useful scripts:

```bash
npm run build        # production build
npm run typecheck    # vue-tsc — must stay clean
npm run db:generate  # generate Drizzle migrations (phase 2+)
npm run db:push      # apply the schema to PostgreSQL (phase 2+)
```

### Fonts

Persian text uses **Vazirmatn**. The woff2 files are not committed — see
[`public/fonts/README.md`](../public/fonts/README.md) for the four filenames to
drop in. Until then the site falls back to Tahoma, which renders Persian
correctly with slightly different metrics.

## Rebranding for another printing company

Three files cover the great majority of a rebrand:

1. `shared/theme/brand.ts` — colour scales and semantic tokens
2. `shared/data/site.ts` — company name, contact details, hours, social links
3. `public/brand/` — logo mark and favicon

Everything else reads from those. See [`theming.md`](./theming.md).
