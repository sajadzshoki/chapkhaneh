<script setup lang="ts">
import { featuredServices } from '~~/shared/data/services'
import { equipment } from '~~/shared/data/equipment'
import { featuredPortfolio } from '~~/shared/data/portfolio'

const { t } = useI18n()
const localePath = useLocalePath()

const servicesList = featuredServices()
const equipmentList = equipment.slice(0, 3)
const portfolioList = featuredPortfolio().slice(0, 3)

useHead({ title: () => t('nav.home') })
useSeoMeta({ description: () => t('home.hero.description') })
</script>

<template>
  <div>
    <HomeHero />

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
            v-for="service in servicesList"
            :key="service.id"
            :service="service"
          />
        </div>
      </UiPageContainer>
    </section>

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
