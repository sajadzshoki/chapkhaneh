<script setup lang="ts">
/**
 * Catch-all for unknown admin paths.
 *
 * Keeps a mistyped admin URL inside the admin shell — sidebar, locale switcher
 * and a route back to the dashboard — instead of dropping the operator onto
 * the public marketing 404. Auth still applies, so this never reveals that a
 * given admin route does or does not exist to a signed-out visitor.
 */
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
defineI18nRoute(false)

const { t } = useI18n()

useHead({ title: () => `${t('states.notFoundTitle')} — ${t('admin.brand')}` })

if (import.meta.server) {
  setResponseStatus(useRequestEvent()!, 404)
}
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
    <p class="text-6xl font-extrabold text-[var(--color-border-strong)] tabular">
      404
    </p>
    <h1 class="mt-5 text-xl font-extrabold tracking-tight text-[var(--color-foreground)]">
      {{ $t('states.notFoundTitle') }}
    </h1>
    <p class="mt-3 max-w-md text-sm text-[var(--color-muted)]">
      {{ $t('states.notFoundDescription') }}
    </p>
    <UButton to="/admin" color="primary" class="mt-8">
      {{ $t('admin.nav.dashboard') }}
    </UButton>
  </div>
</template>
