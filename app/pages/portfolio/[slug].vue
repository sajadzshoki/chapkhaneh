<script setup lang="ts">
import { getPortfolioBySlug, portfolioItems } from '~~/shared/data/portfolio'

const route = useRoute()
const { L } = useLocalizedContent()
const localePath = useLocalePath()

const item = computed(() => getPortfolioBySlug(String(route.params.slug)))

if (!item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}

const related = computed(() =>
  portfolioItems
    .filter(p => p.categorySlug === item.value!.categorySlug && p.id !== item.value!.id)
    .slice(0, 3),
)

useHead({ title: () => L(item.value!.title) ?? '' })
useSeoMeta({ description: () => L(item.value!.description) ?? '' })
</script>

<template>
  <div v-if="item">
    <UiPageHero :title="L(item.title) ?? ''" :description="L(item.description)" />

    <UiPageContainer class="py-12 lg:py-16">
      <div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        <figure class="lg:col-span-8">
          <img
            :src="item.image.src"
            :alt="L(item.image.alt) ?? ''"
            width="800"
            height="600"
            class="w-full border border-[var(--color-border)] object-cover"
          >
        </figure>

        <aside class="lg:col-span-4">
          <div class="border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-6">
            <h2 class="text-lg font-bold text-[var(--color-foreground)]">
              {{ $t('portfolio.projectDetails') }}
            </h2>
            <dl class="mt-5 space-y-4 text-sm">
              <div>
                <dt class="text-[var(--color-muted)]">{{ $t('portfolio.client') }}</dt>
                <dd class="mt-1 font-bold text-[var(--color-foreground)]">{{ L(item.client) }}</dd>
              </div>
              <div>
                <dt class="text-[var(--color-muted)]">{{ $t('portfolio.year') }}</dt>
                <dd class="mt-1 font-bold text-[var(--color-foreground)] tabular">{{ item.year }}</dd>
              </div>
              <div v-for="detail in item.details" :key="L(detail.label)">
                <dt class="text-[var(--color-muted)]">{{ L(detail.label) }}</dt>
                <dd class="mt-1 font-bold text-[var(--color-foreground)] tabular">{{ L(detail.value) }}</dd>
              </div>
            </dl>

            <UButton :to="localePath('/quote')" color="primary" size="lg" block class="mt-6">
              {{ $t('common.getQuote') }}
            </UButton>
          </div>
        </aside>
      </div>

      <section v-if="related.length" class="mt-16">
        <h2 class="text-xl font-bold text-[var(--color-foreground)]">
          {{ $t('portfolio.relatedProjects') }}
        </h2>
        <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <UiPortfolioCard v-for="entry in related" :key="entry.id" :item="entry" />
        </div>
      </section>
    </UiPageContainer>
  </div>
</template>
