<script setup lang="ts">
import { featuredEquipment } from '~~/shared/data/equipment'

const { t } = useI18n()
const { stats, site, localized } = useSite()
const { L } = useLocalizedContent()
const localePath = useLocalePath()

const values = [
  { key: 'precision', icon: 'i-lucide-crosshair' },
  { key: 'reliability', icon: 'i-lucide-shield-check' },
  { key: 'transparency', icon: 'i-lucide-file-text' },
  { key: 'investment', icon: 'i-lucide-trending-up' },
] as const

const timeline = ['founded', 'expansion', 'packaging', 'today'] as const

/**
 * Standards we work to. These are working practices described in the mock
 * content — deliberately not presented as awards or audited certificates.
 */
const standards = [
  { id: 'iso-12647', label: 'ISO 12647-2', note: { fa: 'استاندارد کنترل رنگ چاپ افست', en: 'Offset colour control standard' } },
  { id: 'iso-9001', label: 'ISO 9001:2015', note: { fa: 'چارچوب سیستم مدیریت کیفیت', en: 'Quality management framework' } },
  { id: 'fsc', label: 'FSC Chain of Custody', note: { fa: 'زنجیرهٔ تأمین کاغذ پایدار', en: 'Responsible paper sourcing' } },
  { id: 'food-grade', label: 'Food-grade inks', note: { fa: 'مرکب مجاز برای بسته‌بندی مواد غذایی', en: 'Approved for food packaging' } },
]

const equipmentList = featuredEquipment(3)

useHead({ title: () => t('about.title') })
useSeoMeta({
  title: () => t('about.title'),
  description: () => t('about.intro'),
  ogTitle: () => t('about.title'),
  ogDescription: () => t('about.intro'),
})
</script>

<template>
  <div>
    <UiPageHero :title="$t('about.title')" :description="$t('about.intro')" />

    <!-- Story -->
    <UiPageContainer class="py-12 lg:py-16">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
        <div class="lg:col-span-7">
          <h2 class="text-2xl font-extrabold tracking-tight text-[var(--color-foreground)]">
            {{ $t('about.story.title') }}
          </h2>
          <p class="mt-5 text-base leading-8 text-[var(--color-foreground-soft)]">
            {{ $t('about.story.description') }}
          </p>
          <p class="mt-4 text-base leading-8 text-[var(--color-muted)]">
            {{ localized(site.description) }}
          </p>

          <h2 class="mt-12 text-2xl font-extrabold tracking-tight text-[var(--color-foreground)]">
            {{ $t('about.quality.title') }}
          </h2>
          <p class="mt-5 text-base leading-8 text-[var(--color-muted)]">
            {{ $t('about.quality.description') }}
          </p>

          <h2 class="mt-12 text-2xl font-extrabold tracking-tight text-[var(--color-foreground)]">
            {{ $t('about.facility.title') }}
          </h2>
          <p class="mt-5 text-base leading-8 text-[var(--color-muted)]">
            {{ $t('about.facility.description') }}
          </p>
        </div>

        <div class="lg:col-span-5">
          <img
            src="/photos/facility-exterior.jpg"
            :alt="$t('home.about.imageAlt')"
            width="1408"
            height="768"
            loading="lazy"
            class="w-full border border-[var(--color-border)] object-cover"
          >
          <div class="mt-6 border border-[var(--color-border)]">
            <img
              src="/photos/quality-control.jpg"
              :alt="$t('about.quality.title')"
              width="1024"
              height="683"
              loading="lazy"
              class="aspect-[3/2] w-full object-cover"
            >
          </div>
        </div>
      </div>
    </UiPageContainer>

    <!-- Capability figures -->
    <section class="border-y border-[var(--color-border)] bg-[var(--color-surface-muted)]">
      <UiPageContainer class="py-14 lg:py-16">
        <UiSectionHeader
          :title="$t('about.capabilities.title')"
          :description="$t('about.capabilities.description')"
        />
        <dl class="mt-10 grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-10">
          <UiStatBlock
            v-for="stat in stats"
            :key="stat.id"
            :value="stat.value"
            :suffix="stat.suffix"
            :label="L(stat.label) ?? ''"
          />
        </dl>
      </UiPageContainer>
    </section>

    <!-- Timeline -->
    <UiPageContainer class="py-16 lg:py-20">
      <UiSectionHeader :title="$t('about.timeline.title')" />
      <ol class="mt-10 grid grid-cols-1 gap-px bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="step in timeline" :key="step" class="bg-[var(--color-surface)] p-6">
          <p class="text-sm font-extrabold text-[var(--color-accent)] tabular">
            {{ $t(`about.timeline.items.${step}.year`) }}
          </p>
          <h3 class="mt-3 font-bold text-[var(--color-foreground)]">
            {{ $t(`about.timeline.items.${step}.title`) }}
          </h3>
          <p class="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            {{ $t(`about.timeline.items.${step}.description`) }}
          </p>
        </li>
      </ol>
    </UiPageContainer>

    <!-- Values -->
    <section class="border-y border-[var(--color-border)] bg-[var(--color-surface-muted)]">
      <UiPageContainer class="py-16 lg:py-20">
        <UiSectionHeader :title="$t('about.values.title')" />
        <ul class="mt-10 grid grid-cols-1 gap-px bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4">
          <li v-for="value in values" :key="value.key" class="bg-[var(--color-surface)] p-7">
            <UIcon :name="value.icon" class="size-6 text-[var(--color-primary)]" aria-hidden="true" />
            <h3 class="mt-4 font-bold text-[var(--color-foreground)]">
              {{ $t(`about.values.items.${value.key}.title`) }}
            </h3>
            <p class="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              {{ $t(`about.values.items.${value.key}.description`) }}
            </p>
          </li>
        </ul>
      </UiPageContainer>
    </section>

    <!-- Equipment preview -->
    <UiPageContainer class="py-16 lg:py-20">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <UiSectionHeader
          :title="$t('about.equipmentSection.title')"
          :description="$t('about.equipmentSection.description')"
        />
        <UButton :to="localePath('/equipment')" variant="outline" color="neutral" size="lg">
          {{ $t('about.equipmentSection.cta') }}
        </UButton>
      </div>
      <div class="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <UiEquipmentCard
          v-for="machine in equipmentList"
          :key="machine.id"
          :item="machine"
          variant="compact"
          :to="localePath('/equipment')"
        />
      </div>
    </UiPageContainer>

    <!-- Standards -->
    <section class="border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]">
      <UiPageContainer class="py-16 lg:py-20">
        <UiSectionHeader
          :title="$t('about.certifications.title')"
          :description="$t('about.certifications.description')"
        />
        <ul class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <li
            v-for="standard in standards"
            :key="standard.id"
            class="border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
          >
            <p class="font-bold text-[var(--color-foreground)]">{{ standard.label }}</p>
            <p class="mt-2 text-sm leading-7 text-[var(--color-muted)]">{{ L(standard.note) }}</p>
          </li>
        </ul>
      </UiPageContainer>
    </section>

    <UiCtaSection
      :title="$t('home.cta.title')"
      :description="$t('home.cta.description')"
      :primary-label="$t('home.cta.primary')"
      :primary-to="localePath('/quote')"
      :secondary-label="$t('common.contactUs')"
      :secondary-to="localePath('/contact')"
    />
  </div>
</template>
