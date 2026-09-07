<script setup lang="ts">
import { portfolioCategories, portfolioItems } from '~~/shared/data/portfolio'

const { t } = useI18n()
const { L } = useLocalizedContent()
const localePath = useLocalePath()

const activeCategory = ref('all')

const options = computed(() => [
  { value: 'all', label: t('portfolio.allCategories') },
  ...portfolioCategories
    .slice()
    .sort((a, b) => a.order - b.order)
    .map(c => ({ value: c.slug, label: L(c.title) ?? c.slug })),
])

const filtered = computed(() =>
  portfolioItems.filter(
    p => activeCategory.value === 'all' || p.categorySlug === activeCategory.value,
  ),
)

useHead({ title: () => t('portfolio.title') })
useSeoMeta({ description: () => t('portfolio.description') })
</script>

<template>
  <div>
    <UiPageHero :title="$t('portfolio.title')" :description="$t('portfolio.description')" />

    <UiPageContainer class="py-12 lg:py-16">
      <UiFilterTabs v-model="activeCategory" :options="options" />

      <div v-if="filtered.length" class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <UiPortfolioCard v-for="item in filtered" :key="item.id" :item="item" />
      </div>
      <UiEmptyState v-else class="mt-10" />
    </UiPageContainer>

    <UiCtaSection
      variant="muted"
      :title="$t('home.cta.title')"
      :description="$t('home.cta.description')"
      :primary-label="$t('home.cta.primary')"
      :primary-to="localePath('/quote')"
      :secondary-label="$t('common.contactUs')"
      :secondary-to="localePath('/contact')"
    />
  </div>
</template>
