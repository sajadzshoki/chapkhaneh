# Database

PostgreSQL accessed through Drizzle ORM. From phase 3 the database is the
**source of truth** for all site content — the files in `shared/data` are seed
input and typed fallbacks, not runtime content.

## Layout

```
server/
  database/
    schema.ts       Table definitions, constraints, relations
    client.ts       Lazily-created, cached Drizzle client
    mappers.ts      Row -> API DTO (the field allow-list)
    migrate.ts      `npm run db:migrate`
    seed.ts         `npm run db:seed`
    reset.ts        `npm run db:reset`
    migrations/     Generated SQL + journal (committed)
  repositories/
    content.repository.ts   All content queries live here
```

Query logic belongs in the repository, never inline in a route handler. Routes
stay thin: validate input, call a repository function, return the result.

## Setup

```bash
cp .env.example .env          # then edit DATABASE_URL and the secrets
npm run db:migrate            # create the tables
npm run db:seed               # load the demo dataset
npm run dev
```

To start over: `npm run db:reset && npm run db:migrate && npm run db:seed`.

`db:reset` drops **both** the `public` schema and Drizzle's `drizzle`
bookkeeping schema. Dropping only `public` would leave the migration journal
behind, and the next `db:migrate` would believe everything was already applied
and silently create nothing. `db:migrate` therefore also asserts that tables
exist after running, and fails loudly if they do not.

After changing `schema.ts`, generate a migration with `npm run db:generate` and
commit the SQL file. Never hand-create tables.

## Schema

Bilingual text is stored as paired `*_fa` / `*_en` columns rather than JSON, so
Postgres can index and constrain individual fields. `mappers.ts` converts those
pairs back into the `Localized<T>` (`{ fa, en }`) shape the front end uses, so
the UI is unaffected by the storage choice.

| Table | Purpose |
| --- | --- |
| `admin_users` | Single admin account. Unique email, scrypt `password_hash`. |
| `services` | 10 services. Unique slug, `is_active`, `sort_order`. |
| `service_features` | Bullet list per service. |
| `service_specifications` | Spec groups; `values_*` is newline-separated. |
| `pricing_rows` | Price list rows, FK to `services`. |
| `equipment` | Machines. `type_key` constrained to 4 values. |
| `equipment_specs` | Spec rows per machine. |
| `portfolio_categories` | Unique slug. |
| `portfolio_items` | Projects. Unique slug, FK to category. |
| `portfolio_images` | Gallery frames. |
| `portfolio_details` | Production detail rows. |
| `portfolio_services` | Join: project ↔ services used. |
| `faqs` | Category constrained to 4 values. |
| `quote_requests` | Inbound leads. Status constrained to the 4 allowed values. Attachment *metadata* only (`file_url`, `file_name`, `file_size`, `file_mime_type`) — the bytes live on disk outside `public/`, see [`quote-requests.md`](./quote-requests.md). |
| `site_settings` | Single row (`id = 'default'`). |
| `theme_settings` | Single row (`id = 'default'`). |

### Relationships and delete behaviour

```
services ──< pricing_rows            ON DELETE CASCADE
         ──< service_features        ON DELETE CASCADE
         ──< service_specifications  ON DELETE CASCADE
         ──< quote_requests          ON DELETE SET NULL
portfolio_categories ──< portfolio_items   ON DELETE RESTRICT
portfolio_items ──< portfolio_images       ON DELETE CASCADE
                ──< portfolio_details      ON DELETE CASCADE
                ──< portfolio_services     ON DELETE CASCADE
equipment ──< equipment_specs        ON DELETE CASCADE
```

The three behaviours are deliberate:

- **CASCADE** for owned child rows — a price row or gallery image has no meaning
  without its parent.
- **SET NULL** for `quote_requests.service_id` — a quote is a business record and
  must survive deletion of the service it referenced.
- **RESTRICT** for `portfolio_items.category_id` — deleting a category that still
  holds projects would strand them, so the database refuses.

### Constraints and indexes

Unique: service slug, portfolio slug, portfolio category slug, equipment slug,
admin email. Check constraints validate quote status, locale, equipment type,
FAQ category, currency, and non-negative prices/quantities. Indexes cover the
lookups the site actually performs — slug resolution, `(is_active, sort_order)`
listing, and quote status/date/service — rather than every column.

## Seed

`seed.ts` derives the demo dataset from `shared/data/*`, so the seeded site is
byte-for-byte the phase 2 site. It truncates first and is safe to re-run.
Deterministic: no randomised values.

Produces 1 admin, site + theme settings, 10 services (50 features, 42 spec
groups), 17 pricing rows, 9 machines with 31 specs, 5 categories, 10 projects
with 15 gallery images and 30 detail rows, and 10 FAQs.

The admin password is read from `ADMIN_PASSWORD` and stored hashed. The seed
**refuses to run** if that variable is missing or shorter than 10 characters —
there is no hardcoded default password anywhere.
