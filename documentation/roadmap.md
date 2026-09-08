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

## Phase 3 — Database and admin foundation (delivered)

- PostgreSQL + Drizzle schema for all 16 tables, with foreign keys, delete
  behaviour, check constraints and targeted indexes
- Initial migration committed; `db:migrate` / `db:seed` / `db:reset` workflow
- Deterministic seed derived from the phase 2 content
- Admin authentication: scrypt hashing, httpOnly signed session cookie,
  login / logout / session check
- Admin API and page routes protected by server and route middleware
- Admin layout, dashboard with database-backed statistics, and read-only
  screens for every content type
- Public pages migrated off mock data onto database-backed APIs
- Sanitised API errors and shared server-side validation

See [`database.md`](./database.md) and [`admin.md`](./admin.md).

## Phase 4 — Content management (delivered)

- Full CRUD for services, pricing rows, equipment, portfolio projects and their
  categories, and FAQs — create, edit, delete, activate, feature and reorder
- Side-by-side Persian/English editing for every `Localized` field, with each
  input carrying its own text direction
- Bilingual admin UI: Persian by default, RTL/LTR following the locale, chosen
  in place and remembered in the `mb_admin_locale` cookie
- One shared UX pattern across every screen — header, filters, table, modal
  form, confirmation dialog, toasts, pagination, and loading / empty / error
  states — rather than a bespoke design per section
- Server-side search, filtering and pagination on the lists that can grow
- Client *and* server validation, including slug uniqueness that is safe on
  edit, foreign-key checks and enum validation
- Delete confirmations that explain the consequences, and a category deletion
  that offers to move its projects instead of violating the RESTRICT constraint
- Quote request triage: search, status filter, detail view, inline status
  changes, internal notes and a file download that never exposes storage paths
- Site settings editor writing to `site_settings` and reflected on public pages
- Dashboard counts plus a recent-requests list

Content *images* remain path-based, which is a deliberate simplification
rather than a media library. The theme editor left open here was delivered in
phase 6.

## Phase 5 — The quote request workflow (delivered)

Full detail in [`quote-requests.md`](./quote-requests.md).

- Single-page form grouped into Contact / Project / Attachments / Submit, with
  labels, required markers, character limits and errors tied to their fields
- Service list drawn from active database services, with preselection from a
  service detail page and graceful handling when that service is gone
- Matching client and server validation; the server is the authority and also
  verifies the service is active
- File upload accepting PDF, JPG, PNG, WebP, TIFF and ZIP, validated by
  extension *and* magic bytes, with one central size constant
- Local storage outside `public/` under generated UUID filenames; the database
  keeps metadata only, never binary contents
- Download route hardened with resolve-and-contain path checking, admin auth
  and safe download headers
- Real success state with next steps and return links; failure keeps every
  entered value and allows retry without duplicating the request
- Duplicate suppression, per-IP rate limiting, and orphaned-file cleanup
- Notification extension point with a logging no-op implementation
- Admin list with an attachment indicator, and a detail view showing the
  original filename, type and size behind an authenticated download

## Phase 6 — White-label & production readiness (delivered)

See [`white-label.md`](./white-label.md), [`theming.md`](./theming.md),
[`seo.md`](./seo.md) and [`deployment.md`](./deployment.md).

- Company identity fully database-driven: no component hardcodes a name, logo,
  contact detail or colour. The company name reaches translated strings through
  the linked message `@:brand.company`
- Theme editor at `/admin/settings/theme`: eight colours via picker or hex,
  five presets, validation, an isolated live preview, and save/cancel. Changes
  apply without a rebuild, delivered as a render-blocking `/theme.css` so there
  is no flash of the wrong theme
- Theme values sanitised on write *and* read against a strict hex pattern —
  no path exists for CSS injection
- Palette duplication resolved by codegen (`npm run theme:generate`) rather
  than a CSS pipeline, because Tailwind v4 needs literal values at build time
- SEO foundation: localised titles, descriptions, canonicals, hreflang and OG
  tags on every public route, driven by one `NUXT_PUBLIC_SITE_URL`
- `sitemap.xml`, `robots.txt` and Organization / Service / Breadcrumb / FAQ
  JSON-LD. No fabricated reviews or ratings
- Branded, localised 404s for unknown public *and* admin paths
- Four optional SEO default fields on `site_settings`; page content still wins
- Documentation rewritten to match the code, including a "for the next AI or
  developer" section

Deferred, and still genuinely open:

- Self-hosted Vazirmatn woff2 files (see `public/fonts/README.md`)
- Real photography replacing the placeholder plates
- Image optimisation via `@nuxt/image`
- Error tracking and a deployment pipeline
- A real notification transport behind the existing hook

## Reselling the product

The architecture assumes this codebase is resold to other printing companies.
As of phase 6 a rebrand requires **no code changes** — company details, brand
assets, colours and content are all edited in the admin. See
[`white-label.md`](./white-label.md).

Code-level defaults (`shared/theme/brand.ts`, `shared/data/*.ts`) only decide
what a *fresh* install looks like before an owner customises it.

Multi-tenancy remains explicitly out of scope: each client gets their own
deployment and database.
