<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
// The admin panel is an internal single-language tool: keep it out of the
// public i18n routing so no /en/admin duplicates are generated.
defineI18nRoute(false)
useHead({ title: 'Settings — Mobin Bartar Admin' })

interface SettingsResponse {
  site: {
    companyName: { fa: string, en: string }
    tagline: { fa: string, en: string }
    contact: {
      phones: string[]
      email: string
      address: { fa: string, en: string }
      postalCode?: string
    }
    workingHours: { days: { fa: string, en: string }, hours: { fa: string, en: string } }[]
    brand: { logo: string, favicon: string }
  } | null
  theme: Record<string, string> | null
}

const { data, pending, error, refresh } = await useFetch<SettingsResponse>('/api/admin/settings')

const fields = computed(() => {
  const site = data.value?.site
  if (!site) return []
  return [
    { label: 'Company name (EN)', value: site.companyName.en },
    { label: 'Company name (FA)', value: site.companyName.fa, rtl: true },
    { label: 'Tagline (EN)', value: site.tagline.en },
    { label: 'Tagline (FA)', value: site.tagline.fa, rtl: true },
    { label: 'Phone', value: site.contact.phones.join('، ') },
    { label: 'Email', value: site.contact.email },
    { label: 'Address (EN)', value: site.contact.address.en },
    { label: 'Address (FA)', value: site.contact.address.fa, rtl: true },
    { label: 'Postal code', value: site.contact.postalCode ?? '—' },
    { label: 'Working hours', value: site.workingHours[0]?.hours.en ?? '—' },
  ]
})

/** Theme swatches, in the order they appear in the token pipeline. */
const themeEntries = computed(() =>
  Object.entries(data.value?.theme ?? {}).filter(([, value]) => typeof value === 'string' && value.startsWith('#')),
)
</script>

<template>
  <div>
    <div v-if="error" role="alert" class="flex items-start gap-3 border border-[var(--color-danger)]/25 bg-[var(--color-danger)]/6 p-5">
      <UIcon name="i-lucide-triangle-alert" class="mt-0.5 size-5 shrink-0 text-[var(--color-danger)]" aria-hidden="true" />
      <div>
        <p class="font-semibold text-[var(--color-danger)]">Could not load settings</p>
        <UButton color="neutral" variant="outline" size="sm" class="mt-3" @click="() => refresh()">Try again</UButton>
      </div>
    </div>

    <div v-else-if="pending" class="space-y-4">
      <div class="h-64 animate-pulse rounded bg-[var(--color-surface-muted)]" />
    </div>

    <div v-else-if="!data?.site" class="flex flex-col items-center border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-14 text-center">
      <UIcon name="i-lucide-settings" class="size-8 text-[var(--color-muted)]" aria-hidden="true" />
      <p class="mt-3 font-medium">No settings row found</p>
      <p class="mt-1 max-w-sm text-sm text-[var(--color-muted)]">Run the database seed to create the site settings.</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <section class="border border-[var(--color-border)] bg-[var(--color-surface)] xl:col-span-2">
        <h2 class="border-b border-[var(--color-border)] px-5 py-3 font-bold">
          Company information
        </h2>
        <dl class="divide-y divide-[var(--color-border)]">
          <div v-for="field in fields" :key="field.label" class="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-3">
            <dt class="text-sm text-[var(--color-muted)]">{{ field.label }}</dt>
            <dd
              class="text-sm text-[var(--color-foreground)] sm:col-span-2"
              :dir="field.rtl ? 'rtl' : 'ltr'"
            >
              {{ field.value }}
            </dd>
          </div>
        </dl>
      </section>

      <section class="border border-[var(--color-border)] bg-[var(--color-surface)]">
        <h2 class="border-b border-[var(--color-border)] px-5 py-3 font-bold">
          Theme colours
        </h2>
        <ul class="divide-y divide-[var(--color-border)]">
          <li v-for="[name, value] in themeEntries" :key="name" class="flex items-center gap-3 px-5 py-3">
            <span
              class="size-6 shrink-0 border border-[var(--color-border)]"
              :style="{ backgroundColor: value }"
              aria-hidden="true"
            />
            <span class="text-sm capitalize">{{ name }}</span>
            <code class="ms-auto text-xs uppercase text-[var(--color-muted)]">{{ value }}</code>
          </li>
        </ul>
      </section>
    </div>

    <p class="mt-6 text-sm text-[var(--color-muted)]">
      Editing these values from the admin panel arrives in the next phase. They currently come from the database seed.
    </p>
  </div>
</template>
