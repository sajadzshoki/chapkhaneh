<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * Read-only table shell shared by every admin content screen.
 *
 * Owns the loading / error / empty / loaded states in one place so the
 * individual pages only declare their columns. Phase 4 will add the row
 * actions; until then no buttons are rendered that do not work.
 */
interface Column {
  key: string
  label: string
  /** Right-aligned, tabular figures — for counts, prices, years. */
  numeric?: boolean
}

const props = defineProps<{
  columns: Column[]
  rows: T[] | undefined
  pending: boolean
  error: unknown
  emptyTitle: string
  emptyDescription: string
  /** Shown above the table, e.g. "10 services". */
  countLabel?: string
}>()

const emit = defineEmits<{ retry: [] }>()

const isEmpty = computed(() => !props.pending && !props.error && !props.rows?.length)
</script>

<template>
  <section class="border border-[var(--color-border)] bg-[var(--color-surface)]">
    <div
      v-if="countLabel && !error"
      class="border-b border-[var(--color-border)] px-5 py-3 text-sm text-[var(--color-muted)]"
    >
      {{ countLabel }}
    </div>

    <!-- Error -->
    <div v-if="error" role="alert" class="flex items-start gap-3 p-5">
      <UIcon name="i-lucide-triangle-alert" class="mt-0.5 size-5 shrink-0 text-[var(--color-danger)]" aria-hidden="true" />
      <div>
        <p class="font-semibold text-[var(--color-danger)]">
          Could not load this data
        </p>
        <p class="mt-1 text-sm text-[var(--color-foreground-soft)]">
          The request to the server failed.
        </p>
        <UButton color="neutral" variant="outline" size="sm" class="mt-3" @click="emit('retry')">
          Try again
        </UButton>
      </div>
    </div>

    <!-- Loading -->
    <div v-else-if="pending" class="space-y-3 p-5">
      <div v-for="i in 5" :key="i" class="h-9 animate-pulse rounded bg-[var(--color-surface-muted)]" />
    </div>

    <!-- Empty -->
    <div v-else-if="isEmpty" class="flex flex-col items-center px-5 py-14 text-center">
      <UIcon name="i-lucide-inbox" class="size-8 text-[var(--color-muted)]" aria-hidden="true" />
      <p class="mt-3 font-medium">{{ emptyTitle }}</p>
      <p class="mt-1 max-w-sm text-sm text-[var(--color-muted)]">{{ emptyDescription }}</p>
    </div>

    <!-- Data -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-[var(--color-border)] text-[var(--color-muted)]">
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              class="px-5 py-3 font-medium"
              :class="column.numeric ? 'text-end' : 'text-start'"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in rows"
            :key="row.id ?? index"
            class="border-b border-[var(--color-border)] last:border-0"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-5 py-3"
              :class="column.numeric ? 'text-end tabular text-[var(--color-foreground-soft)]' : 'text-[var(--color-foreground-soft)]'"
            >
              <slot :name="`cell-${column.key}`" :row="row">
                {{ row[column.key] ?? '—' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
