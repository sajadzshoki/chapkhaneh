# Content

> **Phase 3 update.** PostgreSQL is now the source of truth for all site
> content. The files in `shared/data/*` are no longer read at runtime by the
> public pages — they are the **seed input** (`server/database/seed.ts`) and,
> for `site.ts` only, a typed first-paint fallback in `useSite()`.
>
> To change site content now, use the admin panel at `/admin` — from phase 4 it
> is a full CMS covering services, pricing, equipment, portfolio, FAQs and site
> settings. Editing the seed and re-running it remains the way to reset a fresh
> environment. See [`database.md`](./database.md) and [`admin.md`](./admin.md).

## Company information

`shared/data/site.ts` is the single source for company identity: name, legal
name, tagline, description, founding year, phones, emails, address, postal code,
map URL, working hours, social links and brand asset paths.

Components read it through `useSite()`:

```vue
<script setup lang="ts">
const { site, companyName, localized } = useSite()
</script>
<template>
  <p>{{ localized(site.contact.address) }}</p>
</template>
```

Never hardcode a phone number or address in a component. The header utility bar,
footer, contact page and quote sidebar all render from this one object.

## Domain types

Defined in `shared/types/`, split by concern:

| File | Types |
| --- | --- |
| `common.ts` | `LocaleCode`, `Localized<T>`, `Sluggable`, `ImageAsset`, `SeoMeta` |
| `content.ts` | `Service`, `PricingRow`, `PricingGroup`, `Equipment`, `PortfolioCategory`, `PortfolioItem`, `Faq` |
| `quote.ts` | `QuoteRequestInput`, `QuoteRequest`, `QuoteStatus` |
| `settings.ts` | `SiteSettings`, `ThemeSettings`, `AdminUser`, `ContactInfo`, `WorkingHours`, `SocialLink`, `BrandAssets` |

`Localized<T>` is `Record<LocaleCode, T>` — every piece of content carries all
languages, which is what allows instant language switching with no refetch.

## Mock data

| File | Contents |
| --- | --- |
| `services.ts` | 10 services: offset, digital, book, magazine, catalogue, brochure, packaging, label, business card, post-press |
| `pricing.ts` | 5 pricing groups with realistic Toman unit prices |
| `equipment.ts` | 8 machines (Heidelberg, Komori, Ryobi, Konica Minolta, Kodak CTP, Polar, Horizon, Bobst) |
| `portfolio.ts` | 5 categories, 10 projects with clients and production details |
| `faq.ts` | 10 questions across orders / technical / delivery / pricing |
| `site.ts` | Company profile and headline statistics |

The content is written as a real printing company would describe itself:
plausible machine specifications, realistic run lengths and paper weights,
genuine industry standards (ISO 12647-2, PUR binding, FBB board). No Lorem
ipsum, and no invented specifications that a print buyer would spot as false.

Each data file exports small helpers alongside the array — `getServiceBySlug`,
`featuredServices`, `getPricingGroupsForService`, `faqsByCategory` and so on.
Prefer these over filtering inline in components.

## Images

| Path | What |
| --- | --- |
| `public/photos/` | Production photography (press hall, quality control) |
| `public/portfolio/` | Generated SVG placeholder plates, one per project |
| `public/brand/` | `logo.svg`, `mark.svg` |
| `public/favicon.svg` | Favicon |

Portfolio placeholders are flat SVGs rather than fake photographs — they read as
intentional design, not as stock imagery. Replace them with real project
photography per client.

Every `ImageAsset` carries a `Localized` `alt`, so alternative text is
translated too.

## Prices

`PricingRow.price` is a **number in Toman (IRT)**, never a preformatted string.
Formatting happens at render time via `formatNumber()` so Persian shows Persian
digits. This also keeps rows sortable and comparable.

## Moving to the database

When a content type moves to PostgreSQL:

1. Add the table to `server/database/schema.ts`, keeping `Localized` fields as
   `jsonb` so the shape matches the existing types.
2. Add a service in `server/services/` returning the same domain type.
3. Expose it via `server/api/`.
4. Switch the page from a direct `shared/data` import to `useFetch`.

Components need no changes — they already receive typed domain objects.
