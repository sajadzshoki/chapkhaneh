# Mobin Bartar — Printing Company Website

A production-oriented website product for large professional printing
companies. Persian-first, RTL by default, with full English support.
The current demo brand is **Mobin Bartar / مبین برتر**.

**Nuxt 4 · Vue 3 · TypeScript · Nuxt UI · UnoCSS · @nuxtjs/i18n · Pinia ·
Drizzle ORM · PostgreSQL**

## Quick start

Requires PostgreSQL — all site content is served from the database.

```bash
npm install
cp .env.example .env     # set DATABASE_URL, NUXT_SESSION_PASSWORD, ADMIN_PASSWORD
npm run db:migrate       # create the tables
npm run db:seed          # load the demo content + admin account
npm run dev              # http://localhost:3000
```

The admin panel is at `/admin`, using the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you
set before seeding.

```bash
npm run build        # production build
npm run typecheck    # vue-tsc
npm run db:reset     # drop and start over (development only)
```

## Documentation

Full documentation lives in [`documentation/`](./documentation/):

- [Architecture](./documentation/architecture.md) — folder layout and conventions
- [Theming](./documentation/theming.md) — design tokens and rebranding
- [Content](./documentation/content.md) — domain types and seed content
- [Database](./documentation/database.md) — schema, migrations and seeding
- [Admin](./documentation/admin.md) — authentication, API and admin panel
- [i18n](./documentation/i18n.md) — translations and RTL/LTR
- [Roadmap](./documentation/roadmap.md) — phases and scope

## Rebranding

Edit `shared/theme/brand.ts` (colours), `shared/data/site.ts` (company details,
then re-seed) and `public/brand/` (logo, favicon). See the theming guide.
