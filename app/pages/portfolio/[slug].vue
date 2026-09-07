<script setup lang="ts">
import type { ImageAsset } from '~~/shared/types'
import type { ServiceDto } from '~/composables/useContent'

const route = useRoute()
const { t } = useI18n()
const { L } = useLocalizedContent()
const localePath = useLocalePath()

const slug = computed(() => String(route.params.slug))

const { data: portfolio } = await usePortfolio()
const { data: services } = await useServices()

const item = computed(() => portfolio.value.items.find(p => p.slug === slug.value))

// Unknown slug renders an in-page state, but still reports 404 to crawlers.
if (import.meta.server && !item.value) {
  setResponseStatus(useRequestEvent()!, 404)
}

const category = computed(() =>
  portfolio.value.categories.find(c => c.slug === item.value?.categorySlug),
)

/** Cover image first, then any additional gallery frames. */
const images = computed<ImageAsset[]>(() =>
  item.value ? [item.value.image, ...(item.value.gallery ?? [])] : [],
)

const usedServices = computed<ServiceDto[]>(() => {
  const slugs = item.value?.serviceSlugs ?? []
  return slugs
    .map(s => services.value.find(service => service.slug === s))
    .filter((s): s is ServiceDto => Boolean(s))
})

/** Same category first, then any other project. */
const related = computed(() => {
  const current = item.value
  if (!current) return []
  const sameCategory = portfolio.value.items.filter(
    p => p.slug !== current.slug && p.categorySlug === current.categorySlug,
  )
  const others = portfolio.value.items.filter(
    p => p.slug !== current.slug && p.categorySlug !== current.categorySlug,
  )
  return [...sameCategory, ...others].slice(0, 3)
})

useHead({
  title: () => (item.value ? L(item.value.title) ?? '' : t('portfolio.notFoundTitle')),
})
useSeoMeta({
  description: () => (item.value ? L(item.value.description) ?? '' : ''),
  ogTitle: () => (item.value ? L(item.value.title) ?? '' : ''),
  ogDescription: () => (item.value ? L(item.value.description) ?? '' : ''),
  ogImage: () => item.value?.image.src,
})
</script>

<template>
  <UiNotFoundState
    v-if="!item"
    :title="$t('portfolio.notFoundTitle')"
    :description="$t('portfolio.notFoundDescription')"
    :back-label="$t('portfolio.backToPortfolio')"
    :back-to="localePath('/portfolio')"
  />

  <div v-else>
    <UiPageHero
      :title="L(item.title) ?? ''"
      :description="L(item.description)"
      :current-label="L(item.title)"
    >
      <p v-if="category" class="mt-5">
        <NuxtLink
          :to="localePath('/portfolio')"
          class="inline-flex items-center gap-2 border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-foreground-soft)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          <UIcon name="i-lucide-tag" class="size-3.5" aria-hidden="true" />
          {{ L(category.title) }}
        </NuxtLink>
      </p>
    </UiPageHero>

    <UiPageContainer class="py-12 lg:py-16">
      <div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        <div class="lg:col-span-8">
          <UiGallery :images="images" />

          <h2 class="mt-10 text-xl font-bold text-[var(--color-foreground)]">
            {{ $t('services.overview') }}
          </h2>
          <p class="mt-4 text-base leading-8 text-[var(--color-foreground-soft)]">
            {{ L(item.description) }}
          </p>

          <!-- Services used -->
          <template v-if="usedServices.length">
            <h2 class="mt-10 text-xl font-bold text-[var(--color-foreground)]">
              {{ $t('portfolio.servicesUsed') }}
            </h2>
            <ul class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <li v-for="service in usedServices" :key="service.id">
                <NuxtLink
                  :to="localePath(`/services/${service.slug}`)"
                  class="group flex h-full items-start gap-3 border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-primary)]"
                >
                  <UIcon
                    :name="service.icon"
                    class="mt-0.5 size-5 shrink-0 text-[var(--color-primary)]"
                    aria-hidden="true"
                  />
                  <span>
                    <span class="block text-sm font-bold text-[var(--color-foreground)]">
                      {{ L(service.title) }}
                    </span>
                    <span class="mt-1 block text-xs leading-6 text-[var(--color-muted)]">
                      {{ L(service.summary) }}
                    </span>
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </template>
        </div>

        <!-- Project facts -->
        <aside class="lg:col-span-4">
          <div class="sticky top-28 border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-6">
            <h2 class="text-lg font-bold text-[var(--color-foreground)]">
              {{ $t('portfolio.projectDetails') }}
            </h2>
            <dl class="mt-5 space-y-4 text-sm">
              <div>
                <dt class="text-[var(--color-muted)]">{{ $t('portfolio.client') }}</dt>
                <dd class="mt-1 font-bold text-[var(--color-foreground)]">{{ L(item.client) }}</dd>
              </div>
              <div v-if="category">
                <dt class="text-[var(--color-muted)]">{{ $t('portfolio.category') }}</dt>
                <dd class="mt-1 font-bold text-[var(--color-foreground)]">{{ L(category.title) }}</dd>
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
            <UButton
              :to="localePath('/portfolio')"
              color="neutral"
              variant="outline"
              size="lg"
              block
              class="mt-3"
            >
              {{ $t('portfolio.backToPortfolio') }}
            </UButton>
          </div>
        </aside>
      </div>

      <section v-if="related.length" class="mt-16 border-t border-[var(--color-border)] pt-12">
        <h2 class="text-xl font-bold text-[var(--color-foreground)]">
          {{ $t('portfolio.relatedProjects') }}
        </h2>
        <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <UiPortfolioCard v-for="entry in related" :key="entry.id" :item="entry" />
        </div>
      </section>
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
