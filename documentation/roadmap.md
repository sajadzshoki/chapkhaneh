# Roadmap

## Phase 1 — Foundation ✅

Delivered:

- Nuxt 4 + Vue 3 + TypeScript project with strict typing and a clean build
- Persian/English i18n with correct RTL/LTR switching
- Centralised design tokens; the brand colour changes in one file
- Replaceable Mobin Bartar branding (logo, favicon, company profile)
- Global header (nav, language switcher, quote CTA) and footer
- 11 public routes including service and portfolio detail pages
- Reusable component library (`app/components/ui/`)
- Domain TypeScript models for every planned entity
- Realistic mock content for a large printing company
- Working quote request form → validated API endpoint
- Drizzle schema and lazy PostgreSQL client
- Responsive desktop-first layout; accessibility foundations
- `npm run typecheck` and `npm run build` both clean

Deliberately **not** built: multi-tenancy, RBAC, customer accounts, payments,
a CMS, a page builder, analytics, chat.

## Phase 2 — Database & admin foundation

- Provision PostgreSQL; run `db:generate` / `db:push`
- Admin authentication for `AdminUser` (session cookie, password hashing)
- Admin layout and dashboard shell (translations already exist under `admin.*`)
- Quote request inbox: list, filter by status, update status, internal notes
- Email notification on new quote requests

## Phase 3 — Content management

- Move services, pricing, equipment, portfolio and FAQ into PostgreSQL
- Admin CRUD with side-by-side Persian/English editing for `Localized` fields
- Image upload and management for portfolio and equipment
- Site settings editor writing to the `site_settings` table
- Theme editor for primary/secondary/accent, logo and favicon
  (`useThemeStore().applyOverrides` already supports this)

## Phase 4 — Production readiness

- Self-hosted Vazirmatn woff2 files (see `public/fonts/README.md`)
- Real photography replacing the placeholder plates
- `sitemap.xml`, `robots.txt`, JSON-LD `Organization` and `Product` schema
- Image optimisation via `@nuxt/image`
- Lighthouse pass, rate limiting on the quote endpoint, spam protection
- Error tracking and deployment pipeline

## Reselling the product

The architecture assumes this codebase is resold to other printing companies.
A rebrand touches:

1. `shared/theme/brand.ts` — colour scales
2. `app/assets/css/main.css` + `tokens.css` — mirrored literal values
3. `shared/data/site.ts` — company profile
4. `public/brand/` and `public/favicon.svg` — logo and favicon
5. `shared/data/*.ts` — content, once the admin panel exists this becomes
   client-editable rather than a code change

Multi-tenancy remains explicitly out of scope: each client gets their own
deployment and database.
