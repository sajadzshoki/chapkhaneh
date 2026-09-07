<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
// The admin panel is an internal single-language tool: keep it out of the
// public i18n routing so no /en/admin duplicates are generated.
defineI18nRoute(false)
useHead({ title: 'Portfolio — Mobin Bartar Admin' })

interface Item {
  id: string, slug: string, title: { fa: string, en: string }
  categorySlug: string, year: number, featured: boolean
  gallery: unknown[]
}
interface Category { id: string, slug: string, title: { fa: string, en: string } }

const { data, pending, error, refresh } = await useFetch<{ items: Item[] }>('/api/admin/portfolio')
const { data: categories } = await useFetch<{ items: Category[] }>('/api/admin/portfolio-categories')

const columns = [
  { key: 'title', label: 'Project' },
  { key: 'categorySlug', label: 'Category' },
  { key: 'gallery', label: 'Images', numeric: true },
  { key: 'year', label: 'Year', numeric: true },
  { key: 'featured', label: 'Featured' },
]
</script>

<template>
  <div class="space-y-6">
    <AdminResourceList
      :columns="columns"
      :rows="data?.items"
      :pending="pending"
      :error="error"
      :count-label="data?.items.length ? `${data.items.length} projects` : undefined"
      empty-title="No portfolio items yet"
      empty-description="Run the database seed to load the demo content."
      @retry="refresh()"
    >
      <template #cell-title="{ row }">
        <span class="font-medium text-[var(--color-foreground)]">{{ row.title.en }}</span>
      </template>
      <template #cell-gallery="{ row }">{{ row.gallery.length }}</template>
      <template #cell-featured="{ row }">
        <span v-if="row.featured" class="text-[var(--color-success)]">Yes</span>
        <span v-else class="text-[var(--color-muted)]">No</span>
      </template>
    </AdminResourceList>

    <section v-if="categories?.items.length" class="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 class="text-sm font-bold">Categories</h2>
      <ul class="mt-3 flex flex-wrap gap-2">
        <li
          v-for="category in categories.items"
          :key="category.id"
          class="border border-[var(--color-border)] px-2.5 py-1 text-sm text-[var(--color-foreground-soft)]"
        >
          {{ category.title.en }}
        </li>
      </ul>
    </section>
  </div>
</template>
