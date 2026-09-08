<script setup lang="ts">
import type { FaqCategory } from '~~/shared/types'

const { t } = useI18n()
const { L } = useLocalizedContent()
const localePath = useLocalePath()
const { site } = useSite()

const { data: faqs } = await useFaqs()

const activeCategory = ref<FaqCategory | 'all'>('all')

const options = computed(() =>
  (['all', 'orders', 'technical', 'delivery', 'pricing'] as const).map(value => ({
    value,
    label: t(`faq.categories.${value}`),
  })),
)

const filtered = computed(() =>
  faqs.value
    .filter(f => activeCategory.value === 'all' || f.category === activeCategory.value)
    .sort((a, b) => a.order - b.order),
)

usePageSeo({
  title: () => t('faq.title'),
  description: () => t('faq.intro'),
})

// Built from the published questions themselves, so the markup can never
// describe content that is not on the page.
useFaqSchema(() => faqs.value.map(faq => ({
  question: L(faq.question) ?? '',
  answer: L(faq.answer) ?? '',
})))
</script>

<template>
  <div>
    <UiPageHero :title="$t('faq.title')" :description="$t('faq.intro')" />

    <UiPageContainer class="py-12 lg:py-16">
      <div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        <div class="lg:col-span-8">
          <UiFilterTabs v-model="activeCategory" :options="options" />

          <div v-if="filtered.length" class="mt-8 border border-[var(--color-border)] bg-[var(--color-surface)] px-6">
            <UiFaqItem
              v-for="faq in filtered"
              :key="faq.id"
              :question="L(faq.question) ?? ''"
              :answer="L(faq.answer) ?? ''"
            />
          </div>
          <UiEmptyState v-else class="mt-8">
            <UButton color="neutral" variant="outline" @click="() => { activeCategory = 'all' }">
              {{ $t('faq.categories.all') }}
            </UButton>
          </UiEmptyState>
        </div>

        <aside class="lg:col-span-4">
          <div class="sticky top-28 border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-6">
            <h2 class="text-lg font-bold text-[var(--color-foreground)]">
              {{ $t('faq.stillHaveQuestions.title') }}
            </h2>
            <p class="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              {{ $t('faq.stillHaveQuestions.description') }}
            </p>
            <a
              v-if="site.contact.phones[0]"
              :href="`tel:${site.contact.phones[0]}`"
              class="mt-5 flex items-center gap-2 font-bold text-[var(--color-primary)] tabular"
            >
              <UIcon name="i-lucide-phone" class="size-4" aria-hidden="true" />
              {{ site.contact.phones[0] }}
            </a>
            <UButton :to="localePath('/contact')" color="neutral" variant="outline" size="lg" block class="mt-5">
              {{ $t('common.contactUs') }}
            </UButton>
          </div>
        </aside>
      </div>
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
