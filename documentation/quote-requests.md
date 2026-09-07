# Quote requests

The quotation workflow: a visitor describes a print job, optionally attaches
artwork, and the request lands in the admin panel for triage.

This is deliberately **not** an ecommerce system. There is no cart, no payment,
no customer account and no order tracking — a printing job is priced by a human
after looking at the specification, and the software exists to carry that
conversation, not to replace it.

## The flow

```
Entry point (header / hero / service page / pricing / portfolio / contact)
  └─ /quote  ..................... single-page form, service optionally preselected
       └─ POST /api/quote-requests  multipart or JSON
            ├─ rate limit ......... 8 submissions / 10 min / IP
            ├─ file validation .... extension + magic bytes + size
            ├─ field validation ... Zod schema
            ├─ service check ...... must exist AND be active
            ├─ duplicate check .... same phone+service+description within 2 min
            ├─ store file ......... only once everything else passed
            ├─ insert row ......... file metadata only, never the bytes
            └─ notification hook .. no-op logging
       └─ success state .......... confirmation, next steps, return links
```

Entry points all link to `/quote` via `localePath()`. The service detail page
additionally calls `useQuoteStore().preselectService(slug)`.

### Preselection and inactive services

The form only offers services returned by `GET /api/services`, which already
filters on `is_active`. If a preselected slug is not in that list — deactivated
or deleted since the link was followed — the field is simply left empty rather
than submitting a slug the server will reject.

## Form and validation

Required: **full name, phone, service, description**. Everything else
(company, email, quantity, delivery date, attachment) is optional, because most
enquiries arrive before the customer has settled on every detail.

Validation runs in two places with the same rules:

| Where | File | Purpose |
| --- | --- | --- |
| Client | `app/pages/quote.vue` + `app/composables/useQuoteUpload.ts` | Fast feedback; blocks an obviously invalid submit |
| Server | `server/services/quote.service.ts` (`quoteRequestSchema`) + `server/utils/uploads.ts` | The actual authority |

The client check is a convenience. Every rule is re-applied server-side, and
the server never trusts anything the browser sent.

Server field errors come back as `422` with `data.issues` keyed by field name,
which the page maps back onto the individual inputs.

### Failure behaviour

A failed submission keeps every value the customer typed, including the
selected service, shows the reason, and allows an immediate retry. The submit
button is disabled while a request is in flight, and the store refuses a second
concurrent `submit()`, so a double click cannot create two rows.

Beyond that, the server treats an identical (phone, service, description)
within a two-minute window as the same request: it returns the original id with
`duplicate: true` instead of inserting again, and deletes the re-uploaded file.

## File uploads

### Accepted types

| Format | Extensions | MIME |
| --- | --- | --- |
| PDF | `.pdf` | `application/pdf` |
| JPEG | `.jpg` `.jpeg` | `image/jpeg` |
| PNG | `.png` | `image/png` |
| WebP | `.webp` | `image/webp` |
| TIFF | `.tif` `.tiff` | `image/tiff` |
| ZIP | `.zip` | `application/zip` |

Executables are never accepted. The allow-list is closed: anything not in the
table above is rejected.

Extension alone is not trusted. `validateUpload()` also checks the leading
**magic bytes** against the signature expected for that extension, so a
renamed `.exe` is rejected with `fileContent` rather than stored.

### Size

One constant, `MAX_QUOTE_FILE_SIZE` in `server/utils/uploads.ts`, default
15 MB, overridable with the `MAX_QUOTE_FILE_SIZE` environment variable.

`app/composables/useQuoteUpload.ts` mirrors it as `MAX_UPLOAD_BYTES` for the
client-side pre-check, because a browser bundle cannot import server code.
**These two must be kept in sync** — the server value is authoritative.

### Storage

Files are written to `QUOTE_UPLOAD_DIR` (default
`storage/uploads/quote-requests`), which is:

- **outside `public/`**, so nothing is ever served statically
- **gitignored**, so uploads never enter version control
- written with mode `0640`

The stored filename is a generated `randomUUID()` plus the validated extension.
The customer's original filename is kept in the database purely for display in
the admin and for the download's `Content-Disposition`. It never touches the
filesystem, so a hostile filename cannot influence the path.

The database stores **metadata only** — `file_url` (the generated name),
`file_name`, `file_size`, `file_mime_type`. Binary contents are never put in
PostgreSQL.

### Error codes

The API returns a stable code in `data.issues.file[0]`, translated by the
client. No filesystem path ever appears in a customer-facing message.

| Code | Cause |
| --- | --- |
| `fileTooLarge` | Exceeds the configured maximum |
| `fileType` | Extension not in the allow-list |
| `fileContent` | Magic bytes disagree with the extension |
| `fileEmpty` | Zero-byte file |

### Orphan cleanup

A file is written only after all other validation has passed, and is removed
again if the insert fails or the request turns out to be a duplicate. Deleting
a request from the admin also deletes its attachment.

## Download security

`GET /api/admin/quote-requests/:id/file` is the only way to reach an upload.

- Sits behind `server/middleware/admin-guard.ts`; unauthenticated callers get
  `401`. Public users have no route to the storage directory at all.
- The id is validated as a UUID — a traversal string in the URL is a `400`.
- The stored name is resolved with `resolveStoredPath()`, which joins it to the
  upload root, calls `path.resolve()`, and then verifies the result is still
  **contained within** that root. This is a containment check, not string
  replacement: `../`, absolute paths and encoded variants all fail it. Even a
  tampered `file_url` column cannot escape.
- Missing row or missing file → `404`.
- Responses set `Content-Disposition: attachment` with an RFC 5987 encoded
  filename (Persian names survive), the recorded MIME type,
  `X-Content-Type-Options: nosniff` and `Cache-Control: private, no-store`, so
  a browser saves the file rather than rendering it in our origin.

## Statuses

| Value | Persian | English |
| --- | --- | --- |
| `NEW` | جدید | New |
| `REVIEWING` | در حال بررسی | Under review |
| `CONTACTED` | تماس گرفته شد | Contacted |
| `COMPLETED` | تکمیل شده | Completed |

Enforced by a check constraint on `quote_requests.status`. Raw values are never
shown to a user; the admin resolves them through `admin.quotes.statuses.*`.
Status changes persist immediately, from either the list or the detail view.

## Internal notes

`internal_note` is written by staff and is **never public**. It is returned
only by the protected admin endpoints, is absent from every public API
response, and is distinct from `description`, which is the customer's own text
and is not edited by the admin.

## API boundaries

| Endpoint | Auth | Notes |
| --- | --- | --- |
| `POST /api/quote-requests` | public | The only public quote route. Write-only — it returns an id, never stored data. |
| `GET /api/admin/quote-requests` | admin | List, search, status filter, pagination |
| `GET /api/admin/quote-requests/:id` | admin | Detail; exposes file metadata but not `file_url` |
| `PATCH /api/admin/quote-requests/:id` | admin | Status and internal note |
| `DELETE /api/admin/quote-requests/:id` | admin | Also deletes the attachment |
| `GET /api/admin/quote-requests/:id/file` | admin | Download |

There is deliberately **no public read endpoint**. No public API or rendered
page exposes a name, phone number, email, description, note or file path.

## Abuse protection

`server/utils/rate-limit.ts` — an in-memory per-IP counter, 8 submissions per
10 minutes, returning `429` with `Retry-After`. Combined with the size cap,
the closed type allow-list and full server validation, this is proportionate
for a single-deployment brochure site. No external CAPTCHA.

The limiter resets on restart and is per-process; if this is ever scaled
horizontally, swap the `Map` for a shared store — the call sites do not change.

## Notification hook

`server/services/notification.service.ts` exposes
`notifyQuoteRequestCreated()`, called after a successful insert. Today it logs
an id, service slug and whether a file was attached — no personal data — and
never throws, so a notification failure cannot fail the customer's submission.

This is the extension point for email or SMS later. It is intentionally a
no-op: there is no external provider wired up, and pretending to send mail
would be worse than sending nothing.

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `MAX_QUOTE_FILE_SIZE` | `15728640` (15 MB) | Maximum accepted upload, in bytes |
| `QUOTE_UPLOAD_DIR` | `storage/uploads/quote-requests` | Where attachments are written. Must stay outside `public/`. |

## Schema

See [`database.md`](./database.md). Phase 5 added only `file_size`,
`file_mime_type` and an index on `service_id`; the table is a lead record, not
a CRM. `service_id` keeps `ON DELETE SET NULL` so deleting a service preserves
the quote requests that referenced it.
