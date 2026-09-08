<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
defineI18nRoute(false)

const { t } = useI18n()
const pick = useAdminLocalized()
const { formatNumber } = useAdminFormat()
useHead({ title: () => `${t('admin.equipment.title')} — ${t('admin.brand')}` })

const TYPES = ['offset', 'digital', 'prepress', 'finishing'] as const

interface EquipmentRow {
  id: string
  slug: string
  nameFa: string
  nameEn: string
  manufacturerFa: string
  manufacturerEn: string
  model: string
  typeKey: string
  installedYear: number | null
  descriptionFa: string
  descriptionEn: string
  image: string | null
  isActive: boolean
  sortOrder: number
}

interface Spec { labelFa: string, labelEn: string, valueFa: string, valueEn: string }

const { filters, query, reset } = useAdminFilters({
  search: '', active: 'all', type: 'all', perPage: 20,
})

const resource = useAdminResource<{ items: EquipmentRow[], total: number }>({
  endpoint: 'equipment',
  key: 'admin-equipment',
  query,
})

const rows = computed(() => resource.data.value?.items ?? [])
const total = computed(() => resource.data.value?.total ?? 0)
const isFiltered = computed(() =>
  Boolean(filters.search) || filters.active !== 'all' || filters.type !== 'all')

function blankForm() {
  return {
    slug: '',
    nameFa: '', nameEn: '',
    manufacturerFa: '', manufacturerEn: '',
    model: '',
    typeKey: 'offset' as string,
    installedYear: null as number | null,
    descriptionFa: '', descriptionEn: '',
    image: '',
    isActive: true,
    sortOrder: 0,
    specs: [] as Spec[],
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
    const detail = await $fetch<EquipmentRow & { specs: Spec[] }>(`/api/admin/equipment/${id}`)
    Object.assign(form, {
      slug: detail.slug,
      nameFa: detail.nameFa, nameEn: detail.nameEn,
      manufacturerFa: detail.manufacturerFa, manufacturerEn: detail.manufacturerEn,
      model: detail.model,
      typeKey: detail.typeKey,
      installedYear: detail.installedYear,
      descriptionFa: detail.descriptionFa, descriptionEn: detail.descriptionEn,
      image: detail.image ?? '',
      isActive: detail.isActive,
      sortOrder: detail.sortOrder,
      specs: detail.specs.map(s => ({
        labelFa: s.labelFa, labelEn: s.labelEn, valueFa: s.valueFa, valueEn: s.valueEn,
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

function validate(): boolean {
  const next: FieldIssues = {}
  const required = [
    'nameFa', 'nameEn', 'manufacturerFa', 'manufacturerEn', 'model',
    'descriptionFa', 'descriptionEn',
  ] as const

  for (const field of required) {
    if (!String(form[field]).trim()) next[field] = [t('admin.validation.required')]
  }
  if (!form.slug.trim()) next.slug = [t('admin.validation.required')]
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
    next.slug = [t('admin.validation.slug')]
  }
  if (!TYPES.includes(form.typeKey as typeof TYPES[number])) {
    next.typeKey = [t('admin.validation.selectOption')]
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
    installedYear: form.installedYear ? Number(form.installedYear) : null,
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

const deleteTarget = ref<EquipmentRow | null>(null)

async function confirmDelete() {
  if (!deleteTarget.value) return
  const result = await resource.remove(deleteTarget.value.id)
  if (result.ok) deleteTarget.value = null
}

async function move(row: EquipmentRow, direction: -1 | 1) {
  const ids = reorderIds(rows.value, row.id, direction)
  if (ids) await resource.reorder(ids)
}

const columns = computed(() => [
  { key: 'name', label: t('admin.fields.nameFa') },
  { key: 'model', label: t('admin.fields.model'), hideOnMobile: true },
  { key: 'type', label: t('admin.fields.type') },
  { key: 'status', label: t('admin.fields.status') },
  { key: 'order', label: t('admin.fields.sortOrder'), numeric: true, hideOnMobile: true },
  { key: 'actions', label: '', numeric: true },
])

const typeOptions = computed(() =>
  TYPES.map(type => ({ value: type as string, label: t(`admin.equipment.types.${type}`) })))

const typeFilterOptions = computed(() => [
  { value: 'all', label: t('admin.filters.allTypes') },
  ...typeOptions.value,
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
      :title="t('admin.equipment.title')"
      :description="t('admin.equipment.description')"
      :action-label="t('admin.equipment.create')"
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
        v-model="filters.type"
        :items="typeFilterOptions"
        value-key="value"
        class="w-44"
        :aria-label="t('admin.fields.type')"
      />
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
      :count-label="total ? t('admin.equipment.count', { count: total }) : undefined"
      :empty-title="t('admin.equipment.emptyTitle')"
      :empty-description="t('admin.equipment.emptyDescription')"
      @retry="() => { resource.refresh() }"
    >
      <template #empty-action>
        <UButton color="primary" icon="i-lucide-plus" @click="openCreate">
          {{ t('admin.equipment.create') }}
        </UButton>
      </template>

      <template #cell-name="{ row }">
        <div class="flex items-center gap-3">
          <AdminThumb :src="row.image" :alt="pick(row.nameFa, row.nameEn)" />
          <div class="min-w-0">
            <p class="truncate font-medium text-[var(--color-foreground)]">
              {{ pick(row.nameFa, row.nameEn) }}
            </p>
            <p class="truncate text-xs text-[var(--color-muted)]">
              {{ pick(row.manufacturerFa, row.manufacturerEn) }}
            </p>
          </div>
        </div>
      </template>

      <template #cell-model="{ row }">
        <span dir="ltr">{{ row.model }}</span>
      </template>

      <template #cell-type="{ row }">
        <UBadge color="neutral" variant="subtle" size="sm">
          {{ t(`admin.equipment.types.${row.typeKey}`) }}
        </UBadge>
      </template>

      <template #cell-status="{ row }">
        <AdminStatusBadge
          :active="row.isActive"
          :active-label="t('admin.fields.active')"
          :inactive-label="t('admin.fields.inactive')"
        />
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
          @remove="() => { deleteTarget = row }"
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

    <AdminFormModal
      v-model:open="modalOpen"
      wide
      :title="editingId ? t('admin.equipment.editTitle') : t('admin.equipment.createTitle')"
      :submit-label="resource.saving.value ? t('admin.actions.saving') : t('admin.actions.save')"
      :cancel-label="t('admin.actions.cancel')"
      :saving="resource.saving.value || loadingDetail"
      :error-message="formError"
      @submit="onSubmit"
    >
      <AdminFormSection :title="t('admin.equipment.sectionMain')">
        <AdminField :label="t('admin.fields.nameFa')" :errors="issues.nameFa" required dir="rtl">
          <UInput v-model="form.nameFa" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.nameEn')" :errors="issues.nameEn" required dir="ltr">
          <UInput v-model="form.nameEn" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.manufacturerFa')"
          :errors="issues.manufacturerFa"
          required
          dir="rtl"
        >
          <UInput v-model="form.manufacturerFa" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.manufacturerEn')"
          :errors="issues.manufacturerEn"
          required
          dir="ltr"
        >
          <UInput v-model="form.manufacturerEn" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.model')" :errors="issues.model" required dir="ltr">
          <UInput v-model="form.model" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.type')" :errors="issues.typeKey" required>
          <USelect v-model="form.typeKey" :items="typeOptions" value-key="value" class="w-full" />
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
        <AdminField :label="t('admin.fields.installedYear')" :errors="issues.installedYear">
          <UInputNumber v-model="form.installedYear" :min="1900" :max="2200" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.descriptionFa')"
          :errors="issues.descriptionFa"
          required
          dir="rtl"
        >
          <UTextarea v-model="form.descriptionFa" :rows="4" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.descriptionEn')"
          :errors="issues.descriptionEn"
          required
          dir="ltr"
        >
          <UTextarea v-model="form.descriptionEn" :rows="4" class="w-full" />
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
        <AdminField :label="t('admin.fields.sortOrder')" :hint="t('admin.fields.sortOrderHint')">
          <UInputNumber v-model="form.sortOrder" :min="0" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.status')">
          <USwitch v-model="form.isActive" :label="t('admin.fields.active')" />
        </AdminField>
      </AdminFormSection>

      <AdminFormSection :title="t('admin.equipment.sectionSpecs')">
        <div class="sm:col-span-2">
          <AdminRepeatableList
            :items="form.specs"
            :add-label="t('admin.equipment.addSpec')"
            :remove-label="t('admin.actions.remove')"
            :up-label="t('admin.actions.moveUp')"
            :down-label="t('admin.actions.moveDown')"
            :max="20"
            @add="() => { form.specs.push({ labelFa: '', labelEn: '', valueFa: '', valueEn: '' }) }"
            @remove="(index: number) => { form.specs.splice(index, 1) }"
            @move="(from: number, to: number) => { form.specs.splice(to, 0, ...form.specs.splice(from, 1)) }"
          >
            <template #default="{ index }">
              <AdminField :label="t('admin.fields.labelFa')" dir="rtl">
                <UInput v-model="form.specs[index]!.labelFa" class="w-full" />
              </AdminField>
              <AdminField :label="t('admin.fields.labelEn')" dir="ltr">
                <UInput v-model="form.specs[index]!.labelEn" class="w-full" />
              </AdminField>
              <AdminField :label="t('admin.fields.valueFa')" dir="rtl">
                <UInput v-model="form.specs[index]!.valueFa" class="w-full" />
              </AdminField>
              <AdminField :label="t('admin.fields.valueEn')" dir="ltr">
                <UInput v-model="form.specs[index]!.valueEn" class="w-full" />
              </AdminField>
            </template>
          </AdminRepeatableList>
        </div>
      </AdminFormSection>
    </AdminFormModal>

    <AdminConfirmDialog
      :open="Boolean(deleteTarget)"
      :title="t('admin.delete.title')"
      :message="t('admin.delete.equipment', { name: deleteTarget ? pick(deleteTarget.nameFa, deleteTarget.nameEn) : '' })"
      :consequences="[t('admin.delete.irreversible')]"
      :confirm-label="t('admin.actions.confirmDelete')"
      :cancel-label="t('admin.actions.cancel')"
      :loading="resource.saving.value"
      @update:open="(value: boolean) => { if (!value) deleteTarget = null }"
      @confirm="confirmDelete"
    />
  </div>
</template>
