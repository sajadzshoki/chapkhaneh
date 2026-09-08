<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
// Admin routes stay out of the public i18n routing so no /en/admin twins are
// generated; the panel switches language in place instead.
defineI18nRoute(false)

const { t } = useI18n()
const pick = useAdminLocalized()
const { formatNumber } = useAdminFormat()
useHead({ title: () => `${t('admin.services.title')} — ${t('admin.brand')}` })

interface ServiceRow {
  id: string
  slug: string
  titleFa: string
  titleEn: string
  image: string | null
  isActive: boolean
  sortOrder: number
  pricingCount: number
}

interface ServiceChild { valueFa: string, valueEn: string }
interface ServiceSpec { labelFa: string, labelEn: string, valuesFa: string, valuesEn: string }

interface ServiceDetail extends ServiceRow {
  shortDescriptionFa: string
  shortDescriptionEn: string
  descriptionFa: string
  descriptionEn: string
  minimumOrderFa: string | null
  minimumOrderEn: string | null
  turnaroundFa: string | null
  turnaroundEn: string | null
  features: ServiceChild[]
  specifications: ServiceSpec[]
}

const { filters, query, reset } = useAdminFilters({ search: '', active: 'all', perPage: 20 })

const resource = useAdminResource<{ items: ServiceRow[], total: number }>({
  endpoint: 'services',
  key: 'admin-services',
  query,
})

const rows = computed(() => resource.data.value?.items ?? [])
const total = computed(() => resource.data.value?.total ?? 0)
const isFiltered = computed(() => Boolean(filters.search) || filters.active !== 'all')

/* ------------------------------- Form state ------------------------------ */

function blankForm() {
  return {
    slug: '',
    titleFa: '', titleEn: '',
    shortDescriptionFa: '', shortDescriptionEn: '',
    descriptionFa: '', descriptionEn: '',
    image: '',
    minimumOrderFa: '', minimumOrderEn: '',
    turnaroundFa: '', turnaroundEn: '',
    isActive: true,
    sortOrder: 0,
    features: [] as ServiceChild[],
    specifications: [] as ServiceSpec[],
  }
}

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = reactive(blankForm())
const issues = ref<FieldIssues>({})
const formError = ref('')
const loadingDetail = ref(false)

function openCreate() {
  editingId.value = null
  Object.assign(form, blankForm(), { sortOrder: rows.value.length + 1 })
  issues.value = {}
  formError.value = ''
  modalOpen.value = true
}

async function openEdit(id: string) {
  editingId.value = id
  issues.value = {}
  formError.value = ''
  loadingDetail.value = true
  modalOpen.value = true

  try {
    const detail = await $fetch<ServiceDetail>(`/api/admin/services/${id}`)
    Object.assign(form, {
      slug: detail.slug,
      titleFa: detail.titleFa, titleEn: detail.titleEn,
      shortDescriptionFa: detail.shortDescriptionFa,
      shortDescriptionEn: detail.shortDescriptionEn,
      descriptionFa: detail.descriptionFa, descriptionEn: detail.descriptionEn,
      image: detail.image ?? '',
      minimumOrderFa: detail.minimumOrderFa ?? '', minimumOrderEn: detail.minimumOrderEn ?? '',
      turnaroundFa: detail.turnaroundFa ?? '', turnaroundEn: detail.turnaroundEn ?? '',
      isActive: detail.isActive,
      sortOrder: detail.sortOrder,
      features: detail.features.map(f => ({ valueFa: f.valueFa, valueEn: f.valueEn })),
      specifications: detail.specifications.map(s => ({
        labelFa: s.labelFa, labelEn: s.labelEn, valuesFa: s.valuesFa, valuesEn: s.valuesEn,
      })),
    })
  }
  catch {
    formError.value = t('admin.states.notFound')
  }
  finally {
    loadingDetail.value = false
  }
}

/** Client-side checks mirroring the server schema, for immediate feedback. */
function validate(): boolean {
  const next: FieldIssues = {}
  const required = [
    'titleFa', 'titleEn', 'shortDescriptionFa', 'shortDescriptionEn',
    'descriptionFa', 'descriptionEn',
  ] as const

  for (const field of required) {
    if (!form[field].trim()) next[field] = [t('admin.validation.required')]
  }
  if (!form.slug.trim()) next.slug = [t('admin.validation.required')]
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
    next.slug = [t('admin.validation.slug')]
  }

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
    slug: form.slug.trim(),
    image: form.image.trim() || null,
    minimumOrderFa: form.minimumOrderFa.trim() || null,
    minimumOrderEn: form.minimumOrderEn.trim() || null,
    turnaroundFa: form.turnaroundFa.trim() || null,
    turnaroundEn: form.turnaroundEn.trim() || null,
    sortOrder: Number(form.sortOrder) || 0,
  }

  const result = editingId.value
    ? await resource.update(editingId.value, body)
    : await resource.create(body)

  if (result.ok) {
    modalOpen.value = false
    return
  }
  // Keep the operator's input; only surface what needs fixing.
  issues.value = result.error.issues
  formError.value = result.error.message
}

/* --------------------------------- Delete -------------------------------- */

const deleteTarget = ref<ServiceRow | null>(null)
const deleteImpact = ref<{ pricingRows: number, quoteRequests: number } | null>(null)

async function askDelete(row: ServiceRow) {
  deleteTarget.value = row
  deleteImpact.value = null
  deleteImpact.value = await $fetch<{ pricingRows: number, quoteRequests: number }>(
    `/api/admin/services/${row.id}/impact`,
  ).catch(() => null)
}

const deleteConsequences = computed(() => {
  const lines = [t('admin.delete.irreversible')]
  if (deleteImpact.value?.pricingRows) {
    lines.push(t('admin.delete.servicePricing', { count: deleteImpact.value.pricingRows }))
  }
  if (deleteImpact.value?.quoteRequests) {
    lines.push(t('admin.delete.serviceQuotes', { count: deleteImpact.value.quoteRequests }))
  }
  return lines
})

async function confirmDelete() {
  if (!deleteTarget.value) return
  const result = await resource.remove(deleteTarget.value.id)
  if (result.ok) deleteTarget.value = null
}

/* -------------------------------- Reorder -------------------------------- */

async function move(row: ServiceRow, direction: -1 | 1) {
  const ids = reorderIds(rows.value, row.id, direction)
  if (ids) await resource.reorder(ids)
}

const columns = computed(() => [
  { key: 'title', label: t('admin.fields.titleFa') },
  { key: 'slug', label: t('admin.fields.slug'), hideOnMobile: true },
  { key: 'status', label: t('admin.fields.status') },
  { key: 'pricing', label: t('admin.services.pricingCount'), numeric: true, hideOnMobile: true },
  { key: 'order', label: t('admin.fields.sortOrder'), numeric: true, hideOnMobile: true },
  { key: 'actions', label: '', numeric: true },
])

const activeOptions = computed(() => [
  { value: 'all', label: t('admin.filters.all') },
  { value: 'active', label: t('admin.filters.activeOnly') },
  { value: 'inactive', label: t('admin.filters.inactiveOnly') },
])
</script>

<template>
  <div>
    <AdminPageHeader
      :title="t('admin.services.title')"
      :description="t('admin.services.description')"
      :action-label="t('admin.services.create')"
      @action="openCreate"
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
        v-model="filters.active"
        :items="activeOptions"
        value-key="value"
        class="w-44"
        :aria-label="t('admin.fields.status')"
      />
    </AdminFilterBar>

    <AdminResourceList
      :columns="columns"
      :rows="rows"
      :pending="resource.pending.value"
      :error="resource.error.value"
      :filtered="isFiltered"
      :count-label="total ? t('admin.services.count', { count: total }) : undefined"
      :empty-title="t('admin.services.emptyTitle')"
      :empty-description="t('admin.services.emptyDescription')"
      @retry="() => { resource.refresh() }"
    >
      <template #empty-action>
        <UButton color="primary" icon="i-lucide-plus" @click="openCreate">
          {{ t('admin.services.create') }}
        </UButton>
      </template>

      <template #cell-title="{ row }">
        <div class="flex items-center gap-3">
          <AdminThumb :src="row.image" :alt="pick(row.titleFa, row.titleEn)" />
          <div class="min-w-0">
            <p class="truncate font-medium text-[var(--color-foreground)]">
              {{ pick(row.titleFa, row.titleEn) }}
            </p>
            <p class="truncate text-xs text-[var(--color-muted)]" dir="ltr">
              {{ row.titleEn }}
            </p>
          </div>
        </div>
      </template>

      <template #cell-slug="{ row }">
        <code class="text-xs text-[var(--color-muted)]" dir="ltr">{{ row.slug }}</code>
      </template>

      <template #cell-status="{ row }">
        <AdminStatusBadge
          :active="row.isActive"
          :active-label="t('admin.fields.active')"
          :inactive-label="t('admin.fields.inactive')"
        />
      </template>

      <template #cell-pricing="{ row }">
        {{ formatNumber(row.pricingCount) }}
      </template>

      <template #cell-order="{ row }">
        {{ formatNumber(row.sortOrder) }}
      </template>

      <template #cell-actions="{ row, index }">
        <AdminRowActions
          :edit-label="t('admin.actions.edit')"
          :delete-label="t('admin.actions.delete')"
          :up-label="t('admin.actions.moveUp')"
          :down-label="t('admin.actions.moveDown')"
          :disable-up="index === 0"
          :disable-down="index === rows.length - 1"
          :busy="resource.saving.value"
          @edit="() => { openEdit(row.id) }"
          @remove="() => { askDelete(row) }"
          @up="() => { move(row, -1) }"
          @down="() => { move(row, 1) }"
        >
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            square
            :icon="row.isActive ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            :aria-label="row.isActive ? t('admin.actions.deactivate') : t('admin.actions.activate')"
            :title="row.isActive ? t('admin.actions.deactivate') : t('admin.actions.activate')"
            :disabled="resource.saving.value"
            @click="() => { resource.setActive(row.id, !row.isActive) }"
          />
        </AdminRowActions>
      </template>
    </AdminResourceList>

    <AdminPagination
      v-model:page="filters.page"
      :per-page="filters.perPage"
      :total="total"
      :showing-label="t('admin.pagination.showing', {
        from: (filters.page - 1) * filters.perPage + 1,
        to: Math.min(filters.page * filters.perPage, total),
        total,
      })"
      :previous-label="t('admin.pagination.previous')"
      :next-label="t('admin.pagination.next')"
    />

    <!-- Create / edit -->
    <AdminFormModal
      v-model:open="modalOpen"
      wide
      :title="editingId ? t('admin.services.editTitle') : t('admin.services.createTitle')"
      :submit-label="resource.saving.value ? t('admin.actions.saving') : t('admin.actions.save')"
      :cancel-label="t('admin.actions.cancel')"
      :saving="resource.saving.value || loadingDetail"
      :error-message="formError"
      @submit="onSubmit"
    >
      <AdminFormSection :title="t('admin.services.sectionMain')">
        <AdminField :label="t('admin.fields.titleFa')" :errors="issues.titleFa" required dir="rtl">
          <UInput v-model="form.titleFa" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.titleEn')" :errors="issues.titleEn" required dir="ltr">
          <UInput v-model="form.titleEn" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.slug')"
          :hint="t('admin.fields.slugHint')"
          :errors="issues.slug"
          required
          dir="ltr"
        >
          <UInput v-model="form.slug" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.image')"
          :hint="t('admin.fields.imageHint')"
          :errors="issues.image"
          dir="ltr"
        >
          <div class="flex items-center gap-2">
            <UInput v-model="form.image" class="flex-1" />
            <AdminThumb :src="form.image" />
          </div>
        </AdminField>
      </AdminFormSection>

      <AdminFormSection :title="t('admin.services.sectionContent')">
        <AdminField
          :label="t('admin.fields.shortDescriptionFa')"
          :errors="issues.shortDescriptionFa"
          required
          dir="rtl"
        >
          <UTextarea v-model="form.shortDescriptionFa" :rows="2" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.shortDescriptionEn')"
          :errors="issues.shortDescriptionEn"
          required
          dir="ltr"
        >
          <UTextarea v-model="form.shortDescriptionEn" :rows="2" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.descriptionFa')"
          :errors="issues.descriptionFa"
          required
          dir="rtl"
        >
          <UTextarea v-model="form.descriptionFa" :rows="6" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.descriptionEn')"
          :errors="issues.descriptionEn"
          required
          dir="ltr"
        >
          <UTextarea v-model="form.descriptionEn" :rows="6" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.minimumOrderFa')" dir="rtl">
          <UInput v-model="form.minimumOrderFa" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.minimumOrderEn')" dir="ltr">
          <UInput v-model="form.minimumOrderEn" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.turnaroundFa')" dir="rtl">
          <UInput v-model="form.turnaroundFa" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.turnaroundEn')" dir="ltr">
          <UInput v-model="form.turnaroundEn" class="w-full" />
        </AdminField>
      </AdminFormSection>

      <AdminFormSection :title="t('admin.fields.features')" :description="t('admin.services.featuresHint')">
        <div class="sm:col-span-2">
          <AdminRepeatableList
            :items="form.features"
            :add-label="t('admin.services.addFeature')"
            :remove-label="t('admin.actions.remove')"
            :up-label="t('admin.actions.moveUp')"
            :down-label="t('admin.actions.moveDown')"
            :max="30"
            @add="() => { form.features.push({ valueFa: '', valueEn: '' }) }"
            @remove="(index: number) => { form.features.splice(index, 1) }"
            @move="(from: number, to: number) => { form.features.splice(to, 0, ...form.features.splice(from, 1)) }"
          >
            <template #default="{ index }">
              <AdminField :label="t('admin.fields.valueFa')" dir="rtl">
                <UInput v-model="form.features[index]!.valueFa" class="w-full" />
              </AdminField>
              <AdminField :label="t('admin.fields.valueEn')" dir="ltr">
                <UInput v-model="form.features[index]!.valueEn" class="w-full" />
              </AdminField>
            </template>
          </AdminRepeatableList>
        </div>
      </AdminFormSection>

      <AdminFormSection :title="t('admin.fields.specifications')">
        <div class="sm:col-span-2">
          <AdminRepeatableList
            :items="form.specifications"
            :add-label="t('admin.services.addSpecification')"
            :remove-label="t('admin.actions.remove')"
            :up-label="t('admin.actions.moveUp')"
            :down-label="t('admin.actions.moveDown')"
            :max="20"
            @add="() => { form.specifications.push({ labelFa: '', labelEn: '', valuesFa: '', valuesEn: '' }) }"
            @remove="(index: number) => { form.specifications.splice(index, 1) }"
            @move="(from: number, to: number) => { form.specifications.splice(to, 0, ...form.specifications.splice(from, 1)) }"
          >
            <template #default="{ index }">
              <AdminField :label="t('admin.fields.labelFa')" dir="rtl">
                <UInput v-model="form.specifications[index]!.labelFa" class="w-full" />
              </AdminField>
              <AdminField :label="t('admin.fields.labelEn')" dir="ltr">
                <UInput v-model="form.specifications[index]!.labelEn" class="w-full" />
              </AdminField>
              <AdminField
                :label="t('admin.fields.valueFa')"
                :hint="t('admin.fields.specValuesHint')"
                dir="rtl"
              >
                <UTextarea v-model="form.specifications[index]!.valuesFa" :rows="3" class="w-full" />
              </AdminField>
              <AdminField
                :label="t('admin.fields.valueEn')"
                :hint="t('admin.fields.specValuesHint')"
                dir="ltr"
              >
                <UTextarea v-model="form.specifications[index]!.valuesEn" :rows="3" class="w-full" />
              </AdminField>
            </template>
          </AdminRepeatableList>
        </div>
      </AdminFormSection>

      <AdminFormSection :title="t('admin.services.sectionDisplay')">
        <AdminField :label="t('admin.fields.sortOrder')" :hint="t('admin.fields.sortOrderHint')">
          <UInputNumber v-model="form.sortOrder" :min="0" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.status')">
          <USwitch v-model="form.isActive" :label="t('admin.fields.active')" />
        </AdminField>
      </AdminFormSection>
    </AdminFormModal>

    <!-- Delete -->
    <AdminConfirmDialog
      :open="Boolean(deleteTarget)"
      :title="t('admin.delete.title')"
      :message="t('admin.delete.service', { name: deleteTarget ? pick(deleteTarget.titleFa, deleteTarget.titleEn) : '' })"
      :consequences="deleteConsequences"
      :confirm-label="t('admin.actions.confirmDelete')"
      :cancel-label="t('admin.actions.cancel')"
      :loading="resource.saving.value"
      @update:open="(value: boolean) => { if (!value) deleteTarget = null }"
      @confirm="confirmDelete"
    />
  </div>
</template>
