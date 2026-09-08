import type { Localized } from '~~/shared/types'

interface PageSeoInput {
  /** Page title, without the company suffix — the template adds that. */
  title: string | (() => string | undefined)
  description?: string | (() => string | undefined)
  /** Absolute or root-relative image path for Open Graph. */
  image?: string | (() => string | undefined)
  /** `article` for a portfolio case study, otherwise the site default. */
  type?: 'website' | 'article'
  /** Set for pages that should not be indexed (none of them today). */
  noindex?: boolean
}

/**
 * Canonical and alternate links.
 *
 * `rel` is a literal union rather than `string` because unhead's `Link` type
 * is a discriminated union keyed on it.
 */
type LinkEntry =
  | { rel: 'canonical', href: string }
  | { rel: 'alternate', hreflang: string, href: string }

function resolve(value: string | (() => string | undefined) | undefined): string | undefined {
  const resolved = typeof value === 'function' ? value() : value
  // Guards against `undefined`, `null` and `[object Object]` reaching a tag.
  if (resolved === undefined || resolved === null) return undefined
  const text = String(resolved).trim()
  return text && text !== 'undefined' && text !== 'null' && text !== '[object Object]'
    ? text
    : undefined
}

/**
 * Page-level SEO: title, description, canonical, hreflang alternates and
 * Open Graph, all in one call.
 *
 * Canonical and alternate links are computed from the *unprefixed* route so
 * that `/services` and `/en/services` each declare the correct canonical and
 * point at one another — rather than every locale claiming the same URL.
 *
 * Pages pass getters, not values, because titles come from `useI18n()` and
 * from content that arrives asynchronously; a plain string would freeze the
 * first render's value.
 */
export function usePageSeo(input: PageSeoInput) {
  const { locale, locales, defaultLocale } = useI18n()
  const switchLocalePath = useSwitchLocalePath()
  const { site, localized } = useSite()
  const { absolute } = useSiteUrl()

  const localeCodes = computed(() =>
    locales.value.map(item => (typeof item === 'string' ? item : item.code)))

  const canonical = computed(() => absolute(switchLocalePath(locale.value as 'fa' | 'en')))

  /**
   * One `alternate` per locale plus `x-default`, which points at the default
   * (Persian) locale — the correct signal for a site whose primary audience
   * is Iranian.
   */
  const alternates = computed<LinkEntry[]>(() => {
    const links: LinkEntry[] = localeCodes.value.map(code => ({
      rel: 'alternate' as const,
      hreflang: code === 'fa' ? 'fa-IR' : 'en-US',
      href: absolute(switchLocalePath(code as 'fa' | 'en')),
    }))

    links.push({
      rel: 'alternate' as const,
      hreflang: 'x-default',
      href: absolute(switchLocalePath(defaultLocale as 'fa' | 'en')),
    })

    return links
  })

  const description = computed(() => {
    const own = resolve(input.description)
    if (own) return own

    // Fall back to the deployment's configured default rather than nothing.
    const configured = site.value.seo?.description as Localized | undefined
    return (configured && localized(configured)) || undefined
  })

  const image = computed(() => {
    const own = resolve(input.image) ?? site.value.brand.ogImage
    return own ? absolute(own) : undefined
  })

  const links = computed<LinkEntry[]>(() => [
    { rel: 'canonical' as const, href: canonical.value },
    ...alternates.value,
  ])

  const metaTags = computed(() =>
    (input.noindex ? [{ name: 'robots', content: 'noindex, follow' }] : []))

  useHead({
    title: () => resolve(input.title),
    link: links,
    meta: metaTags,
  })

  useSeoMeta({
    description: () => description.value,
    ogTitle: () => resolve(input.title),
    ogDescription: () => description.value,
    ogUrl: () => canonical.value,
    ogType: input.type ?? 'website',
    ogImage: () => image.value,
  })

  return { canonical }
}
