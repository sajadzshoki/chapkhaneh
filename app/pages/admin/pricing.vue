<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
// The admin panel is an internal single-language tool: keep it out of the
// public i18n routing so no /en/admin duplicates are generated.
defineI18nRoute(false)
useHead({ title: 'Pricing — Mobin Bartar Admin' })

interface Group {
  serviceSlug: string
  title: { fa: string, en: string }
  rows: {
    id: string, quantity: number, price: number, currency: string
    specification: { fa: string, en: string }, unit: { fa: string, en: string }
  }[]
}

const { data, pending, error, refresh } = await useFetch<{ groups: Group[] }>('/api/admin/pricing')

const numberFormatter = new Intl.NumberFormat('en-US')
const format = (value: number) => numberFormatter.format(value)
</script>

<template>
  <div>
    <div v-if="error" role="alert" class="flex items-start gap-3 border border-[var(--color-danger)]/25 bg-[var(--color-danger)]/6 p-5">
      <UIcon name="i-lucide-triangle-alert" class="mt-0.5 size-5 shrink-0 text-[var(--color-danger)]" aria-hidden="true" />
      <div>
        <p class="font-semibold text-[var(--color-danger)]">Could not load pricing</p>
        <UButton color="neutral" variant="outline" size="sm" class="mt-3" @click="() => refresh()">Try again</UButton>
      </div>
    </div>

    <div v-else-if="pending" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-32 animate-pulse rounded bg-[var(--color-surface-muted)]" />
    </div>

    <div v-else-if="!data?.groups.length" class="flex flex-col items-center border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-14 text-center">
      <UIcon name="i-lucide-credit-card" class="size-8 text-[var(--color-muted)]" aria-hidden="true" />
      <p class="mt-3 font-medium">No pricing rows yet</p>
      <p class="mt-1 max-w-sm text-sm text-[var(--color-muted)]">Run the database seed to load the demo price list.</p>
    </div>

    <div v-else class="space-y-6">
      <section
        v-for="group in data.groups"
        :key="group.serviceSlug"
        class="border border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div class="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
          <h2 class="font-bold">{{ group.title.en }}</h2>
          <span class="text-sm text-[var(--color-muted)]">{{ group.rows.length }} rows</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th scope="col" class="px-5 py-3 text-start font-medium">Specification</th>
                <th scope="col" class="px-5 py-3 text-end font-medium">Quantity</th>
                <th scope="col" class="px-5 py-3 text-end font-medium">Unit price</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in group.rows" :key="row.id" class="border-b border-[var(--color-border)] last:border-0">
                <td class="px-5 py-3 text-[var(--color-foreground-soft)]">{{ row.specification.en }}</td>
                <td class="px-5 py-3 text-end tabular text-[var(--color-foreground-soft)]">
                  {{ format(row.quantity) }} {{ row.unit.en }}
                </td>
                <td class="px-5 py-3 text-end tabular font-medium">{{ format(row.price) }} {{ row.currency }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>
