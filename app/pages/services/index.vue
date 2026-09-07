<script setup lang="ts">
import { services } from '~~/shared/data/services'
import type { ServiceCategory } from '~~/shared/types'

const { t } = useI18n()
const localePath = useLocalePath()

const activeCategory = ref<ServiceCategory | 'all'>('all')

const options = computed(() =>
  (['all', 'printing', 'packaging', 'finishing'] as const).map(value => ({
    value,
    label: t(`services.categories.${value}`),
  })),
)

const filtered = computed(() =>
  services
    .filter(s => activeCategory.value === 'all' || s.category === activeCategory.value)
    .sort((a, b) => a.order - b.order),
)

useHead({ title: () => t('services.title') })
useSeoMeta({ description: () => t('services.description') })
</script>

<template>
  <div>
    <UiPageHero :title="$t('services.title')" :description="$t('services.description')" />

    <UiPageContainer class="py-12 lg:py-16">
      <UiFilterTabs v-model="activeCategory" :options="options" />

      <div v-if="filtered.length" class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <UiServiceCard v-for="service in filtered" :key="service.id" :service="service" />
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
