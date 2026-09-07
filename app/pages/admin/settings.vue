<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
defineI18nRoute(false)

/**
 * Site settings is a single record, so it is an always-open form rather than a
 * list with a modal. Everything here feeds the public header, footer and
 * contact page — no component hardcodes company details.
 */
const { t } = useI18n()
const toast = useToast()
const normalize = useAdminError()
useHead({ title: () => `${t('admin.settings.title')} — ${t('admin.brand')}` })

interface SiteSettings {
  companyNameFa: string
  companyNameEn: string
  legalNameFa: string | null
  legalNameEn: string | null
  taglineFa: string
  taglineEn: string
  descriptionFa: string | null
  descriptionEn: string | null
  foundedYear: number | null
  phone: string
  phoneSecondary: string | null
  fax: string | null
  email: string
  salesEmail: string | null
  addressFa: string
  addressEn: string
  cityFa: string | null
  cityEn: string | null
  postalCode: string | null
  mapUrl: string | null
  workingHoursFa: string
  workingHoursEn: string
  workingHoursDaysFa: string | null
  workingHoursDaysEn: string | null
  logo: string | null
  mark: string | null
  favicon: string | null
  ogImage: string | null
  instagramUrl: string | null
  linkedinUrl: string | null
  telegramUrl: string | null
  whatsappUrl: string | null
}

/** Fields that are stored nullable but edited as plain strings. */
const NULLABLE_TEXT = [
  'legalNameFa', 'legalNameEn', 'descriptionFa', 'descriptionEn',
  'phoneSecondary', 'fax', 'salesEmail', 'cityFa', 'cityEn', 'postalCode',
  'mapUrl', 'workingHoursDaysFa', 'workingHoursDaysEn',
  'logo', 'mark', 'favicon', 'ogImage',
  'instagramUrl', 'linkedinUrl', 'telegramUrl', 'whatsappUrl',
] as const

const { data, pending, error, refresh } = await useAsyncData('admin-settings', () =>
  $fetch<{ site: SiteSettings | null }>('/api/admin/settings', {
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  }))

const form = reactive<Record<string, string>>({})
/** The only numeric setting, kept out of the string map so the input stays typed. */
const foundedYear = ref<number | null>(null)
const issues = ref<FieldIssues>({})
const formError = ref('')
const saving = ref(false)

/** Loads the server record into the editable form, blanking nulls. */
function hydrate() {
  const site = data.value?.site
  if (!site) return

  for (const [key, value] of Object.entries(site)) {
    if (key === 'foundedYear') continue
    form[key] = value === null ? '' : String(value)
  }
  foundedYear.value = site.foundedYear
}

hydrate()
watch(data, hydrate)

function validate(): boolean {
  const next: FieldIssues = {}
  const required = [
    'companyNameFa', 'companyNameEn', 'taglineFa', 'taglineEn',
    'phone', 'email', 'addressFa', 'addressEn',
    'workingHoursFa', 'workingHoursEn',
  ]

  for (const field of required) {
    if (!String(form[field] ?? '').trim()) next[field] = [t('admin.validation.required')]
  }

  const email = String(form.email ?? '').trim()
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    next.email = [t('admin.validation.email')]
  }

  const salesEmail = String(form.salesEmail ?? '').trim()
  if (salesEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(salesEmail)) {
    next.salesEmail = [t('admin.validation.email')]
  }

  for (const field of ['mapUrl', 'instagramUrl', 'linkedinUrl', 'telegramUrl', 'whatsappUrl']) {
    const value = String(form[field] ?? '').trim()
    if (value && !/^https?:\/\//.test(value)) next[field] = [t('admin.validation.url')]
  }

  issues.value = next
  return Object.keys(next).length === 0
}

async function onSubmit() {
  if (saving.value) return
  formError.value = ''

  if (!validate()) {
    formError.value = t('admin.states.validationFailed')
    return
  }

  saving.value = true
  try {
    const body: Record<string, unknown> = { ...form }
    for (const field of NULLABLE_TEXT) {
      body[field] = String(form[field] ?? '').trim() || null
    }
    body.foundedYear = foundedYear.value ? Number(foundedYear.value) : null

    await $fetch('/api/admin/settings', { method: 'PUT', body })
    await refresh()
    // Refresh the shared site state so the public header and footer pick the
    // new values up without a full reload.
    await refreshNuxtData('site-settings')
    toast.add({ title: t('admin.toast.settingsSaved'), color: 'success', icon: 'i-lucide-check' })
  }
  catch (caught) {
    const normalized = normalize(caught)
    issues.value = normalized.issues
    formError.value = normalized.message
    toast.add({ title: normalized.message, color: 'danger', icon: 'i-lucide-triangle-alert' })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <AdminPageHeader
      :title="t('admin.settings.title')"
      :description="t('admin.settings.description')"
    />

    <div
      v-if="pending"
      class="space-y-3 border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
      aria-busy="true"
    >
      <div v-for="i in 8" :key="i" class="h-10 animate-pulse rounded bg-[var(--color-surface-muted)]" />
    </div>

    <div v-else-if="error" role="alert" class="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <p class="font-semibold text-[var(--color-danger)]">
        {{ t('admin.states.errorTitle') }}
      </p>
      <p class="mt-1 text-sm text-[var(--color-foreground-soft)]">
        {{ t('admin.states.errorDescription') }}
      </p>
      <UButton color="neutral" variant="outline" size="sm" class="mt-3" @click="() => { refresh() }">
        {{ t('admin.actions.retry') }}
      </UButton>
    </div>

    <form
      v-else
      class="space-y-8 border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
      @submit.prevent="onSubmit"
    >
      <UAlert
        v-if="formError"
        color="danger"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        :description="formError"
      />

      <AdminFormSection :title="t('admin.settings.sectionCompany')">
        <AdminField :label="t('admin.settings.companyNameFa')" :errors="issues.companyNameFa" required dir="rtl">
          <UInput v-model="form.companyNameFa" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.companyNameEn')" :errors="issues.companyNameEn" required dir="ltr">
          <UInput v-model="form.companyNameEn" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.legalNameFa')" dir="rtl">
          <UInput v-model="form.legalNameFa" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.legalNameEn')" dir="ltr">
          <UInput v-model="form.legalNameEn" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.taglineFa')" :errors="issues.taglineFa" required dir="rtl">
          <UInput v-model="form.taglineFa" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.taglineEn')" :errors="issues.taglineEn" required dir="ltr">
          <UInput v-model="form.taglineEn" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.descriptionFa')" dir="rtl">
          <UTextarea v-model="form.descriptionFa" :rows="3" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.descriptionEn')" dir="ltr">
          <UTextarea v-model="form.descriptionEn" :rows="3" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.foundedYear')" :errors="issues.foundedYear">
          <UInputNumber v-model="foundedYear" :min="1800" :max="2200" class="w-full" />
        </AdminField>
      </AdminFormSection>

      <AdminFormSection :title="t('admin.settings.sectionContact')">
        <AdminField :label="t('admin.settings.phone')" :errors="issues.phone" required dir="ltr">
          <UInput v-model="form.phone" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.phoneSecondary')" dir="ltr">
          <UInput v-model="form.phoneSecondary" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.fax')" dir="ltr">
          <UInput v-model="form.fax" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.email')" :errors="issues.email" required dir="ltr">
          <UInput v-model="form.email" type="email" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.salesEmail')" :errors="issues.salesEmail" dir="ltr">
          <UInput v-model="form.salesEmail" type="email" class="w-full" />
        </AdminField>
      </AdminFormSection>

      <AdminFormSection :title="t('admin.settings.sectionAddress')">
        <AdminField :label="t('admin.settings.addressFa')" :errors="issues.addressFa" required dir="rtl">
          <UTextarea v-model="form.addressFa" :rows="2" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.addressEn')" :errors="issues.addressEn" required dir="ltr">
          <UTextarea v-model="form.addressEn" :rows="2" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.cityFa')" dir="rtl">
          <UInput v-model="form.cityFa" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.cityEn')" dir="ltr">
          <UInput v-model="form.cityEn" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.postalCode')" dir="ltr">
          <UInput v-model="form.postalCode" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.mapUrl')" :errors="issues.mapUrl" dir="ltr">
          <UInput v-model="form.mapUrl" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.settings.workingHoursFa')"
          :errors="issues.workingHoursFa"
          required
          dir="rtl"
        >
          <UInput v-model="form.workingHoursFa" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.settings.workingHoursEn')"
          :errors="issues.workingHoursEn"
          required
          dir="ltr"
        >
          <UInput v-model="form.workingHoursEn" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.workingHoursDaysFa')" dir="rtl">
          <UInput v-model="form.workingHoursDaysFa" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.workingHoursDaysEn')" dir="ltr">
          <UInput v-model="form.workingHoursDaysEn" class="w-full" />
        </AdminField>
      </AdminFormSection>

      <AdminFormSection :title="t('admin.settings.sectionBrand')">
        <AdminField :label="t('admin.settings.logo')" :hint="t('admin.fields.imageHint')" dir="ltr">
          <div class="flex items-center gap-2">
            <UInput v-model="form.logo" class="flex-1" />
            <AdminThumb :src="form.logo" />
          </div>
        </AdminField>
        <AdminField :label="t('admin.settings.mark')" dir="ltr">
          <div class="flex items-center gap-2">
            <UInput v-model="form.mark" class="flex-1" />
            <AdminThumb :src="form.mark" />
          </div>
        </AdminField>
        <AdminField :label="t('admin.settings.favicon')" dir="ltr">
          <div class="flex items-center gap-2">
            <UInput v-model="form.favicon" class="flex-1" />
            <AdminThumb :src="form.favicon" />
          </div>
        </AdminField>
        <AdminField :label="t('admin.settings.ogImage')" dir="ltr">
          <div class="flex items-center gap-2">
            <UInput v-model="form.ogImage" class="flex-1" />
            <AdminThumb :src="form.ogImage" />
          </div>
        </AdminField>
      </AdminFormSection>

      <AdminFormSection :title="t('admin.settings.sectionSocial')">
        <AdminField :label="t('admin.settings.instagramUrl')" :errors="issues.instagramUrl" dir="ltr">
          <UInput v-model="form.instagramUrl" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.linkedinUrl')" :errors="issues.linkedinUrl" dir="ltr">
          <UInput v-model="form.linkedinUrl" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.telegramUrl')" :errors="issues.telegramUrl" dir="ltr">
          <UInput v-model="form.telegramUrl" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.settings.whatsappUrl')" :errors="issues.whatsappUrl" dir="ltr">
          <UInput v-model="form.whatsappUrl" class="w-full" />
        </AdminField>
      </AdminFormSection>

      <div class="flex justify-end border-t border-[var(--color-border)] pt-5">
        <UButton type="submit" color="primary" :loading="saving" :disabled="saving">
          {{ saving ? t('admin.actions.saving') : t('admin.actions.save') }}
        </UButton>
      </div>
    </form>
  </div>
</template>
