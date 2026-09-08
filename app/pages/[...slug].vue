<script setup lang="ts">
/**
 * Catch-all for unknown public paths.
 *
 * Without a matching route, Nitro answers unmatched URLs with a JSON error
 * body. Matching here keeps the request inside Nuxt's render pipeline so the
 * visitor gets the branded, localised "not found" screen with the header,
 * footer and a route back into the site.
 *
 * The page renders the state inline rather than calling `showError`, because
 * an error thrown during SSR is handed to the Nitro error handler and
 * serialised as JSON. This mirrors how the service and portfolio detail pages
 * handle unknown slugs: real 404 status for crawlers, normal page for people.
 */
const localePath = useLocalePath()
const { t } = useI18n()

if (import.meta.server) {
  setResponseStatus(useRequestEvent()!, 404)
}

usePageSeo({
  title: () => t('states.notFoundTitle'),
  noindex: true,
})
</script>

<template>
  <UiPageContainer class="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
    <p class="text-6xl font-extrabold text-[var(--color-border-strong)] tabular">
      404
    </p>
    <h1 class="mt-5 text-2xl font-extrabold tracking-tight text-[var(--color-foreground)] lg:text-3xl">
      {{ $t('states.notFoundTitle') }}
    </h1>
    <p class="mt-3 max-w-md text-[var(--color-muted)]">
      {{ $t('states.notFoundDescription') }}
    </p>
    <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
      <UButton :to="localePath('/')" color="primary" size="lg">
        {{ $t('states.backHome') }}
      </UButton>
      <UButton :to="localePath('/services')" color="neutral" variant="outline" size="lg">
        {{ $t('nav.services') }}
      </UButton>
      <UButton :to="localePath('/contact')" color="neutral" variant="outline" size="lg">
        {{ $t('common.contactUs') }}
      </UButton>
    </div>
  </UiPageContainer>
</template>
