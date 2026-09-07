<script setup lang="ts">
import type { PortfolioItem } from '~~/shared/types'

defineProps<{ item: PortfolioItem }>()

const { L } = useLocalizedContent()
const localePath = useLocalePath()
</script>

<template>
  <article class="group relative flex h-full flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors duration-200 hover:border-[var(--color-primary)]">
    <div class="aspect-[4/3] overflow-hidden bg-[var(--color-surface-muted)]">
      <img
        :src="item.image.src"
        :alt="L(item.image.alt) ?? ''"
        loading="lazy"
        class="size-full object-cover"
        width="800"
        height="600"
      >
    </div>

    <div class="flex flex-1 flex-col p-6">
      <p class="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
        {{ L(item.client) }}
      </p>

      <h3 class="mt-2 text-lg font-bold text-[var(--color-foreground)]">
        <NuxtLink
          :to="localePath(`/portfolio/${item.slug}`)"
          class="after:absolute after:inset-0 after:content-['']"
        >
          {{ L(item.title) }}
        </NuxtLink>
      </h3>

      <p class="mt-3 flex-1 text-sm leading-7 text-[var(--color-muted)]">
        {{ L(item.description) }}
      </p>

      <p class="mt-5 border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-muted)] tabular">
        {{ $t('portfolio.year') }}: {{ item.year }}
      </p>
    </div>
  </article>
</template>
