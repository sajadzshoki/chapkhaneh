<script setup lang="ts">
import { pricingGroups } from '~~/shared/data/pricing'

const { t } = useI18n()
const { L } = useLocalizedContent()
const localePath = useLocalePath()

/** Anchor targets for the in-page "jump to" navigation. */
const groups = computed(() =>
  pricingGroups.map(group => ({ group, anchor: `pricing-${group.id}` })),
)

useHead({ title: () => t('pricing.title') })
useSeoMeta({
  title: () => t('pricing.title'),
  description: () => t('pricing.intro'),
  ogTitle: () => t('pricing.title'),
  ogDescription: () => t('pricing.intro'),
})
</script>

<template>
  <div>
    <UiPageHero :title="$t('pricing.title')" :description="$t('pricing.intro')" />

    <UiPageContainer class="py-12 lg:py-16">
      <!-- Jump-to navigation: pricing pages get long, this keeps them scannable -->
      <nav
        v-if="groups.length > 1"
        class="border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5"
        :aria-label="$t('pricing.jumpTo')"
      >
        <p class="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">
          {{ $t('pricing.jumpTo') }}
        </p>
        <ul class="flex flex-wrap gap-2">
          <li v-for="entry in groups" :key="entry.anchor">
            <a
              :href="`#${entry.anchor}`"
              class="inline-block border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-semibold text-[var(--color-foreground-soft)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              {{ L(entry.group.title) }}
            </a>
          </li>
        </ul>
      </nav>

      <div v-if="groups.length" class="mt-10 space-y-10">
        <UiPricingTable
          v-for="entry in groups"
          :key="entry.group.id"
          :group="entry.group"
          :anchor="entry.anchor"
        />
      </div>
      <UiEmptyState v-else class="mt-10" />

      <!-- Required commercial note -->
      <p class="mt-10 border-s-2 border-[var(--color-accent)] bg-[var(--color-surface-muted)] p-5 text-sm leading-7 text-[var(--color-foreground-soft)]">
        {{ $t('pricing.variationNote') }}
      </p>
      <p class="mt-3 text-xs leading-6 text-[var(--color-muted)]">
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
