# Admin panel and API

A deliberately small internal tool: one admin account, no roles, no permissions,
no user management. Read-only in this phase — editing arrives in phase 4.

## Authentication

Password hashing uses Node's built-in **scrypt** (memory-hard, no native
dependency). Stored as `scrypt$N$r$p$salt$key`, so the cost parameters can be
raised later without invalidating existing passwords. Verification is
constant-time via `timingSafeEqual`.

The session is a **stateless HMAC-signed cookie**, `mb_admin_session`:

- `httpOnly` — unreadable from JavaScript, so it can never end up in
  `localStorage`
- `sameSite=lax`, `secure` in production, 8-hour expiry
- payload is `{ sub, email, iat, exp, jti }`, signed with `NUXT_SESSION_PASSWORD`

A database session table was not used: with a single admin there is no need for
remote revocation, and rotating `NUXT_SESSION_PASSWORD` invalidates every
session at once. `requireAdmin()` still re-checks that the user row exists, so a
deleted admin cannot keep using a valid cookie until it expires.

Login responses deliberately take the same time whether or not the email exists
(a dummy hash is verified on the miss path), and always return the same
`401 Invalid email or password` — the API never reveals which field was wrong.

### Route protection

Two independent layers, because each covers a gap the other cannot:

1. **`server/middleware/admin-guard.ts`** rejects any unauthenticated request to
   `/api/admin/*` except `login` and `logout`. Applied centrally, so a new admin
   endpoint is protected by default and a route author cannot forget.
2. **`app/middleware/admin-auth.ts`** guards the pages. Unauthenticated visitors
   to `/admin/*` are redirected to `/admin/login?redirect=…`; an authenticated
   visitor to `/admin/login` is redirected to `/admin`. Runs on server and
   client, so a direct URL or a refresh is guarded before any markup renders.

The client guard is UX; the server guard is the actual security boundary. The
login page only honours redirect targets beginning with `/admin`, so the
`redirect` query parameter cannot be used as an open redirect.

## API structure

Every admin route lives under `/api/admin/` and is protected by the single
middleware — a new route is guarded by default, and no route repeats an auth
check. Routes follow one CRUD shape per entity:

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/admin/<entity>` | list, with search / filter / pagination |
| POST | `/api/admin/<entity>` | create (`201` on success) |
| GET | `/api/admin/<entity>/:id` | single record with its child rows |
| PUT | `/api/admin/<entity>/:id` | full update |
| DELETE | `/api/admin/<entity>/:id` | delete |
| PATCH | `/api/admin/<entity>/:id/active` | activate / deactivate |
| POST | `/api/admin/<entity>/reorder` | apply an explicit id order |

`<entity>` is one of `services`, `equipment`, `faqs`, `pricing`, `portfolio`,
`portfolio-categories`. Departures from the pattern:

| Method | Route | Notes |
| --- | --- | --- |
| POST | `/api/admin/login` · `/api/admin/logout` | the only public admin routes |
| GET | `/api/admin/me` · `/api/admin/dashboard` | session identity, dashboard counts |
| GET | `/api/admin/services/:id/impact` | rows a delete would cascade to |
| PATCH | `/api/admin/portfolio/:id/flags` | `isActive` and/or `isFeatured` |
| DELETE | `/api/admin/portfolio-categories/:id?moveTo=` | reassigns projects first |
| GET | `/api/admin/quote-requests/:id/file` | streams the customer's upload |
| PATCH | `/api/admin/quote-requests/:id` | status + internal note |
| GET/PUT | `/api/admin/settings` | the single site-settings record |

Quote requests have no create or update route: they are customer submissions,
so the admin can read, re-status and delete them, nothing more.

Public endpoints: `/api/services`, `/api/pricing`, `/api/equipment`,
`/api/portfolio`, `/api/faqs`, `/api/site-settings`, and
`POST /api/quote-requests`.

### List query parameters

`search` (case-insensitive, matches both languages), `page` / `perPage`,
`active` (`all|active|inactive`), `status`, `type`, `category`,
`featured` (`all|yes|no`), `serviceId`. Unknown values are rejected by
`listQuerySchema` rather than silently ignored.

### Status codes

`200` read/update · `201` created · `400` malformed parameter ·
`401` unauthenticated · `404` missing record · `409` conflict (a category still
holding projects, carrying `data.itemCount`) · `422` validation failure (with
`data.issues` per field) · `500` unexpected.

### Error handling

`server/error-handler.ts` is registered as Nitro's `errorHandler`. For `/api/**`
it guarantees the same sanitised body in development and production:

- **5xx** — logged in full server-side, but the client only ever receives
  `"An unexpected error occurred."`. SQL text, connection strings, driver
  internals and stack traces cannot escape.
- **4xx** — the explicit `statusMessage` plus a small allow-list of payload
  fields: `data.issues` (per-field validation messages) and `data.itemCount`
  (how many projects block a category deletion). Nothing else on `error.data`
  is forwarded.

Nitro's *default* handler returns full stack traces in development; overriding it
means what is tested in dev is exactly what ships.

## Validation

Two layers, both mandatory:

- **Client** — each form checks required fields, slug format, email/URL shape
  and numeric ranges before submitting, so the operator gets instant feedback.
- **Server** — `server/utils/admin-schemas.ts` holds one Zod schema per entity,
  shared by the create and update routes. `readValidatedBodyOrThrow` throws a
  422 carrying per-field issues. The client layer is a convenience only;
  nothing is trusted until it passes the server schema.

Rules enforced server-side:

| Rule | Where |
| --- | --- |
| Slug format `^[a-z0-9]+(-[a-z0-9]+)*$` | `slugSchema` |
| Slug uniqueness (safe on edit via `excludeId`) | `assertSlugFree` |
| Foreign keys exist before insert/update | `assertExists` |
| Enum values (equipment type, FAQ category, currency, quote status) | entity schemas |
| Prices and quantities are non-negative integers | `pricingRowInputSchema` |
| Route ids are UUIDs | `validateParam(..., uuidSchema)` |

Prices are stored as plain integers. Formatting (thousands separators, Toman
or Rial) happens in the UI via `useAdminFormat`, so the database never contains
a pre-formatted string such as `"12,500,000 تومان"`.

## Database relationships and delete behaviour

The UI never bypasses referential integrity; it explains the consequence
instead.

| Relationship | On delete | Admin behaviour |
| --- | --- | --- |
| `services` → `pricing_rows` | CASCADE | The confirm dialog calls `/impact` first and states how many pricing rows will go. |
| `services` → `quote_requests` | SET NULL | The dialog warns that requests keep their history but lose the service link. |
| `portfolio_items` → `portfolio_images` / `_details` / `_services` | CASCADE | The dialog states that gallery images are removed too. |
| `portfolio_categories` → `portfolio_items` | **RESTRICT** | Deletion is pre-checked. If projects exist the API returns `409` with `itemCount`, and the dialog offers to move them to another category; both happen in one transaction. Projects are never silently deleted. |
| `equipment` → `equipment_specs` | CASCADE | Specs are replaced wholesale on save. |

Child collections (features, specifications, gallery images, details) are
replaced wholesale on update rather than diffed: the form always submits the
complete list, so diffing would add complexity without changing the result.

## Quote request statuses

`NEW` → `REVIEWING` → `CONTACTED` → `COMPLETED`, stored as a text column with a
check constraint. The raw value never reaches the operator: the UI renders
`admin.quotes.statuses.<STATUS>` so a Persian user sees «در حال بررسی», not
`REVIEWING`. Status can be changed inline from the table for quick triage, or
from the detail dialog together with an internal note.

## Image handling

Images stay path-based — a text column holding `/photos/...` or a URL. There is
deliberately no media library. Every image field offers a live preview beside
the input, and `AdminThumb` falls back to a neutral placeholder when a path is
wrong or empty, so a typo never renders a broken image inside a table. Gallery
entries carry bilingual alt text and are reordered with the same up/down
controls used elsewhere.

## Site settings

A single row keyed `default`, upserted so the invariant holds even if the table
were emptied. The form is grouped into Company, Contact, Address and hours,
Brand assets and Social. Public pages read these values through
`useSite()` — no component hardcodes a phone number, address or company name.
After a successful save the admin refreshes the shared `site-settings` payload
so the public header and footer pick the change up without a reload.

## Admin UI

`app/layouts/admin.vue` is separate from the public `default` layout, so the
marketing site's header, footer and chrome are untouched.

The panel is **bilingual**, like the rest of the product: the operator is a
Persian-speaking printing company, so Persian is the default and the entire
shell mirrors to RTL with it. Admin routes are excluded from i18n URL routing
via `defineI18nRoute(false)` (there is no `/en/admin` twin), so `useAdminLocale`
switches the locale in place and stores the choice in the `mb_admin_locale`
cookie. The cookie is read during SSR, so the first paint is already in the
right language and direction.

Sidebar covers Dashboard, Services, Pricing, Equipment, Portfolio, FAQs, Quote
Requests and Settings, with active-route styling; on narrow screens it collapses
to a scrollable strip.

### The shared pattern

Every management screen is assembled from the same pieces, so there is one
behaviour to learn and one place to fix:

| Component | Responsibility |
| --- | --- |
| `PageHeader` | Title, description, primary create button |
| `FilterBar` | Debounced search plus filter selects, and a clear action |
| `ResourceList` | The table, and the loading / error / empty / no-results states |
| `RowActions` | Reorder, toggle, edit and delete for a row |
| `Pagination` | Range summary and prev/next, hidden on a single page |
| `FormModal` | Create/edit chrome, sticky footer, submit state, error banner |
| `FormSection` / `Field` | Section headings and the two-column grid; label, hint and inline error |
| `RepeatableList` | Add / remove / reorder for nested collections |
| `ConfirmDialog` | Destructive confirmation, explaining consequences |
| `StatusBadge` / `Thumb` | Active pill; image preview with fallback |

`useAdminResource` supplies the data and the mutations (create, update, remove,
setActive, patch, reorder). Each one refreshes the list, raises a toast and
returns a normalised error, so success and failure behave the same everywhere.
`useAdminError` maps a status code to a localized message — network, expired
session, missing record, validation, or a generic fallback — and never surfaces
a raw server error.

Reordering uses explicit up/down buttons rather than drag-and-drop: it is
keyboard accessible, works on touch, and is easy to explain to a non-technical
operator.

### Form behaviour

Long forms are grouped under section headings in a two-column grid, with the
Persian and English members of a pair sitting side by side and each input
carrying its own `dir`. On failure the form keeps every value the operator
typed and shows the errors next to the offending fields — it never resets
silently. Submit is disabled while saving, so a double click cannot create two
records, and the modal cannot be dismissed mid-request.

### Dashboard

Reads `/api/admin/dashboard`: total and active services, portfolio projects,
machines, and new / under-review requests, each linking to its section. Below
them is a list of the latest quote requests linking through to the request.
Every figure is a `count(*)` against PostgreSQL — no hardcoded values and no
decorative charts.

## Adding a new content entity

1. **Schema** — add the table to `server/database/schema.ts`, then
   `npm run db:generate` and `npm run db:migrate`.
2. **Mapper** — add a `to<Entity>Dto` in `server/database/mappers.ts`. This
   doubles as the field allow-list for public responses.
3. **Validation** — add the Zod input schema to
   `server/utils/admin-schemas.ts`.
4. **Repository** — add `adminList / adminGet / adminCreate / adminUpdate /
   adminDelete` to `server/repositories/admin.repository.ts`, reusing
   `assertSlugFree`, `assertExists`, `countChildren` and `applyOrder`.
5. **Routes** — create `server/api/admin/<entity>/` following the CRUD table
   above. Do not add an auth check; the middleware already covers it.
6. **Translations** — add an `admin.<entity>` block to **both**
   `i18n/locales/fa.json` and `en.json`. Both files must stay the same size.
7. **Page** — add `app/pages/admin/<entity>.vue` using `useAdminResource`,
   `useAdminFilters` and the shared components. Do not invent a new pattern.
8. **Navigation** — add the entry to `nav` in `app/layouts/admin.vue`.
