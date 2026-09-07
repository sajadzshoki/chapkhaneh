<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
// The admin panel is an internal single-language tool: keep it out of the
// public i18n routing so no /en/admin duplicates are generated.
defineI18nRoute(false)
useHead({ title: 'Services — Mobin Bartar Admin' })

interface Row { id: string, slug: string, title: { fa: string, en: string }, order: number }
const { data, pending, error, refresh } = await useFetch<{ items: Row[] }>('/api/admin/services')

const columns = [
  { key: 'title', label: 'Title (EN)' },
  { key: 'titleFa', label: 'Title (FA)' },
  { key: 'slug', label: 'Slug' },
  { key: 'order', label: 'Order', numeric: true },
]
</script>

<template>
  <AdminResourceList
    :columns="columns"
    :rows="data?.items"
    :pending="pending"
    :error="error"
    :count-label="data?.items.length ? `${data.items.length} services` : undefined"
    empty-title="No services yet"
    empty-description="Run the database seed to load the demo content."
    @retry="refresh()"
  >
    <template #cell-title="{ row }">
      <span class="font-medium text-[var(--color-foreground)]">{{ row.title.en }}</span>
    </template>
    <template #cell-titleFa="{ row }">
      <span dir="rtl">{{ row.title.fa }}</span>
    </template>
    <template #cell-slug="{ row }">
      <code class="text-xs text-[var(--color-muted)]">{{ row.slug }}</code>
    </template>
  </AdminResourceList>
</template>
