<script setup lang="ts">
interface DashboardResponse {
  stats: {
    services: number
    portfolioItems: number
    equipment: number
    newQuoteRequests: number
    totalQuoteRequests: number
  }
  recentQuoteRequests: {
    id: string
    fullName: string
    phone: string
    email?: string
    serviceTitle?: { fa: string, en: string }
    status: string
    createdAt: string
  }[]
}

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
// The admin panel is an internal single-language tool: keep it out of the
// public i18n routing so no /en/admin duplicates are generated.
defineI18nRoute(false)
useHead({ title: 'Dashboard — Mobin Bartar Admin' })

const { data, pending, error, refresh } = await useFetch<DashboardResponse>('/api/admin/dashboard')

const cards = computed(() => [
  { label: 'Services', value: data.value?.stats.services ?? 0, icon: 'i-lucide-printer', to: '/admin/services' },
  { label: 'Portfolio Items', value: data.value?.stats.portfolioItems ?? 0, icon: 'i-lucide-gallery-vertical-end', to: '/admin/portfolio' },
  { label: 'Equipment', value: data.value?.stats.equipment ?? 0, icon: 'i-lucide-factory', to: '/admin/equipment' },
  { label: 'New Quote Requests', value: data.value?.stats.newQuoteRequests ?? 0, icon: 'i-lucide-inbox', to: '/admin/quote-requests', highlight: true },
])

const STATUS_STYLES: Record<string, string> = {
  NEW: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
  REVIEWING: 'bg-[var(--color-warning)]/12 text-[var(--color-warning)]',
  CONTACTED: 'bg-[var(--color-accent)]/12 text-[var(--color-accent)]',
  COMPLETED: 'bg-[var(--color-success)]/12 text-[var(--color-success)]',
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const formatDate = (iso: string) => dateFormatter.format(new Date(iso))
</script>

<template>
  <div>
    <!-- Error state -->
    <div
      v-if="error"
      role="alert"
      class="flex items-start gap-3 border border-[var(--color-danger)]/25 bg-[var(--color-danger)]/6 p-5"
    >
      <UIcon name="i-lucide-triangle-alert" class="mt-0.5 size-5 shrink-0 text-[var(--color-danger)]" aria-hidden="true" />
      <div>
        <p class="font-semibold text-[var(--color-danger)]">
          Could not load dashboard data
        </p>
        <p class="mt-1 text-sm text-[var(--color-foreground-soft)]">
          The server did not return the dashboard statistics.
        </p>
        <UButton color="neutral" variant="outline" size="sm" class="mt-3" @click="() => refresh()">
          Try again
        </UButton>
      </div>
    </div>

    <template v-else>
      <!-- Summary cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <NuxtLink
          v-for="card in cards"
          :key="card.label"
          :to="card.to"
          class="group border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-primary)]"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm text-[var(--color-muted)]">{{ card.label }}</span>
            <UIcon
              :name="card.icon"
              class="size-4 text-[var(--color-muted)] group-hover:text-[var(--color-primary)]"
              aria-hidden="true"
            />
          </div>
          <p
            class="mt-3 text-3xl font-bold tabular"
            :class="card.highlight && card.value > 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-foreground)]'"
          >
            <span v-if="pending" class="inline-block h-8 w-10 animate-pulse rounded bg-[var(--color-surface-muted)]" />
            <span v-else>{{ card.value }}</span>
          </p>
        </NuxtLink>
      </div>

      <!-- Recent quote requests -->
      <section class="mt-8 border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div class="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 class="font-bold">
            Recent quote requests
          </h2>
          <NuxtLink
            to="/admin/quote-requests"
            class="text-sm text-[var(--color-primary)] hover:underline"
          >
            View all
          </NuxtLink>
        </div>

        <!-- Loading -->
        <div v-if="pending" class="space-y-3 p-5">
          <div v-for="i in 3" :key="i" class="h-10 animate-pulse rounded bg-[var(--color-surface-muted)]" />
        </div>

        <!-- Empty -->
        <div
          v-else-if="!data?.recentQuoteRequests.length"
          class="flex flex-col items-center px-5 py-14 text-center"
        >
          <UIcon name="i-lucide-inbox" class="size-8 text-[var(--color-muted)]" aria-hidden="true" />
          <p class="mt-3 font-medium">
            No quote requests yet
          </p>
          <p class="mt-1 max-w-sm text-sm text-[var(--color-muted)]">
            Requests submitted through the website quote form will appear here.
          </p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-[var(--color-border)] text-start text-[var(--color-muted)]">
                <th scope="col" class="px-5 py-3 text-start font-medium">Name</th>
                <th scope="col" class="px-5 py-3 text-start font-medium">Service</th>
                <th scope="col" class="px-5 py-3 text-start font-medium">Contact</th>
                <th scope="col" class="px-5 py-3 text-start font-medium">Status</th>
                <th scope="col" class="px-5 py-3 text-start font-medium">Received</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="request in data.recentQuoteRequests"
                :key="request.id"
                class="border-b border-[var(--color-border)] last:border-0"
              >
                <td class="px-5 py-3 font-medium">{{ request.fullName }}</td>
                <td class="px-5 py-3 text-[var(--color-foreground-soft)]">
                  {{ request.serviceTitle?.en ?? '—' }}
                </td>
                <td class="px-5 py-3 text-[var(--color-foreground-soft)] tabular">{{ request.phone }}</td>
                <td class="px-5 py-3">
                  <span
                    class="inline-block px-2 py-0.5 text-xs font-semibold"
                    :class="STATUS_STYLES[request.status] ?? 'bg-[var(--color-surface-muted)] text-[var(--color-muted)]'"
                  >
                    {{ request.status }}
                  </span>
                </td>
                <td class="px-5 py-3 text-[var(--color-muted)] tabular">{{ formatDate(request.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p class="mt-6 text-sm text-[var(--color-muted)]">
        Content editing arrives in the next phase. These screens are read-only for now.
      </p>
    </template>
  </div>
</template>
