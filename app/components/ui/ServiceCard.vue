<script setup lang="ts">
import type { Service } from '~~/shared/types'

defineProps<{ service: Service }>()

const { L } = useLocalizedContent()
const localePath = useLocalePath()
</script>

<template>
  <article class="group relative flex h-full flex-col border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-colors duration-200 hover:border-[var(--color-primary)] lg:p-7">
    <span
      class="mb-5 inline-flex size-11 items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-primary)] transition-colors group-hover:border-[var(--color-primary)]"
      aria-hidden="true"
    >
      <UIcon :name="service.icon" class="size-5" />
    </span>

    <h3 class="text-lg font-bold text-[var(--color-foreground)]">
      <NuxtLink
        :to="localePath(`/services/${service.slug}`)"
        class="after:absolute after:inset-0 after:content-['']"
      >
        {{ L(service.title) }}
      </NuxtLink>
    </h3>

    <p class="mt-3 flex-1 text-sm leading-7 text-[var(--color-muted)]">
      {{ L(service.summary) }}
    </p>

    <div
      v-if="service.turnaround"
      class="mt-5 flex items-center gap-2 border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-muted)]"
    >
      <UIcon name="i-lucide-clock" class="size-4 shrink-0" aria-hidden="true" />
      <span>{{ $t('services.turnaround') }}: {{ L(service.turnaround) }}</span>
    </div>
  </article>
</template>
