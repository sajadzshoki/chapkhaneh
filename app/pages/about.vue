<script setup lang="ts">
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

const certifications = [
  { id: 'iso-12647', label: 'ISO 12647-2', note: { fa: 'استاندارد کنترل رنگ چاپ افست', en: 'Offset colour control standard' } },
  { id: 'iso-9001', label: 'ISO 9001:2015', note: { fa: 'سیستم مدیریت کیفیت', en: 'Quality management system' } },
  { id: 'fsc', label: 'FSC Chain of Custody', note: { fa: 'زنجیرهٔ تأمین کاغذ پایدار', en: 'Responsible paper sourcing' } },
  { id: 'food-grade', label: 'Food-grade inks', note: { fa: 'مرکب مجاز برای بسته‌بندی مواد غذایی', en: 'Approved for food packaging' } },
]

useHead({ title: () => t('about.title') })
useSeoMeta({ description: () => t('about.description') })
</script>

<template>
  <div>
    <UiPageHero :title="$t('about.title')" :description="$t('about.description')" />

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
            {{ $t('about.facility.title') }}
          </h2>
          <p class="mt-5 text-base leading-8 text-[var(--color-muted)]">
            {{ $t('about.facility.description') }}
          </p>
        </div>

        <div class="lg:col-span-5">
          <img
            src="/photos/press-hall.jpg"
            :alt="$t('home.hero.imageAlt')"
            width="1408"
            height="768"
            loading="lazy"
            class="w-full border border-[var(--color-border)] object-cover"
          >
          <dl class="mt-8 grid grid-cols-2 gap-8">
            <UiStatBlock
              v-for="stat in stats"
              :key="stat.id"
              :value="stat.value"
              :suffix="stat.suffix"
              :label="L(stat.label) ?? ''"
            />
          </dl>
        </div>
      </div>
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

    <!-- Certifications -->
    <UiPageContainer class="py-16 lg:py-20">
      <UiSectionHeader
        :title="$t('about.certifications.title')"
        :description="$t('about.certifications.description')"
      />
      <ul class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="cert in certifications"
          :key="cert.id"
          class="border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        >
          <p class="font-bold text-[var(--color-foreground)]">{{ cert.label }}</p>
          <p class="mt-2 text-sm text-[var(--color-muted)]">{{ L(cert.note) }}</p>
        </li>
      </ul>
    </UiPageContainer>

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
