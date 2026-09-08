<script setup lang="ts">
/**
 * Full-page "record not found" state for invalid dynamic routes.
 * Used instead of a hard 404 error page so the user keeps the site chrome and
 * a clear route back into the relevant listing.
 */
defineProps<{
  title: string
  description: string
  backLabel: string
  backTo: string
}>()

const localePath = useLocalePath()
</script>

<template>
  <UiPageContainer class="flex flex-col items-center justify-center py-24 text-center lg:py-32">
    <span
      class="inline-flex size-14 items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-muted)]"
      aria-hidden="true"
    >
      <UIcon name="i-lucide-file-question" class="size-6" />
    </span>

    <h1 class="mt-6 text-2xl font-extrabold tracking-tight text-[var(--color-foreground)] lg:text-3xl">
      {{ title }}
    </h1>
    <p class="mt-3 max-w-md text-[var(--color-muted)]">
      {{ description }}
    </p>

    <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
      <UButton :to="backTo" color="primary" size="lg">
        {{ backLabel }}
      </UButton>
      <UButton :to="localePath('/contact')" color="neutral" variant="outline" size="lg">
        {{ $t('common.contactUs') }}
      </UButton>
    </div>
  </UiPageContainer>
</template>
