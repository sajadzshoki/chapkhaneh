<script setup lang="ts">
const { site, localized } = useSite()
const { t, locale } = useI18n()
const head = useLocaleHead()
const { siteUrl } = useSiteUrl()

/** Favicon type is inferred from the configured path so a PNG works too. */
const faviconType = computed(() => {
  const path = site.value.brand.favicon
  if (path.endsWith('.png')) return 'image/png'
  if (path.endsWith('.ico')) return 'image/x-icon'
  return 'image/svg+xml'
})

/**
 * Default description for pages that do not set their own.
 *
 * Preference order: the deployment's configured SEO description, then the
 * company description, then the generic i18n string. This is what keeps a new
 * customer from shipping with another company's copy.
 */
const defaultDescription = computed(() => {
  const configured = site.value.seo?.description
  if (configured) {
    const value = localized(configured)
    if (value) return value
  }

  const description = localized(site.value.description)
  return description || t('meta.defaultDescription')
})

const ogImage = computed(() => {
  const image = site.value.brand.ogImage
  return image ? new URL(image, siteUrl.value).toString() : undefined
})

useHead(() => ({
  htmlAttrs: {
    lang: head.value.htmlAttrs?.lang,
    dir: head.value.htmlAttrs?.dir,
  },
  link: [
    { rel: 'icon', type: faviconType.value, href: site.value.brand.favicon },
    // Render-blocking by design: the palette must be known before first paint,
    // otherwise the seeded colours would flash before the real theme applies.
    { rel: 'stylesheet', href: '/theme.css' },
    ...(head.value.link ?? []),
  ],
  meta: head.value.meta ?? [],
}))

/**
 * Appends the company name to every page title.
 *
 * Registered in its own `useHead` call: a `titleTemplate` declared inside the
 * same reactive entry as `link`/`meta` above gets superseded by the per-page
 * `title` that pages register later, which silently dropped the suffix.
 */
useHead({
  titleTemplate: (chunk?: string) => {
    // No page title: use the configured SEO title, else the legal/company name.
    if (!chunk) {
      const configured = site.value.seo?.title
      return (configured && localized(configured))
        || localized(site.value.legalName)
        || localized(site.value.companyName)
    }
    // Some titles already contain the company name ("About Mobin Bartar").
    // Appending it again would read badly, so the suffix is skipped.
    const company = localized(site.value.companyName)
    if (company && chunk.includes(company)) return chunk

    // The separator lives in i18n; the company name is resolved by the linked
    // `@:brand.company` message, which the site-identity plugin populates.
    return t('meta.titleTemplate', { page: chunk })
  },
})

useSeoMeta({
  description: () => defaultDescription.value,
  ogSiteName: () => localized(site.value.companyName),
  ogLocale: () => (locale.value === 'fa' ? 'fa_IR' : 'en_US'),
  ogType: 'website',
  ogImage: () => ogImage.value,
  twitterCard: () => (ogImage.value ? 'summary_large_image' : 'summary'),
})

// Organisation-level structured data, emitted once for the whole site.
useOrganizationSchema()
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
