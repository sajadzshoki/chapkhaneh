<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
defineI18nRoute(false)

const { t } = useI18n()
const pick = useAdminLocalized()
const { formatNumber, formatDate } = useAdminFormat()
useHead({ title: () => `${t('admin.dashboard.title')} — ${t('admin.brand')}` })

const STATUS_COLORS: Record<string, 'primary' | 'warning' | 'accent' | 'success'> = {
  NEW: 'primary',
  REVIEWING: 'warning',
  CONTACTED: 'accent',
  COMPLETED: 'success',
}

interface Dashboard {
  stats: {
    services: number
    activeServices: number
    portfolioItems: number
    equipment: number
    newQuoteRequests: number
    reviewingQuoteRequests: number
    totalQuoteRequests: number
  }
  recentQuoteRequests: {
    id: string
    fullName: string
    phone: string
    status: string
    createdAt: string
    serviceTitleFa: string | null
    serviceTitleEn: string | null
  }[]
}

const { data, pending, error, refresh } = await useAsyncData('admin-dashboard', () =>
  $fetch<Dashboard>('/api/admin/dashboard', {
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  }))

/** Plain counts only — a printing owner needs numbers, not decorative charts. */
const cards = computed(() => {
  const stats = data.value?.stats
  return [
    { key: 'services', icon: 'i-lucide-printer', value: stats?.services, to: '/admin/services' },
    { key: 'activeServices', icon: 'i-lucide-eye', value: stats?.activeServices, to: '/admin/services' },
    { key: 'portfolioItems', icon: 'i-lucide-gallery-vertical-end', value: stats?.portfolioItems, to: '/admin/portfolio' },
    { key: 'equipment', icon: 'i-lucide-factory', value: stats?.equipment, to: '/admin/equipment' },
    { key: 'newRequests', icon: 'i-lucide-inbox', value: stats?.newQuoteRequests, to: '/admin/quote-requests' },
    { key: 'reviewingRequests', icon: 'i-lucide-clock', value: stats?.reviewingQuoteRequests, to: '/admin/quote-requests' },
  ]
})

const recent = computed(() => data.value?.recentQuoteRequests ?? [])
</script>

<template>
  <div>
    <AdminPageHeader
      :title="t('admin.dashboard.title')"
      :description="t('admin.dashboard.description')"
    />

    <div v-if="error" role="alert" class="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <p class="font-semibold text-[var(--color-danger)]">
        {{ t('admin.states.errorTitle') }}
      </p>
      <p class="mt-1 text-sm text-[var(--color-foreground-soft)]">
        {{ t('admin.states.errorDescription') }}
      </p>
      <UButton color="neutral" variant="outline" size="sm" class="mt-3" @click="() => { refresh() }">
        {{ t('admin.actions.retry') }}
      </UButton>
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="card in cards"
          :key="card.key"
          :to="card.to"
          class="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-border-strong)]"
        >
          <div class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <UIcon :name="card.icon" class="size-4" aria-hidden="true" />
            {{ t(`admin.dashboard.${card.key}`) }}
          </div>
          <p v-if="pending" class="mt-3 h-8 w-16 animate-pulse rounded bg-[var(--color-surface-muted)]" />
          <p v-else class="tabular mt-2 text-2xl font-bold text-[var(--color-foreground)]">
            {{ formatNumber(card.value ?? 0) }}
          </p>
        </NuxtLink>
      </div>

      <!-- Recent requests -->
      <section class="mt-8 border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div class="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-3">
          <h3 class="font-bold">
            {{ t('admin.dashboard.recentRequests') }}
          </h3>
          <UButton
            to="/admin/quote-requests"
            color="neutral"
            variant="ghost"
            size="xs"
            trailing-icon="i-lucide-arrow-left"
            :ui="{ trailingIcon: 'flip-x' }"
          >
            {{ t('admin.dashboard.viewAll') }}
          </UButton>
        </div>

        <div v-if="pending" class="space-y-3 p-5" aria-busy="true">
          <div v-for="i in 4" :key="i" class="h-10 animate-pulse rounded bg-[var(--color-surface-muted)]" />
        </div>

        <p v-else-if="!recent.length" class="px-5 py-10 text-center text-sm text-[var(--color-muted)]">
          {{ t('admin.dashboard.recentEmpty') }}
        </p>

        <ul v-else class="divide-y divide-[var(--color-border)]">
          <li v-for="item in recent" :key="item.id">
            <NuxtLink
              :to="`/admin/quote-requests?search=${encodeURIComponent(item.phone)}`"
              class="flex flex-wrap items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              <div class="min-w-0">
                <p class="truncate font-medium text-[var(--color-foreground)]">
                  {{ item.fullName }}
                </p>
                <p class="truncate text-xs text-[var(--color-muted)]">
                  {{ item.serviceTitleFa
                    ? pick(item.serviceTitleFa, item.serviceTitleEn)
                    : t('admin.quotes.noService') }}
                </p>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs text-[var(--color-muted)]">{{ formatDate(item.createdAt) }}</span>
                <UBadge :color="STATUS_COLORS[item.status] ?? 'neutral'" variant="subtle" size="sm">
                  {{ t(`admin.quotes.statuses.${item.status}`) }}
                </UBadge>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
