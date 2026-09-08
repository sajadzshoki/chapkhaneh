<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * Table shell shared by every admin content screen.
 *
 * It owns the loading / error / empty / no-results states in one place so the
 * pages only declare their columns and cell slots. Keeping these four states
 * together is what makes every section behave identically.
 *
 * All copy is translated here rather than passed in per page, except the
 * entity-specific empty state, which only the page can word usefully.
 */
interface Column {
  key: string
  label: string
  /** Right-aligned with tabular figures — counts, prices, years. */
  numeric?: boolean
  /** Hidden below `lg`, so narrow screens keep the essential columns only. */
  hideOnMobile?: boolean
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
  /** True when filters are active: changes the empty copy to "no results". */
  filtered?: boolean
}>()

const emit = defineEmits<{ retry: [] }>()

const { t } = useI18n()

const isEmpty = computed(() => !props.pending && !props.error && !props.rows?.length)

const emptyCopy = computed(() =>
  props.filtered
    ? { title: t('admin.states.noResults'), description: t('admin.states.noResultsDescription') }
    : { title: props.emptyTitle, description: props.emptyDescription },
)
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
      <UIcon
        name="i-lucide-triangle-alert"
        class="mt-0.5 size-5 shrink-0 text-[var(--color-danger)]"
        aria-hidden="true"
      />
      <div>
        <p class="font-semibold text-[var(--color-danger)]">
          {{ t('admin.states.errorTitle') }}
        </p>
        <p class="mt-1 text-sm text-[var(--color-foreground-soft)]">
          {{ t('admin.states.errorDescription') }}
        </p>
        <UButton color="neutral" variant="outline" size="sm" class="mt-3" @click="emit('retry')">
          {{ t('admin.actions.retry') }}
        </UButton>
      </div>
    </div>

    <!-- Loading: fixed-height rows so the table does not jump when data lands -->
    <div v-else-if="pending && !rows?.length" class="space-y-3 p-5" aria-busy="true">
      <span class="sr-only">{{ t('admin.states.loading') }}</span>
      <div
        v-for="i in 5"
        :key="i"
        class="h-9 animate-pulse rounded bg-[var(--color-surface-muted)]"
      />
    </div>

    <!-- Empty / no results -->
    <div v-else-if="isEmpty" class="flex flex-col items-center px-5 py-14 text-center">
      <UIcon name="i-lucide-inbox" class="size-8 text-[var(--color-muted)]" aria-hidden="true" />
      <p class="mt-3 font-medium">
        {{ emptyCopy.title }}
      </p>
      <p class="mt-1 max-w-sm text-sm text-[var(--color-muted)]">
        {{ emptyCopy.description }}
      </p>
      <div class="mt-4">
        <slot name="empty-action" />
      </div>
    </div>

    <!-- Data -->
    <div v-else class="overflow-x-auto" :class="pending ? 'opacity-60 transition-opacity' : ''">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-[var(--color-border)] text-[var(--color-muted)]">
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              class="whitespace-nowrap px-4 py-3 font-medium"
              :class="[
                column.numeric ? 'text-end' : 'text-start',
                column.hideOnMobile ? 'hidden lg:table-cell' : '',
              ]"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in rows"
            :key="row.id ?? index"
            class="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-muted)]"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3"
              :class="[
                column.numeric
                  ? 'text-end tabular text-[var(--color-foreground-soft)]'
                  : 'text-[var(--color-foreground-soft)]',
                column.hideOnMobile ? 'hidden lg:table-cell' : '',
              ]"
            >
              <slot :name="`cell-${column.key}`" :row="row" :index="index">
                {{ row[column.key] ?? '—' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
