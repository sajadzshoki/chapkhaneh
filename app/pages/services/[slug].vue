<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const { L } = useLocalizedContent()
const quoteStore = useQuoteStore()

const slug = computed(() => String(route.params.slug))

const { data: services } = await useServices()
const { data: pricingGroups } = await usePricing()
const { data: portfolio } = await usePortfolio()

const service = computed(() => services.value.find(s => s.slug === slug.value))

/**
 * An unknown slug renders an in-page "not found" state rather than throwing.
 * The user keeps the header, footer and a route back to the listing, which is
 * friendlier than a bare 404 — but we still send a 404 status for crawlers.
 */
if (import.meta.server && !service.value) {
  setResponseStatus(useRequestEvent()!, 404)
}

const pricing = computed(() =>
  pricingGroups.value.filter(group => group.serviceSlug === slug.value),
)

/** Other services in the same category, falling back to any other service. */
const related = computed(() => {
  const current = service.value
  if (!current) return []
  const sameCategory = services.value.filter(
    s => s.slug !== current.slug && s.category === current.category,
  )
  const others = services.value.filter(
    s => s.slug !== current.slug && s.category !== current.category,
  )
  return [...sameCategory, ...others].slice(0, 3)
})

/** Projects produced with this service. */
const relatedProjects = computed(() =>
  portfolio.value.items.filter(p => p.serviceSlugs?.includes(slug.value)).slice(0, 3),
)

async function requestQuote(): Promise<void> {
  if (!service.value) return
  quoteStore.preselectService(service.value.slug)
  await navigateTo(localePath('/quote'))
}

// Falls back to the not-found title so an unknown slug still gets a sensible
// tag rather than an empty or `undefined` one.
usePageSeo({
  title: () => (service.value ? L(service.value.title) : t('services.notFoundTitle')),
  description: () => (service.value ? L(service.value.summary) : t('services.notFoundDescription')),
  image: () => service.value?.image?.src,
  // An unknown slug must not be indexed as a real page.
  noindex: !service.value,
})

useServiceSchema({
  name: () => (service.value ? L(service.value.title) : undefined),
  description: () => (service.value ? L(service.value.summary) : undefined),
  image: () => service.value?.image?.src,
})

useBreadcrumbSchema(() => [
  { name: t('nav.home'), path: localePath('/') },
  { name: t('services.title'), path: localePath('/services') },
  ...(service.value ? [{ name: L(service.value.title) ?? '', path: localePath(`/services/${service.value.slug}`) }] : []),
])
</script>

<template>
  <UiNotFoundState
    v-if="!service"
    :title="$t('services.notFoundTitle')"
    :description="$t('services.notFoundDescription')"
    :back-label="$t('services.backToServices')"
    :back-to="localePath('/services')"
  />

  <div v-else>
    <UiPageHero
      :title="L(service.title) ?? ''"
      :description="L(service.summary)"
      :current-label="L(service.title)"
    />

    <!-- Hero image -->
    <UiPageContainer v-if="service.image" class="pt-10 lg:pt-12">
      <img
        :src="service.image.src"
        :alt="L(service.image.alt) ?? ''"
        :width="service.image.width ?? 1408"
        :height="service.image.height ?? 768"
        class="aspect-[21/9] w-full border border-[var(--color-border)] object-cover"
      >
    </UiPageContainer>

    <UiPageContainer class="py-12 lg:py-16">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
        <div class="lg:col-span-8">
          <h2 class="text-xl font-bold text-[var(--color-foreground)]">
            {{ $t('services.overview') }}
          </h2>
          <p class="mt-4 text-base leading-8 text-[var(--color-foreground-soft)] lg:text-lg">
            {{ L(service.description) }}
          </p>

          <!-- Key capabilities -->
          <h2 class="mt-12 text-xl font-bold text-[var(--color-foreground)]">
            {{ $t('services.features') }}
          </h2>
          <ul class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <li
              v-for="feature in L(service.features)"
              :key="feature"
              class="flex items-start gap-3 border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-foreground-soft)]"
            >
              <UIcon name="i-lucide-check" class="mt-1 size-4 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
              <span>{{ feature }}</span>
            </li>
          </ul>

          <!-- Available specifications -->
          <template v-if="service.specifications?.length">
            <h2 class="mt-12 text-xl font-bold text-[var(--color-foreground)]">
              {{ $t('services.specifications') }}
            </h2>
            <dl class="mt-5 divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div
                v-for="group in service.specifications"
                :key="L(group.label)"
                class="grid grid-cols-1 gap-2 p-5 sm:grid-cols-3 sm:gap-6"
              >
                <dt class="text-sm font-bold text-[var(--color-foreground)]">
                  {{ L(group.label) }}
                </dt>
                <dd class="sm:col-span-2">
                  <ul class="flex flex-wrap gap-2">
                    <li
                      v-for="value in L(group.values)"
                      :key="value"
                      class="border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-sm text-[var(--color-foreground-soft)]"
                    >
                      {{ value }}
                    </li>
                  </ul>
                </dd>
              </div>
            </dl>
          </template>

          <!-- Related pricing -->
          <h2 class="mt-12 text-xl font-bold text-[var(--color-foreground)]">
            {{ $t('services.relatedPricing') }}
          </h2>
          <template v-if="pricing.length">
            <div class="mt-5 space-y-6">
              <UiPricingTable v-for="group in pricing" :key="group.id" :group="group" />
            </div>
            <p class="mt-4 text-xs leading-6 text-[var(--color-muted)]">
              {{ $t('pricing.variationNote') }}
            </p>
          </template>
          <p
            v-else
            class="mt-5 border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] p-5 text-sm leading-7 text-[var(--color-muted)]"
          >
            {{ $t('services.noPricing') }}
          </p>
        </div>

        <!-- Sidebar -->
        <aside class="lg:col-span-4">
          <div class="sticky top-28 space-y-6">
            <div class="border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-6">
              <h2 class="text-sm font-bold text-[var(--color-foreground)]">
                {{ $t('services.atAGlance') }}
              </h2>
              <dl class="mt-4 space-y-4 text-sm">
                <div>
                  <dt class="text-[var(--color-muted)]">{{ $t('services.categories.all') }}</dt>
                  <dd class="mt-1 font-bold text-[var(--color-foreground)]">
                    {{ $t(`services.categories.${service.category}`) }}
                  </dd>
                </div>
                <div v-if="service.minimumOrder">
                  <dt class="text-[var(--color-muted)]">{{ $t('services.minimumOrder') }}</dt>
                  <dd class="mt-1 font-bold text-[var(--color-foreground)] tabular">{{ L(service.minimumOrder) }}</dd>
                </div>
                <div v-if="service.turnaround">
                  <dt class="text-[var(--color-muted)]">{{ $t('services.turnaround') }}</dt>
                  <dd class="mt-1 font-bold text-[var(--color-foreground)] tabular">{{ L(service.turnaround) }}</dd>
                </div>
              </dl>

              <UButton color="primary" size="lg" block class="mt-6" @click="requestQuote">
                {{ $t('common.getQuote') }}
              </UButton>
              <UButton
                :to="localePath('/pricing')"
                color="neutral"
                variant="outline"
                size="lg"
                block
                class="mt-3"
              >
                {{ $t('services.viewPricing') }}
              </UButton>
            </div>

            <!-- Related services -->
            <nav
              v-if="related.length"
              class="border border-[var(--color-border)] p-6"
              :aria-label="$t('services.relatedServices')"
            >
              <h2 class="text-sm font-bold text-[var(--color-foreground)]">
                {{ $t('services.relatedServices') }}
              </h2>
              <ul class="mt-4 space-y-3">
                <li v-for="item in related" :key="item.id">
                  <NuxtLink
                    :to="localePath(`/services/${item.slug}`)"
                    class="group flex items-start gap-3 text-sm text-[var(--color-foreground-soft)] transition-colors hover:text-[var(--color-primary)]"
                  >
                    <UIcon :name="item.icon" class="mt-0.5 size-4 shrink-0 text-[var(--color-muted)] group-hover:text-[var(--color-primary)]" aria-hidden="true" />
                    <span class="font-semibold">{{ L(item.title) }}</span>
                  </NuxtLink>
                </li>
              </ul>
            </nav>
          </div>
        </aside>
      </div>

      <!-- Related projects -->
      <section v-if="relatedProjects.length" class="mt-16 border-t border-[var(--color-border)] pt-12">
        <h2 class="text-xl font-bold text-[var(--color-foreground)]">
          {{ $t('services.relatedProjects') }}
        </h2>
        <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <UiPortfolioCard v-for="item in relatedProjects" :key="item.id" :item="item" />
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
