<script setup lang="ts">
import { equipment } from '~~/shared/data/equipment'
import type { EquipmentType } from '~~/shared/types'

const { t } = useI18n()
const localePath = useLocalePath()

const activeType = ref<EquipmentType | 'all'>('all')

const options = computed(() =>
  (['all', 'offset', 'digital', 'prepress', 'finishing'] as const).map(value => ({
    value,
    label: t(`equipment.types.${value}`),
  })),
)

const filtered = computed(() =>
  equipment
    .filter(e => activeType.value === 'all' || e.type === activeType.value)
    .sort((a, b) => a.order - b.order),
)

useHead({ title: () => t('equipment.title') })
useSeoMeta({ description: () => t('equipment.description') })
</script>

<template>
  <div>
    <UiPageHero :title="$t('equipment.title')" :description="$t('equipment.description')" />

    <UiPageContainer class="py-12 lg:py-16">
      <UiFilterTabs v-model="activeType" :options="options" />

      <div v-if="filtered.length" class="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UiEquipmentCard v-for="item in filtered" :key="item.id" :item="item" />
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
