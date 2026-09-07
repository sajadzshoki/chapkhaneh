<script setup lang="ts">
/** Compact header band used at the top of every inner page. */
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <section class="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
    <UiPageContainer class="py-10 lg:py-14">
      <UiBreadcrumbs class="mb-6" />
      <h1 class="text-3xl font-extrabold tracking-tight text-[var(--color-foreground)] lg:text-4xl">
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="mt-4 max-w-3xl text-base leading-8 text-[var(--color-muted)] lg:text-lg"
      >
        {{ description }}
      </p>
      <slot />
    </UiPageContainer>
  </section>
</template>
