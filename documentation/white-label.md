# White-label onboarding

This application is a **product**, not one company's website. Mobin Bartar is
the seeded demo. Onboarding a different printing company is a configuration
job, not a coding job.

## What is configurable where

| Layer | Changed by | Examples |
| --- | --- | --- |
| **Database** (admin UI) | The company owner, at any time, no deploy | Company name, tagline, description, phone, fax, email, address, postal code, opening hours, social links, logo, favicon, OG image, SEO defaults, the 8 brand colours, and all services, pricing, equipment, portfolio and FAQ content |
| **Environment** (`.env`) | Whoever deploys | Database connection, admin credentials, session secret, upload directory, max upload size, public site URL |
| **Code** | A developer | UI labels and app translations (`i18n/locales/`), default palette (`shared/theme/brand.ts`), page structure, new features |

The rule of thumb: **business content is data, interface text is code.** A
button that says "Request a quote" is the same for every printing company, so
it stays in i18n. The phone number is not, so it lives in the database.

## The 13 steps

1. **Clone and install.**
   ```bash
   git clone <repo> && cd chapkhaneh
   npm install
   ```
2. **Create a PostgreSQL database.**
   ```bash
   createdb mobin_bartar
   ```
3. **Configure the environment.** Copy `.env.example` to `.env` and set every
   value — see [`deployment.md`](./deployment.md). At minimum change
   `DATABASE_URL`, `NUXT_SESSION_PASSWORD`, `ADMIN_PASSWORD` and
   `NUXT_PUBLIC_SITE_URL`.
4. **Run the migrations.**
   ```bash
   npm run db:migrate
   ```
5. **Seed the demo content.**
   ```bash
   npm run db:seed
   ```
   This gives you a working site to edit rather than empty pages. It is
   idempotent and safe to re-run.
6. **Start the app** (`npm run dev`, or build and serve for production) and sign
   in at `/admin` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
7. **Change the company identity.** `/admin/settings` → General: company name,
   legal name, tagline and description, in both Persian and English. These
   propagate to the header, footer, page titles, OG tags and structured data
   automatically.
8. **Change the contact details.** Same page: phone, fax, email, address,
   postal code and opening hours. The contact page, footer and LocalBusiness
   schema all read from here.
9. **Replace the brand assets.** Settings → Brand: logo, favicon and OG image
   are URLs. Drop the files into `public/brand/` (or point at a CDN) and set
   the paths. Each falls back to a sensible default if left empty.
10. **Set the brand colours.** `/admin/settings/theme`. Pick a preset as a
    starting point or enter your own hex values. The preview shows the result
    before you commit; Save applies it to the public site with no rebuild.
11. **Replace the content.** Work through Services, Pricing, Equipment,
    Portfolio and FAQs in the admin. Delete what does not apply and write real
    copy — the seeded text describes Mobin Bartar's actual capabilities and
    will be wrong for another company.
12. **Set the social links and SEO defaults.** Settings → Social and Settings →
    Search engine defaults. Leave the SEO fields blank to fall back to the
    company name and description.
13. **Deploy.** Set `NUXT_PUBLIC_SITE_URL` to the real public origin (this
    single value drives canonical URLs, hreflang, the sitemap, robots.txt, OG
    tags and structured data), run `npm run build`, and serve
    `node .output/server/index.mjs` behind HTTPS.

## Verifying an onboarding

After step 13, check:

- The header, footer and contact page show the new company.
- `/en` shows English and the layout is left-to-right.
- View source on the homepage: `<title>`, `og:site_name` and the Organization
  JSON-LD all carry the new name.
- `/sitemap.xml` and `/robots.txt` use the production origin, not localhost.
- `/theme.css` serves the new primary colour.

## What is *not* included

No ecommerce, payments, customer accounts, CRM, role-based permissions,
multi-tenancy or media library. One company per deployment, one admin account,
one practical CMS.
