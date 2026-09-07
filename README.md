# Mobin Bartar — Printing Company Website

A production-oriented website product for large professional printing
companies. Persian-first, RTL by default, with full English support.
The current demo brand is **Mobin Bartar / مبین برتر**.

**Nuxt 4 · Vue 3 · TypeScript · Nuxt UI · UnoCSS · @nuxtjs/i18n · Pinia ·
Drizzle ORM · PostgreSQL**

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

The site runs without a database in its current phase. Copy `.env.example` to
`.env` and set `DATABASE_URL` to enable persistence of quote requests.

```bash
npm run build        # production build
npm run typecheck    # vue-tsc
```

## Documentation

Full documentation lives in [`documentation/`](./documentation/):

- [Architecture](./documentation/architecture.md) — folder layout and conventions
- [Theming](./documentation/theming.md) — design tokens and rebranding
- [Content](./documentation/content.md) — domain types and mock data
- [i18n](./documentation/i18n.md) — translations and RTL/LTR
- [Roadmap](./documentation/roadmap.md) — phases and scope

## Rebranding

Edit `shared/theme/brand.ts` (colours), `shared/data/site.ts` (company details)
and `public/brand/` (logo, favicon). See the theming guide for details.
