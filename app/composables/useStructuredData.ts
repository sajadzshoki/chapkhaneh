/**
 * Schema.org structured data.
 *
 * Everything emitted here is derived from real database content. There are no
 * ratings, reviews or counts, because the product has no verifiable source for
 * them and fabricating them would be both dishonest and a search-guidelines
 * violation.
 *
 * Fields are omitted when the underlying setting is empty rather than emitted
 * blank, so an incompletely configured deployment produces smaller but still
 * valid markup.
 */

/**
 * Converts Persian/Arabic-Indic digits to ASCII.
 *
 * Phone numbers and postal codes are stored the way they should be *displayed*
 * to a Persian visitor (۰۲۱-۶۶۵۴۳۲۱۰). Structured data is consumed by
 * machines, which cannot parse those glyphs, so the JSON-LD gets the ASCII
 * form while the visible page keeps the Persian one.
 */
function asciiDigits(value: string | undefined): string | undefined {
  if (!value) return undefined
  return value
    .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06F0))
    .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))
}

function pruned(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => {
      if (value === undefined || value === null || value === '') return false
      if (Array.isArray(value) && value.length === 0) return false
      return true
    }),
  )
}

/** Serialises one JSON-LD block into the document head. */
function useJsonLd(id: string, build: () => Record<string, unknown> | null) {
  useHead(() => {
    const data = build()
    if (!data) return {}

    return {
      script: [{
        // `key` prevents duplicate blocks when a page re-renders.
        key: `ld-${id}`,
        type: 'application/ld+json',
        innerHTML: JSON.stringify(data),
      }],
    }
  })
}

/**
 * `LocalBusiness` for the company itself — emitted once, from `app.vue`.
 *
 * A printing company is a physical business with an address and opening hours,
 * so `LocalBusiness` is more accurate than a bare `Organization`.
 */
export function useOrganizationSchema() {
  const { site, localized } = useSite()
  const { absolute, siteUrl } = useSiteUrl()

  useJsonLd('organization', () => {
    const settings = site.value
    const contact = settings.contact

    return pruned({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${siteUrl.value}/#organization`,
      'name': localized(settings.companyName),
      'legalName': localized(settings.legalName),
      'description': localized(settings.description) || undefined,
      'url': siteUrl.value,
      'logo': settings.brand.logo ? absolute(settings.brand.logo) : undefined,
      'image': settings.brand.ogImage ? absolute(settings.brand.ogImage) : undefined,
      'telephone': asciiDigits(contact.phones[0]),
      'faxNumber': asciiDigits(contact.fax),
      'email': contact.email,
      'foundingDate': settings.foundedYear ? String(settings.foundedYear) : undefined,
      'address': pruned({
        '@type': 'PostalAddress',
        'streetAddress': localized(contact.address),
        'addressLocality': localized(contact.city) || undefined,
        'postalCode': asciiDigits(contact.postalCode),
        'addressCountry': 'IR',
      }),
      // Only real, configured profiles.
      'sameAs': settings.social.map(link => link.url),
    })
  })
}

/** `Service` markup for a service detail page. */
export function useServiceSchema(input: {
  name: () => string | undefined
  description: () => string | undefined
  image?: () => string | undefined
}) {
  const { site, localized } = useSite()
  const { absolute, siteUrl } = useSiteUrl()

  useJsonLd('service', () => {
    const name = input.name()
    if (!name) return null

    const image = input.image?.()

    return pruned({
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': name,
      'description': input.description(),
      'image': image ? absolute(image) : undefined,
      'serviceType': name,
      'provider': {
        '@type': 'LocalBusiness',
        '@id': `${siteUrl.value}/#organization`,
        'name': localized(site.value.companyName),
      },
      'areaServed': { '@type': 'Country', 'name': 'Iran' },
    })
  })
}

/** Breadcrumbs help search engines show the site's hierarchy. */
export function useBreadcrumbSchema(items: () => { name: string, path: string }[]) {
  const { absolute } = useSiteUrl()

  useJsonLd('breadcrumbs', () => {
    const list = items().filter(item => item.name)
    if (list.length < 2) return null

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': list.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': absolute(item.path),
      })),
    }
  })
}

/** `FAQPage` markup, built from the real published questions. */
export function useFaqSchema(faqs: () => { question: string, answer: string }[]) {
  useJsonLd('faq', () => {
    const list = faqs().filter(faq => faq.question && faq.answer)
    if (!list.length) return null

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': list.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': { '@type': 'Answer', 'text': faq.answer },
      })),
    }
  })
}
