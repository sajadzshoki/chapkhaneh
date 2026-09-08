<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

/**
 * The homepage shows the featured services first, topped up from the ordered
 * list so the grid always fills 6 cards even if the data changes.
 */
const { data: services } = await useServices()
const { data: equipment } = await useEquipment()
const { data: portfolio } = await usePortfolio()

const servicesList = computed(() => {
  const ordered = services.value.slice().sort((a, b) => a.order - b.order)
  const featured = ordered.filter(s => s.featured)
  const rest = ordered.filter(s => !s.featured)
  return [...featured, ...rest].slice(0, 6)
})

const equipmentList = computed(() =>
  equipment.value.slice().sort((a, b) => a.order - b.order).slice(0, 3),
)

const portfolioList = computed(() => {
  const items = portfolio.value.items
  const featured = items.filter(p => p.featured)
  return (featured.length ? featured : items).slice(0, 3)
})

usePageSeo({
  title: () => t('nav.home'),
  description: () => t('home.hero.description'),
})
</script>

<template>
  <div>
    <HomeHero />
    <HomeStatsSection />

    <!-- Services -->
    <section class="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <UiPageContainer class="py-16 lg:py-24">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <UiSectionHeader
            :eyebrow="$t('home.services.eyebrow')"
            :title="$t('home.services.title')"
            :description="$t('home.services.description')"
          />
          <UButton :to="localePath('/services')" variant="outline" color="neutral" size="lg">
            {{ $t('common.viewAll') }}
          </UButton>
        </div>

        <div class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <UiServiceCard
            v-for="(service, index) in servicesList"
            :key="service.id"
            :service="service"
            :variant="index < 3 ? 'feature' : 'default'"
          />
        </div>
      </UiPageContainer>
    </section>

    <HomeAboutSection />
    <HomeWhySection />

    <!-- Equipment -->
    <section class="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <UiPageContainer class="py-16 lg:py-24">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <UiSectionHeader
            :eyebrow="$t('home.equipment.eyebrow')"
            :title="$t('home.equipment.title')"
            :description="$t('home.equipment.description')"
          />
          <UButton :to="localePath('/equipment')" variant="outline" color="neutral" size="lg">
            {{ $t('common.viewAll') }}
          </UButton>
        </div>

        <div class="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <UiEquipmentCard
            v-for="item in equipmentList"
            :key="item.id"
            :item="item"
            variant="compact"
            :to="localePath('/equipment')"
          />
        </div>
      </UiPageContainer>
    </section>

    <HomeProcessSection />

    <!-- Portfolio -->
    <section class="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
      <UiPageContainer class="py-16 lg:py-24">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <UiSectionHeader
            :eyebrow="$t('home.portfolio.eyebrow')"
            :title="$t('home.portfolio.title')"
            :description="$t('home.portfolio.description')"
          />
          <UButton :to="localePath('/portfolio')" variant="outline" color="neutral" size="lg">
            {{ $t('common.viewAll') }}
          </UButton>
        </div>

        <div class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <UiPortfolioCard
            v-for="item in portfolioList"
            :key="item.id"
            :item="item"
          />
        </div>
      </UiPageContainer>
    </section>

    <UiCtaSection
      :title="$t('home.cta.title')"
      :description="$t('home.cta.description')"
      :primary-label="$t('home.cta.primary')"
      :primary-to="localePath('/quote')"
      :secondary-label="$t('home.cta.secondary')"
      :secondary-to="localePath('/contact')"
    />
  </div>
</template>
