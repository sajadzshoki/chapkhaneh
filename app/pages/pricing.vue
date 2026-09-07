<script setup lang="ts">
import { pricingGroups } from '~~/shared/data/pricing'

const { t } = useI18n()
const localePath = useLocalePath()

useHead({ title: () => t('pricing.title') })
useSeoMeta({ description: () => t('pricing.description') })
</script>

<template>
  <div>
    <UiPageHero :title="$t('pricing.title')" :description="$t('pricing.description')" />

    <UiPageContainer class="py-12 lg:py-16">
      <div class="space-y-10">
        <UiPricingTable v-for="group in pricingGroups" :key="group.id" :group="group" />
      </div>

      <p class="mt-8 border-s-2 border-[var(--color-accent)] bg-[var(--color-surface-muted)] p-5 text-sm leading-7 text-[var(--color-foreground-soft)]">
        {{ $t('pricing.disclaimer') }}
      </p>
    </UiPageContainer>

    <UiCtaSection
      :title="$t('pricing.cta')"
      :description="$t('home.cta.description')"
      :primary-label="$t('common.getQuote')"
      :primary-to="localePath('/quote')"
      :secondary-label="$t('common.contactUs')"
      :secondary-to="localePath('/contact')"
    />
  </div>
</template>
