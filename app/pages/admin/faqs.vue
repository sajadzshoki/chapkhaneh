<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
// The admin panel is an internal single-language tool: keep it out of the
// public i18n routing so no /en/admin duplicates are generated.
defineI18nRoute(false)
useHead({ title: 'FAQs — Mobin Bartar Admin' })

interface Row { id: string, category: string, question: { fa: string, en: string }, order: number }
const { data, pending, error, refresh } = await useFetch<{ items: Row[] }>('/api/admin/faqs')

const columns = [
  { key: 'question', label: 'Question (EN)' },
  { key: 'category', label: 'Category' },
  { key: 'order', label: 'Order', numeric: true },
]
</script>

<template>
  <AdminResourceList
    :columns="columns"
    :rows="data?.items"
    :pending="pending"
    :error="error"
    :count-label="data?.items.length ? `${data.items.length} questions` : undefined"
    empty-title="No FAQs yet"
    empty-description="Run the database seed to load the demo content."
    @retry="refresh()"
  >
    <template #cell-question="{ row }">
      <span class="font-medium text-[var(--color-foreground)]">{{ row.question.en }}</span>
    </template>
  </AdminResourceList>
</template>
