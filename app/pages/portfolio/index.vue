<script setup lang="ts">
import { portfolioCategories, portfolioItems, countByCategory } from '~~/shared/data/portfolio'

const { t } = useI18n()
const { L } = useLocalizedContent()
const localePath = useLocalePath()

const activeCategory = ref('all')

const options = computed(() => [
  { value: 'all', label: `${t('portfolio.allCategories')} (${portfolioItems.length})` },
  ...portfolioCategories
    .slice()
    .sort((a, b) => a.order - b.order)
    .map(c => ({
      value: c.slug,
      label: `${L(c.title) ?? c.slug} (${countByCategory(c.slug)})`,
    })),
])

const filtered = computed(() =>
  portfolioItems.filter(
    p => activeCategory.value === 'all' || p.categorySlug === activeCategory.value,
  ),
)

/** Description of the currently selected category, shown under the filters. */
const activeDescription = computed(() => {
  if (activeCategory.value === 'all') return undefined
  const category = portfolioCategories.find(c => c.slug === activeCategory.value)
  return category?.description ? L(category.description) : undefined
})

useHead({ title: () => t('portfolio.title') })
useSeoMeta({
  title: () => t('portfolio.title'),
  description: () => t('portfolio.intro'),
  ogTitle: () => t('portfolio.title'),
  ogDescription: () => t('portfolio.intro'),
})
</script>

<template>
  <div>
    <UiPageHero :title="$t('portfolio.title')" :description="$t('portfolio.intro')" />

    <UiPageContainer class="py-12 lg:py-16">
      <UiFilterTabs v-model="activeCategory" :options="options" />

      <p v-if="activeDescription" class="mt-5 text-sm text-[var(--color-muted)]">
        {{ activeDescription }}
      </p>

      <div v-if="filtered.length" class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <UiPortfolioCard v-for="item in filtered" :key="item.id" :item="item" />
      </div>

      <UiEmptyState
        v-else
        class="mt-10"
        icon="i-lucide-image-off"
        :description="$t('portfolio.emptyCategory')"
      >
        <UButton color="neutral" variant="outline" @click="() => { activeCategory = 'all' }">
          {{ $t('portfolio.allCategories') }}
        </UButton>
      </UiEmptyState>
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
