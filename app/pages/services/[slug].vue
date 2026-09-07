<script setup lang="ts">
import { getServiceBySlug } from '~~/shared/data/services'
import { getPricingGroupsForService } from '~~/shared/data/pricing'

const route = useRoute()
const localePath = useLocalePath()
const { L } = useLocalizedContent()
const quoteStore = useQuoteStore()

const service = computed(() => getServiceBySlug(String(route.params.slug)))

if (!service.value) {
  throw createError({ statusCode: 404, statusMessage: 'Service not found', fatal: true })
}

const pricing = computed(() => getPricingGroupsForService(service.value!.slug))

async function requestQuote(): Promise<void> {
  quoteStore.preselectService(service.value!.slug)
  await navigateTo(localePath('/quote'))
}

useHead({ title: () => L(service.value!.title) ?? '' })
useSeoMeta({ description: () => L(service.value!.summary) ?? '' })
</script>

<template>
  <div v-if="service">
    <UiPageHero :title="L(service.title) ?? ''" :description="L(service.summary)" />

    <UiPageContainer class="py-12 lg:py-16">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
        <div class="lg:col-span-8">
          <p class="text-base leading-8 text-[var(--color-foreground-soft)] lg:text-lg">
            {{ L(service.description) }}
          </p>

          <h2 class="mt-10 text-xl font-bold text-[var(--color-foreground)]">
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

          <template v-if="pricing.length">
            <h2 class="mt-12 text-xl font-bold text-[var(--color-foreground)]">
              {{ $t('services.relatedPricing') }}
            </h2>
            <div class="mt-5 space-y-6">
              <UiPricingTable v-for="group in pricing" :key="group.id" :group="group" />
            </div>
            <p class="mt-4 text-xs leading-6 text-[var(--color-muted)]">
              {{ $t('pricing.disclaimer') }}
            </p>
          </template>
        </div>

        <aside class="lg:col-span-4">
          <div class="sticky top-28 border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-6">
            <dl class="space-y-4 text-sm">
              <div v-if="service.minimumOrder">
                <dt class="text-[var(--color-muted)]">{{ $t('services.minimumOrder') }}</dt>
                <dd class="mt-1 font-bold text-[var(--color-foreground)] tabular">{{ L(service.minimumOrder) }}</dd>
              </div>
              <div v-if="service.turnaround">
                <dt class="text-[var(--color-muted)]">{{ $t('services.turnaround') }}</dt>
                <dd class="mt-1 font-bold text-[var(--color-foreground)] tabular">{{ L(service.turnaround) }}</dd>
              </div>
            </dl>

            <UButton
              color="primary"
              size="lg"
              block
              class="mt-6"
              @click="requestQuote"
            >
              {{ $t('common.getQuote') }}
            </UButton>
            <UButton
              :to="localePath('/contact')"
              color="neutral"
              variant="outline"
              size="lg"
              block
              class="mt-3"
            >
              {{ $t('common.contactUs') }}
            </UButton>
          </div>
        </aside>
      </div>
    </UiPageContainer>
  </div>
</template>
