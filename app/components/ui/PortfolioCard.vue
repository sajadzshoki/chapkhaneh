<script setup lang="ts">
import type { PortfolioItemDto } from '~/composables/useContent'

defineProps<{ item: PortfolioItemDto }>()

const { L } = useLocalizedContent()
const localePath = useLocalePath()
// The parent page has already awaited this data; reading the shared handle
// here avoids a top-level await inside a child component (which would force
// the whole card into a Suspense boundary).
const { data: portfolio } = usePortfolio()

const categoryTitle = (slug: string) => {
  const category = portfolio.value?.categories.find(c => c.slug === slug)
  return category ? L(category.title) : undefined
}
</script>

<template>
  <article class="group relative flex h-full flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors duration-200 hover:border-[var(--color-primary)]">
    <div class="relative aspect-[4/3] overflow-hidden bg-[var(--color-surface-muted)]">
      <img
        :src="item.image.src"
        :alt="L(item.image.alt) ?? ''"
        loading="lazy"
        class="size-full object-cover"
        width="800"
        height="600"
      >
      <span
        v-if="categoryTitle(item.categorySlug)"
        class="absolute bottom-0 start-0 bg-[var(--color-secondary)] px-3 py-1.5 text-xs font-semibold text-white"
      >
        {{ categoryTitle(item.categorySlug) }}
      </span>
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
