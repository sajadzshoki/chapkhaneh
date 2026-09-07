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

| Method | Route | Auth |
| --- | --- | --- |
| POST | `/api/admin/login` | public |
| POST | `/api/admin/logout` | public |
| GET | `/api/admin/me` | required |
| GET | `/api/admin/dashboard` | required |
| GET | `/api/admin/services` | required |
| GET | `/api/admin/pricing` | required |
| GET | `/api/admin/equipment` | required |
| GET | `/api/admin/portfolio` | required |
| GET | `/api/admin/portfolio-categories` | required |
| GET | `/api/admin/faqs` | required |
| GET | `/api/admin/quote-requests` | required |
| GET | `/api/admin/settings` | required |

Public endpoints: `/api/services`, `/api/pricing`, `/api/equipment`,
`/api/portfolio`, `/api/faqs`, `/api/site-settings`, and
`POST /api/quote-requests`.

### Status codes

`200` read · `201` created · `400` malformed parameter · `401` unauthenticated ·
`404` missing · `422` validation failure (with `data.issues` per field) ·
`500` unexpected.

### Error handling

`server/error-handler.ts` is registered as Nitro's `errorHandler`. For `/api/**`
it guarantees the same sanitised body in development and production:

- **5xx** — logged in full server-side, but the client only ever receives
  `"An unexpected error occurred."`. SQL text, connection strings, driver
  internals and stack traces cannot escape.
- **4xx** — the explicit `statusMessage` plus any validation `data.issues`,
  which are safe and useful.

Nitro's *default* handler returns full stack traces in development; overriding it
means what is tested in dev is exactly what ships.

## Validation

`server/utils/validation.ts` holds shared Zod schemas (email, slug, uuid, quote
status, price) and `readValidatedBodyOrThrow`, which throws a 422 carrying
per-field issues. Every write path re-validates server-side; client validation is
treated purely as a convenience.

## Admin UI

`app/layouts/admin.vue` is separate from the public `default` layout, so the
marketing site's header, footer and RTL chrome are untouched. The admin is
`dir="ltr"` English — an internal single-operator tool, excluded from the public
i18n routing via `defineI18nRoute(false)` so no `/en/admin` duplicates exist.

Sidebar covers Dashboard, Services, Pricing, Equipment, Portfolio, FAQs, Quote
Requests and Settings, with active-route styling; on narrow screens it collapses
to a scrollable strip. The header shows the page title, the signed-in email and
a logout action.

`app/components/admin/ResourceList.vue` owns the loading / error / empty / loaded
states for every content screen, so the pages only declare their columns.

The dashboard reads `/api/admin/dashboard`; every figure is a `count(*)` against
PostgreSQL, never a hardcoded value. Because CRUD is out of scope this phase, no
screen renders a button that does nothing — the read-only limitation is stated
in the UI instead.
