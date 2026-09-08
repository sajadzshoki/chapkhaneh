# Deployment

## Environment variables

Every value lives in `.env`, which is gitignored and must never be committed.
Copy `.env.example` and change all of the marked values.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string used by Drizzle and Nitro. |
| `NUXT_PUBLIC_SITE_URL` | yes in production | The canonical public origin, e.g. `https://www.example.ir`. Drives canonical links, hreflang, `sitemap.xml`, `robots.txt`, OG tags and structured data. |
| `NUXT_SESSION_PASSWORD` | yes | Signs the admin session cookie. Minimum 32 characters. Generate with `openssl rand -base64 32`. Rotating it signs everyone out. |
| `ADMIN_EMAIL` | yes | Email of the single admin account. Read at seed time. |
| `ADMIN_PASSWORD` | yes | Password for that account. Read at seed time only, then stored as a scrypt hash. |
| `MAX_QUOTE_FILE_SIZE` | no | Max attachment size in bytes. Default `15728640` (15 MB). |
| `QUOTE_UPLOAD_DIR` | no | Where attachments are written. Default `storage/uploads/quote-requests`. Must stay outside `public/`. |

There are no hardcoded secrets anywhere in the codebase. Nothing sensitive is
exposed to the browser: `runtimeConfig.public` contains only `siteUrl`.

### About `NUXT_PUBLIC_SITE_URL`

If it is unset, or still points at localhost, the app falls back to the origin
of the incoming request. That keeps LAN testing and preview deployments
working. **In production set it explicitly**, otherwise a request arriving with
an unexpected `Host` header can end up in your canonical tags.

## Deploying

```bash
npm ci
npm run db:migrate      # idempotent; safe on every deploy
npm run build
NODE_ENV=production node .output/server/index.mjs
```

Serve behind a reverse proxy that terminates HTTPS and forwards
`X-Forwarded-Proto` and `X-Forwarded-Host`. The session cookie is
`httpOnly`, `sameSite=lax` and marked `secure` in production, so admin login
will not work over plain HTTP.

Seed **once**, on first deploy only:

```bash
npm run db:seed
```

### Persistent storage

`storage/uploads/` holds customer attachments and is gitignored. It must be a
persistent volume — on an ephemeral filesystem, uploads vanish on redeploy.
Back it up alongside the database.

## Database commands

| Command | Safe in production | What it does |
| --- | --- | --- |
| `npm run db:migrate` | yes | Applies pending migrations. |
| `npm run db:seed` | first deploy only | Inserts the demo content and the admin account. Idempotent. |
| `npm run db:generate` | dev | Generates a migration from schema changes. |
| `npm run db:studio` | dev | Opens Drizzle Studio. |
| `npm run db:reset` | **no** | Drops and recreates everything. Refuses to run when `NODE_ENV=production`. |

`db:reset` is a development convenience and is deliberately **not** exposed
anywhere in the admin UI. There is no button that can wipe production data.

## Post-deploy checklist

- [ ] `/` and `/en` render, with correct RTL and LTR direction.
- [ ] `/admin` redirects to the login page when signed out.
- [ ] Signing in works and the dashboard shows real database counts.
- [ ] `/theme.css` serves the saved palette.
- [ ] `/robots.txt` and `/sitemap.xml` show the production origin.
- [ ] Page source shows the right `<title>`, `og:*` and JSON-LD.
- [ ] A quote request with an attachment submits successfully.
- [ ] The attachment downloads for a signed-in admin and 401s otherwise.
