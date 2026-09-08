/**
 * robots.txt
 *
 * Served from a route rather than `public/` so the sitemap URL always matches
 * the deployment's configured origin instead of being baked in at build time.
 *
 * Only genuinely private paths are disallowed. CSS, JS, fonts, images and
 * every public page stay crawlable — blocking assets would stop search
 * engines rendering the site and hurt rankings.
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const configured = String(config.public.siteUrl ?? '').trim().replace(/\/+$/, '')
  const origin = configured && !/localhost|127\.0\.0\.1/.test(configured)
    ? configured
    : getRequestURL(event).origin.replace(/\/+$/, '')

  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    '# Admin panel and its API — private, and useless in an index.',
    'Disallow: /admin',
    'Disallow: /en/admin',
    'Disallow: /api/admin/',
    '',
    '# Customer uploads are only reachable by an authenticated admin, but they',
    '# are listed here so a crawler never even attempts them.',
    'Disallow: /api/quote-requests',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n')

  setResponseHeaders(event, {
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'public, max-age=3600',
  })

  return body
})
