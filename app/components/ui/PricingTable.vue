<script setup lang="ts">
import type { PricingGroup } from '~~/shared/types'
import { formatNumber } from '~/utils/format'

defineProps<{ group: PricingGroup }>()

const { L, locale } = useLocalizedContent()
</script>

<template>
  <section class="border border-[var(--color-border)] bg-[var(--color-surface)]">
    <header class="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-6 py-5">
      <h3 class="text-lg font-bold text-[var(--color-foreground)]">
        {{ L(group.title) }}
      </h3>
      <p v-if="group.description" class="mt-1 text-sm text-[var(--color-muted)]">
        {{ L(group.description) }}
      </p>
    </header>

    <!-- Horizontal scroll keeps the table usable on narrow screens -->
    <div class="overflow-x-auto">
      <table class="w-full min-w-[720px] border-collapse text-sm">
        <caption class="sr-only">{{ L(group.title) }}</caption>
        <thead>
          <tr class="border-b border-[var(--color-border)] text-start">
            <th scope="col" class="px-6 py-3 text-start font-semibold text-[var(--color-foreground-soft)]">
              {{ $t('pricing.table.item') }}
            </th>
            <th scope="col" class="px-6 py-3 text-start font-semibold text-[var(--color-foreground-soft)]">
              {{ $t('pricing.table.quantity') }}
            </th>
            <th scope="col" class="px-6 py-3 text-start font-semibold text-[var(--color-foreground-soft)]">
              {{ $t('pricing.table.specification') }}
            </th>
            <th scope="col" class="px-6 py-3 text-start font-semibold text-[var(--color-foreground-soft)]">
              {{ $t('pricing.table.turnaround') }}
            </th>
            <th scope="col" class="px-6 py-3 text-end font-semibold text-[var(--color-foreground-soft)]">
              {{ $t('pricing.table.price') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in group.rows"
            :key="row.id"
            class="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-muted)]"
          >
            <th scope="row" class="px-6 py-4 text-start font-semibold text-[var(--color-foreground)]">
              {{ L(row.title) }}
              <span v-if="row.note" class="mt-1 block text-xs font-normal text-[var(--color-muted)]">
                {{ L(row.note) }}
              </span>
            </th>
            <td class="px-6 py-4 text-[var(--color-foreground-soft)] tabular">
              {{ L(row.quantity) }}
            </td>
            <td class="px-6 py-4 text-[var(--color-muted)]">
              {{ L(row.specification) }}
            </td>
            <td class="px-6 py-4 text-[var(--color-muted)] tabular">
              {{ row.turnaround ? L(row.turnaround) : '—' }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-end font-bold text-[var(--color-foreground)] tabular">
              {{ formatNumber(row.price, locale) }}
              <span class="text-xs font-normal text-[var(--color-muted)]">{{ $t('common.toman') }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
