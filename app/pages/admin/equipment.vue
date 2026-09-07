<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
// The admin panel is an internal single-language tool: keep it out of the
// public i18n routing so no /en/admin duplicates are generated.
defineI18nRoute(false)
useHead({ title: 'Equipment — Mobin Bartar Admin' })

interface Row {
  id: string, slug: string, model: string, manufacturer: string
  title: { fa: string, en: string }, typeLabel: { fa: string, en: string }
  installedYear?: number, order: number
}
const { data, pending, error, refresh } = await useFetch<{ items: Row[] }>('/api/admin/equipment')

const columns = [
  { key: 'title', label: 'Machine' },
  { key: 'manufacturer', label: 'Manufacturer' },
  { key: 'typeLabel', label: 'Type' },
  { key: 'installedYear', label: 'Installed', numeric: true },
]
</script>

<template>
  <AdminResourceList
    :columns="columns"
    :rows="data?.items"
    :pending="pending"
    :error="error"
    :count-label="data?.items.length ? `${data.items.length} machines` : undefined"
    empty-title="No equipment yet"
    empty-description="Run the database seed to load the demo content."
    @retry="refresh()"
  >
    <template #cell-title="{ row }">
      <span class="font-medium text-[var(--color-foreground)]">{{ row.title.en }}</span>
    </template>
    <template #cell-typeLabel="{ row }">{{ row.typeLabel.en }}</template>
  </AdminResourceList>
</template>
