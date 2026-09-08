import {
  listPortfolioItems,
  listServices,
} from '../repositories/content.repository'

/**
 * XML sitemap.
 *
 * Hand-built rather than pulling in a sitemap module: the route list is small
 * and entirely known, and the i18n strategy (`prefix_except_default`, Persian
 * unprefixed) is unusual enough that configuring a generic module would be
 * more work than emitting the XML directly.
 *
 * Each URL is listed once per locale, with `xhtml:link` alternates pointing at
 * the other locale, which is what Google expects for a bilingual site.
 *
 * Only public, indexable content is included. Admin routes, API routes, the
 * login page and uploaded files are all deliberately absent.
 */

const LOCALES = ['fa', 'en'] as const
type Locale = typeof LOCALES[number]

/** Persian is the default locale and therefore has no URL prefix. */
function localizedPath(path: string, locale: Locale): string {
  const clean = path === '/' ? '' : path
  return locale === 'fa' ? clean || '/' : `/en${clean}`
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

interface Entry {
  path: string
  changefreq: string
  priority: string
  lastmod?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const configured = String(config.public.siteUrl ?? '').trim().replace(/\/+$/, '')
  const origin = configured && !/localhost|127\.0\.0\.1/.test(configured)
    ? configured
    : getRequestURL(event).origin.replace(/\/+$/, '')

  // Static routes. `/quote` is included — it is a real landing page people
  // search for — but nothing behind it (submissions, files) is.
  const entries: Entry[] = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/services', changefreq: 'weekly', priority: '0.9' },
    { path: '/portfolio', changefreq: 'weekly', priority: '0.8' },
    { path: '/pricing', changefreq: 'weekly', priority: '0.8' },
    { path: '/equipment', changefreq: 'monthly', priority: '0.7' },
    { path: '/about', changefreq: 'monthly', priority: '0.6' },
    { path: '/faq', changefreq: 'monthly', priority: '0.6' },
    { path: '/contact', changefreq: 'monthly', priority: '0.7' },
    { path: '/quote', changefreq: 'monthly', priority: '0.7' },
  ]

  try {
    const [services, portfolio] = await Promise.all([
      listServices({ activeOnly: true }),
      listPortfolioItems({ activeOnly: true }),
    ])

    for (const service of services) {
      entries.push({
        path: `/services/${service.slug}`,
        changefreq: 'monthly',
        priority: '0.8',
      })
    }

    for (const item of portfolio) {
      entries.push({
        path: `/portfolio/${item.slug}`,
        changefreq: 'monthly',
        priority: '0.6',
      })
    }
  }
  catch {
    // A database problem should still yield a valid sitemap of static routes
    // rather than a 500 that search engines will retry against.
  }

  const urls = entries.flatMap(entry =>
    LOCALES.map((locale) => {
      const loc = escapeXml(`${origin}${localizedPath(entry.path, locale)}`)
      const alternates = LOCALES.map((alt) => {
        const href = escapeXml(`${origin}${localizedPath(entry.path, alt)}`)
        const hreflang = alt === 'fa' ? 'fa-IR' : 'en-US'
        return `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`
      }).join('\n')

      const xDefault = escapeXml(`${origin}${localizedPath(entry.path, 'fa')}`)

      return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        alternates,
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefault}"/>`,
        entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : '',
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        '  </url>',
      ].filter(Boolean).join('\n')
    }),
  ).join('\n')

  setResponseHeaders(event, {
    'content-type': 'application/xml; charset=utf-8',
    'cache-control': 'public, max-age=3600',
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`
})
