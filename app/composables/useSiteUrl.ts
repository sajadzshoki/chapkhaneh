/**
 * The canonical public origin for this deployment.
 *
 * Single source of truth for canonical links, Open Graph URLs, the sitemap,
 * robots.txt and structured data. Configured with `NUXT_PUBLIC_SITE_URL`.
 *
 * In development the request origin is used when the configured value still
 * points at localhost, so previews and LAN testing produce working links
 * without anyone editing configuration.
 */
export function useSiteUrl() {
  const config = useRuntimeConfig()
  const requestUrl = useRequestURL()

  const siteUrl = computed(() => {
    const configured = String(config.public.siteUrl ?? '').trim().replace(/\/+$/, '')

    if (configured && !/localhost|127\.0\.0\.1/.test(configured)) return configured

    // Fallback: whatever origin actually served this request.
    return requestUrl.origin.replace(/\/+$/, '')
  })

  /** Joins a path onto the canonical origin. */
  function absolute(path: string): string {
    if (/^https?:\/\//i.test(path)) return path
    return `${siteUrl.value}${path.startsWith('/') ? path : `/${path}`}`
  }

  return { siteUrl, absolute }
}
