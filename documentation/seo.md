# SEO

No page hardcodes the company name. Everything below is derived from
`site_settings` and the page's own content, so it follows a white-label
rename automatically.

## Per-page metadata

Public pages call `usePageSeo()` (`app/composables/usePageSeo.ts`), which sets:

- `<title>`, run through the localised `meta.titleTemplate`
  (`"{page} {'|'} @:brand.company"`).
- `<meta name="description">`.
- `<link rel="canonical">`.
- `<link rel="alternate" hreflang>` for `fa-IR`, `en-US` and `x-default`
  (pointing at the Persian default), derived from `switchLocalePath()` so
  nested and dynamic routes are correct.
- `og:title`, `og:description`, `og:image`, `og:locale`, `og:site_name`.

> **Watch out:** a bare `|` in a locale message is @intlify's plural separator
> and will silently truncate the string. It must be escaped as `{'|'}`.

Values are always coerced to strings before being emitted, so a missing field
renders as an omitted tag rather than `undefined`, `null` or `[object Object]`.
When a page title already contains the company name (`About Mobin Bartar`) the
suffix is skipped instead of repeating it.

Dynamic pages — service, portfolio, equipment, FAQ, contact and quote — build
their description from the record's own content and fall back to the site
defaults when a field is empty.

## Defaults

`site_settings` carries `defaultSeoTitleFa/En` and
`defaultSeoDescriptionFa/En`, editable under Settings → Search engine defaults.
A page's own metadata always wins; these only fill gaps. Left blank, they fall
back to the company name and description.

## Structured data

`app/composables/useStructuredData.ts` emits JSON-LD:

- **Organization / LocalBusiness** on every page — name, logo, contact details,
  address and social profiles from `site_settings`.
- **Service** on service detail pages.
- **BreadcrumbList** on nested pages.
- **FAQPage** on the FAQ page.

Phone, fax and postal code are normalised to ASCII digits with `asciiDigits()`,
because consumers of structured data expect them, while the visible page keeps
Persian digits.

There are **no** review, rating or testimonial schemas. The demo has no real
reviews, and inventing them would be both dishonest and a search penalty.

## Sitemap and robots

`server/routes/sitemap.xml.ts` and `server/routes/robots.txt.ts` are plain
Nitro routes sharing the origin logic described in
[`deployment.md`](./deployment.md).

The sitemap lists every indexable public route in both locales plus all
database-backed service, portfolio, equipment and pricing pages — 58 URLs for
the seeded demo. Admin routes, login, API endpoints and upload paths are all
excluded.

`robots.txt` allows public content and disallows `/admin`, `/en/admin`,
`/api/admin/` and `/api/quote-requests`. It does **not** block CSS, JS or
images — including `/theme.css`, which must be crawlable for the page to render
correctly for search engines.

## 404s

`app/pages/[...slug].vue` catches unknown public paths and
`app/pages/admin/[...slug].vue` catches unknown admin paths. Both return a real
404 status while rendering a normal, localised page — public 404s keep the site
chrome and offer routes back; admin 404s stay inside the admin shell. Neither
leaks a stack trace or filesystem path.

These pages exist because without a matching route Nitro answers with a JSON
error body, which is fine for an API and wrong for a person.
