<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
defineI18nRoute(false)

const { t } = useI18n()
const pick = useAdminLocalized()
const { formatNumber, formatPrice } = useAdminFormat()
useHead({ title: () => `${t('admin.pricing.title')} — ${t('admin.brand')}` })

interface ServiceOption {
  id: string
  titleFa: string
  titleEn: string
}

interface PricingRow {
  id: string
  serviceId: string
  titleFa: string
  titleEn: string
  quantity: number
  specificationFa: string
  specificationEn: string
  unitFa: string
  unitEn: string
  price: number
  currency: string
  turnaroundFa: string | null
  turnaroundEn: string | null
  noteFa: string | null
  noteEn: string | null
  sortOrder: number
  service: { id: string, slug: string, titleFa: string, titleEn: string }
}

/** The service picker doubles as the scope filter, so it is fetched once. */
const { data: servicesData } = await useAsyncData('admin-pricing-services', () =>
  $fetch<{ items: ServiceOption[] }>('/api/admin/services', {
    query: { perPage: 100 },
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  }))

const serviceOptions = computed(() =>
  (servicesData.value?.items ?? []).map(item => ({
    value: item.id,
    label: pick(item.titleFa, item.titleEn),
  })))

const serviceFilterOptions = computed(() => [
  { value: 'all', label: t('admin.pricing.allServices') },
  ...serviceOptions.value,
])

const { filters, query, reset } = useAdminFilters({ search: '', serviceId: 'all' })

// `all` is a UI-only sentinel; the API expects the parameter to be absent.
const apiQuery = computed(() => ({
  search: filters.search,
  ...(filters.serviceId !== 'all' ? { serviceId: filters.serviceId } : {}),
}))

const resource = useAdminResource<{ items: PricingRow[] }>({
  endpoint: 'pricing',
  key: 'admin-pricing',
  query: apiQuery,
})

const rows = computed(() => resource.data.value?.items ?? [])
const total = computed(() => rows.value.length)
const isFiltered = computed(() => Boolean(filters.search) || filters.serviceId !== 'all')

function blankForm() {
  return {
    serviceId: filters.serviceId !== 'all' ? filters.serviceId : (serviceOptions.value[0]?.value ?? ''),
    titleFa: '', titleEn: '',
    quantity: 1000,
    specificationFa: '', specificationEn: '',
    unitFa: '', unitEn: '',
    price: 0,
    currency: 'IRT',
    turnaroundFa: '', turnaroundEn: '',
    noteFa: '', noteEn: '',
    sortOrder: 0,
  }
}

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = reactive(blankForm())
const issues = ref<FieldIssues>({})
const formError = ref('')

function openCreate() {
  editingId.value = null
  Object.assign(form, blankForm(), { sortOrder: rows.value.length + 1 })
  issues.value = {}
  formError.value = ''
  modalOpen.value = true
}

function openEdit(row: PricingRow) {
  editingId.value = row.id
  Object.assign(form, {
    serviceId: row.serviceId,
    titleFa: row.titleFa, titleEn: row.titleEn,
    quantity: row.quantity,
    specificationFa: row.specificationFa, specificationEn: row.specificationEn,
    unitFa: row.unitFa, unitEn: row.unitEn,
    price: row.price,
    currency: row.currency,
    turnaroundFa: row.turnaroundFa ?? '', turnaroundEn: row.turnaroundEn ?? '',
    noteFa: row.noteFa ?? '', noteEn: row.noteEn ?? '',
    sortOrder: row.sortOrder,
  })
  issues.value = {}
  formError.value = ''
  modalOpen.value = true
}

function validate(): boolean {
  const next: FieldIssues = {}
  const required = [
    'titleFa', 'titleEn', 'specificationFa', 'specificationEn', 'unitFa', 'unitEn',
  ] as const

  for (const field of required) {
    if (!form[field].trim()) next[field] = [t('admin.validation.required')]
  }
  if (!form.serviceId) next.serviceId = [t('admin.validation.selectOption')]

  // Prices and quantities are numeric columns: reject anything that would not
  // survive the round trip rather than letting the database complain.
  if (!Number.isFinite(Number(form.quantity))) next.quantity = [t('admin.validation.number')]
  else if (Number(form.quantity) <= 0) next.quantity = [t('admin.validation.positive')]

  if (!Number.isFinite(Number(form.price))) next.price = [t('admin.validation.number')]
  else if (Number(form.price) < 0) next.price = [t('admin.validation.nonNegative')]

  issues.value = next
  return Object.keys(next).length === 0
}

async function onSubmit() {
  formError.value = ''
  if (!validate()) {
    formError.value = t('admin.states.validationFailed')
    return
  }

  const body = {
    ...form,
    quantity: Math.trunc(Number(form.quantity)),
    price: Math.trunc(Number(form.price)),
    turnaroundFa: form.turnaroundFa.trim() || null,
    turnaroundEn: form.turnaroundEn.trim() || null,
    noteFa: form.noteFa.trim() || null,
    noteEn: form.noteEn.trim() || null,
    sortOrder: Number(form.sortOrder) || 0,
  }

  const result = editingId.value
    ? await resource.update(editingId.value, body)
    : await resource.create(body)

  if (result.ok) {
    modalOpen.value = false
    return
  }
  issues.value = result.error.issues
  formError.value = result.error.message
}

const deleteTarget = ref<PricingRow | null>(null)

async function confirmDelete() {
  if (!deleteTarget.value) return
  const result = await resource.remove(deleteTarget.value.id)
  if (result.ok) deleteTarget.value = null
}

async function move(row: PricingRow, direction: -1 | 1) {
  // Reordering only makes sense within one service, so the ids sent are the
  // rows of that service in their current order.
  const scoped = rows.value.filter(item => item.serviceId === row.serviceId)
  const ids = reorderIds(scoped, row.id, direction)
  if (ids) await resource.reorder(ids)
}

const columns = computed(() => [
  { key: 'title', label: t('admin.fields.titleFa') },
  { key: 'service', label: t('admin.fields.service'), hideOnMobile: true },
  { key: 'quantity', label: t('admin.fields.quantity'), numeric: true },
  { key: 'price', label: t('admin.fields.price'), numeric: true },
  { key: 'order', label: t('admin.fields.sortOrder'), numeric: true, hideOnMobile: true },
  { key: 'actions', label: '', numeric: true },
])

const currencyOptions = [
  { value: 'IRT', label: 'Toman (IRT)' },
  { value: 'IRR', label: 'Rial (IRR)' },
]
</script>

<template>
  <div>
    <AdminPageHeader
      :title="t('admin.pricing.title')"
      :description="t('admin.pricing.description')"
      :action-label="t('admin.pricing.create')"
      :action-disabled="!serviceOptions.length"
      @action="openCreate"
    />

    <UAlert
      color="neutral"
      variant="subtle"
      icon="i-lucide-info"
      class="mb-4"
      :description="t('admin.pricing.disclaimer')"
    />

    <AdminFilterBar
      :search="filters.search"
      :search-placeholder="t('admin.actions.searchPlaceholder')"
      :clear-label="t('admin.actions.clearFilters')"
      :dirty="isFiltered"
      @update:search="(value: string) => { filters.search = value }"
      @clear="reset"
    >
      <USelect
        v-model="filters.serviceId"
        :items="serviceFilterOptions"
        value-key="value"
        class="w-64"
        :aria-label="t('admin.pricing.selectService')"
      />
    </AdminFilterBar>

    <AdminResourceList
      :columns="columns"
      :rows="rows"
      :pending="resource.pending.value"
      :error="resource.error.value"
      :filtered="isFiltered"
      :count-label="total ? t('admin.pricing.count', { count: total }) : undefined"
      :empty-title="t('admin.pricing.emptyTitle')"
      :empty-description="t('admin.pricing.emptyDescription')"
      @retry="() => { resource.refresh() }"
    >
      <template #empty-action>
        <UButton
          color="primary"
          icon="i-lucide-plus"
          :disabled="!serviceOptions.length"
          @click="openCreate"
        >
          {{ t('admin.pricing.create') }}
        </UButton>
      </template>

      <template #cell-title="{ row }">
        <div class="min-w-0">
          <p class="truncate font-medium text-[var(--color-foreground)]">
            {{ pick(row.titleFa, row.titleEn) }}
          </p>
          <p class="truncate text-xs text-[var(--color-muted)]">
            {{ pick(row.specificationFa, row.specificationEn) }}
          </p>
        </div>
      </template>

      <template #cell-service="{ row }">
        {{ pick(row.service.titleFa, row.service.titleEn) }}
      </template>

      <template #cell-quantity="{ row }">
        {{ formatNumber(row.quantity) }} {{ pick(row.unitFa, row.unitEn) }}
      </template>

      <template #cell-price="{ row }">
        <span class="font-medium text-[var(--color-foreground)]">
          {{ formatPrice(row.price, row.currency) }}
        </span>
      </template>

      <template #cell-order="{ row }">
        {{ formatNumber(row.sortOrder) }}
      </template>

      <template #cell-actions="{ row }">
        <AdminRowActions
          :edit-label="t('admin.actions.edit')"
          :delete-label="t('admin.actions.delete')"
          :up-label="t('admin.actions.moveUp')"
          :down-label="t('admin.actions.moveDown')"
          :busy="resource.saving.value"
          @edit="() => { openEdit(row as PricingRow) }"
          @remove="() => { deleteTarget = row as PricingRow }"
          @up="() => { move(row as PricingRow, -1) }"
          @down="() => { move(row as PricingRow, 1) }"
        />
      </template>
    </AdminResourceList>

    <AdminFormModal
      v-model:open="modalOpen"
      wide
      :title="editingId ? t('admin.pricing.editTitle') : t('admin.pricing.createTitle')"
      :submit-label="resource.saving.value ? t('admin.actions.saving') : t('admin.actions.save')"
      :cancel-label="t('admin.actions.cancel')"
      :saving="resource.saving.value"
      :error-message="formError"
      @submit="onSubmit"
    >
      <AdminFormSection :title="t('admin.pricing.title')">
        <AdminField
          :label="t('admin.fields.service')"
          :errors="issues.serviceId"
          required
          full
        >
          <USelect v-model="form.serviceId" :items="serviceOptions" value-key="value" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.titleFa')" :errors="issues.titleFa" required dir="rtl">
          <UInput v-model="form.titleFa" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.titleEn')" :errors="issues.titleEn" required dir="ltr">
          <UInput v-model="form.titleEn" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.specificationFa')"
          :errors="issues.specificationFa"
          required
          dir="rtl"
        >
          <UInput v-model="form.specificationFa" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.specificationEn')"
          :errors="issues.specificationEn"
          required
          dir="ltr"
        >
          <UInput v-model="form.specificationEn" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.quantity')" :errors="issues.quantity" required>
          <UInputNumber v-model="form.quantity" :min="1" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.price')"
          :hint="t('admin.pricing.priceHint')"
          :errors="issues.price"
          required
        >
          <UInputNumber v-model="form.price" :min="0" :step="1000" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.currency')" :errors="issues.currency" required>
          <USelect v-model="form.currency" :items="currencyOptions" value-key="value" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.unitFa')" :errors="issues.unitFa" required dir="rtl">
          <UInput v-model="form.unitFa" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.unitEn')" :errors="issues.unitEn" required dir="ltr">
          <UInput v-model="form.unitEn" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.turnaroundFa')" dir="rtl">
          <UInput v-model="form.turnaroundFa" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.turnaroundEn')" dir="ltr">
          <UInput v-model="form.turnaroundEn" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.noteFa')" dir="rtl">
          <UInput v-model="form.noteFa" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.noteEn')" dir="ltr">
          <UInput v-model="form.noteEn" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.sortOrder')" :hint="t('admin.fields.sortOrderHint')">
          <UInputNumber v-model="form.sortOrder" :min="0" class="w-full" />
        </AdminField>
      </AdminFormSection>
    </AdminFormModal>

    <AdminConfirmDialog
      :open="Boolean(deleteTarget)"
      :title="t('admin.delete.title')"
      :message="t('admin.delete.pricing', { name: deleteTarget ? pick(deleteTarget.titleFa, deleteTarget.titleEn) : '' })"
      :consequences="[t('admin.delete.irreversible')]"
      :confirm-label="t('admin.actions.confirmDelete')"
      :cancel-label="t('admin.actions.cancel')"
      :loading="resource.saving.value"
      @update:open="(value: boolean) => { if (!value) deleteTarget = null }"
      @confirm="confirmDelete"
    />
  </div>
</template>
