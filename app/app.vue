<script setup lang="ts">
const { site, localized } = useSite()
const { t, locale } = useI18n()
const head = useLocaleHead()

useHead(() => ({
  htmlAttrs: {
    lang: head.value.htmlAttrs?.lang,
    dir: head.value.htmlAttrs?.dir,
  },
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: site.brand.favicon },
    ...(head.value.link ?? []),
  ],
  meta: head.value.meta ?? [],
  // `meta.titleTemplate` holds e.g. "%s | Mobin Bartar" per locale.
  titleTemplate: (chunk?: string) =>
    chunk ? t('meta.titleTemplate').replace('%s', chunk) : localized(site.legalName),
}))

useSeoMeta({
  description: () => t('meta.defaultDescription'),
  ogSiteName: () => localized(site.companyName),
  ogLocale: () => (locale.value === 'fa' ? 'fa_IR' : 'en_US'),
  ogType: 'website',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
