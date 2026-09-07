<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
// The admin panel is an internal single-language tool: keep it out of the
// public i18n routing so no /en/admin duplicates are generated.
defineI18nRoute(false)
useHead({ title: 'Quote Requests — Mobin Bartar Admin' })

interface Row {
  id: string, fullName: string, phone: string, email?: string
  company?: string, quantity?: number, description: string
  serviceTitle?: { fa: string, en: string }, status: string, createdAt: string
}

const { data, pending, error, refresh } = await useFetch<{ items: Row[] }>('/api/admin/quote-requests')

const STATUS_STYLES: Record<string, string> = {
  NEW: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
  REVIEWING: 'bg-[var(--color-warning)]/12 text-[var(--color-warning)]',
  CONTACTED: 'bg-[var(--color-accent)]/12 text-[var(--color-accent)]',
  COMPLETED: 'bg-[var(--color-success)]/12 text-[var(--color-success)]',
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const columns = [
  { key: 'fullName', label: 'Name' },
  { key: 'serviceTitle', label: 'Service' },
  { key: 'phone', label: 'Phone' },
  { key: 'quantity', label: 'Qty', numeric: true },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Received' },
]
</script>

<template>
  <AdminResourceList
    :columns="columns"
    :rows="data?.items"
    :pending="pending"
    :error="error"
    :count-label="data?.items.length ? `${data.items.length} requests` : undefined"
    empty-title="No quote requests yet"
    empty-description="Requests submitted through the website quote form will appear here."
    @retry="refresh()"
  >
    <template #cell-fullName="{ row }">
      <span class="font-medium text-[var(--color-foreground)]">{{ row.fullName }}</span>
      <span v-if="row.company" class="block text-xs text-[var(--color-muted)]">{{ row.company }}</span>
    </template>
    <template #cell-serviceTitle="{ row }">{{ row.serviceTitle?.en ?? '—' }}</template>
    <template #cell-phone="{ row }"><span class="tabular">{{ row.phone }}</span></template>
    <template #cell-status="{ row }">
      <span class="inline-block px-2 py-0.5 text-xs font-semibold" :class="STATUS_STYLES[row.status] ?? ''">
        {{ row.status }}
      </span>
    </template>
    <template #cell-createdAt="{ row }">
      <span class="tabular text-[var(--color-muted)]">{{ dateFormatter.format(new Date(row.createdAt)) }}</span>
    </template>
  </AdminResourceList>
</template>
