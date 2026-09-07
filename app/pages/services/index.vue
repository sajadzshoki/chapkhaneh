<script setup lang="ts">
import type { ServiceCategory } from '~~/shared/types'

const { t } = useI18n()
const localePath = useLocalePath()

const { data: services } = await useServices()

const activeCategory = ref<ServiceCategory | 'all'>('all')

const options = computed(() =>
  (['all', 'printing', 'packaging', 'finishing'] as const).map(value => ({
    value,
    label: t(`services.categories.${value}`),
  })),
)

const ordered = computed(() => services.value.slice().sort((a, b) => a.order - b.order))

const filtered = computed(() =>
  ordered.value.filter(s => activeCategory.value === 'all' || s.category === activeCategory.value),
)

useHead({ title: () => t('services.title') })
useSeoMeta({
  title: () => t('services.title'),
  description: () => t('services.intro'),
  ogTitle: () => t('services.title'),
  ogDescription: () => t('services.intro'),
})
</script>

<template>
  <div>
    <UiPageHero :title="$t('services.title')" :description="$t('services.intro')" />

    <UiPageContainer class="py-12 lg:py-16">
      <UiFilterTabs v-model="activeCategory" :options="options" />

      <div v-if="filtered.length" class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <UiServiceCard
          v-for="(service, index) in filtered"
          :key="service.id"
          :service="service"
          :variant="index < 3 ? 'feature' : 'default'"
        />
      </div>

      <UiEmptyState v-else class="mt-10">
        <UButton color="neutral" variant="outline" @click="() => { activeCategory = 'all' }">
          {{ $t('services.categories.all') }}
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
