<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
defineI18nRoute(false)

const { t } = useI18n()
const pick = useAdminLocalized()
const { formatNumber } = useAdminFormat()
useHead({ title: () => `${t('admin.faqs.title')} — ${t('admin.brand')}` })

const CATEGORIES = ['orders', 'technical', 'delivery', 'pricing'] as const

interface FaqRow {
  id: string
  category: string
  questionFa: string
  questionEn: string
  answerFa: string
  answerEn: string
  isActive: boolean
  sortOrder: number
}

const { filters, query, reset } = useAdminFilters({
  search: '', active: 'all', category: 'all', perPage: 100,
})

const resource = useAdminResource<{ items: FaqRow[], total: number }>({
  endpoint: 'faqs',
  key: 'admin-faqs',
  query,
})

const rows = computed(() => resource.data.value?.items ?? [])
const total = computed(() => resource.data.value?.total ?? 0)
const isFiltered = computed(() =>
  Boolean(filters.search) || filters.active !== 'all' || filters.category !== 'all')

function blankForm() {
  return {
    category: 'orders' as string,
    questionFa: '', questionEn: '',
    answerFa: '', answerEn: '',
    isActive: true,
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

function openEdit(row: FaqRow) {
  // FAQ rows are small and already fully loaded in the list, so there is no
  // need for a second request just to populate the form.
  editingId.value = row.id
  Object.assign(form, {
    category: row.category,
    questionFa: row.questionFa, questionEn: row.questionEn,
    answerFa: row.answerFa, answerEn: row.answerEn,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  })
  issues.value = {}
  formError.value = ''
  modalOpen.value = true
}

function validate(): boolean {
  const next: FieldIssues = {}
  for (const field of ['questionFa', 'questionEn', 'answerFa', 'answerEn'] as const) {
    if (!form[field].trim()) next[field] = [t('admin.validation.required')]
  }
  if (!CATEGORIES.includes(form.category as typeof CATEGORIES[number])) {
    next.category = [t('admin.validation.selectOption')]
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

  const body = { ...form, sortOrder: Number(form.sortOrder) || 0 }
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

const deleteTarget = ref<FaqRow | null>(null)

async function confirmDelete() {
  if (!deleteTarget.value) return
  const result = await resource.remove(deleteTarget.value.id)
  if (result.ok) deleteTarget.value = null
}

async function move(row: FaqRow, direction: -1 | 1) {
  const ids = reorderIds(rows.value, row.id, direction)
  if (ids) await resource.reorder(ids)
}

const columns = computed(() => [
  { key: 'question', label: t('admin.fields.questionFa') },
  { key: 'category', label: t('admin.fields.category') },
  { key: 'status', label: t('admin.fields.status') },
  { key: 'order', label: t('admin.fields.sortOrder'), numeric: true, hideOnMobile: true },
  { key: 'actions', label: '', numeric: true },
])

const categoryOptions = computed(() =>
  CATEGORIES.map(key => ({ value: key as string, label: t(`admin.faqs.categories.${key}`) })))

const categoryFilterOptions = computed(() => [
  { value: 'all', label: t('admin.filters.allCategories') },
  ...categoryOptions.value,
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
      :title="t('admin.faqs.title')"
      :description="t('admin.faqs.description')"
      :action-label="t('admin.faqs.create')"
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
        v-model="filters.category"
        :items="categoryFilterOptions"
        value-key="value"
        class="w-44"
        :aria-label="t('admin.fields.category')"
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
      :count-label="total ? t('admin.faqs.count', { count: total }) : undefined"
      :empty-title="t('admin.faqs.emptyTitle')"
      :empty-description="t('admin.faqs.emptyDescription')"
      @retry="() => { resource.refresh() }"
    >
      <template #empty-action>
        <UButton color="primary" icon="i-lucide-plus" @click="openCreate">
          {{ t('admin.faqs.create') }}
        </UButton>
      </template>

      <template #cell-question="{ row }">
        <p class="max-w-xl font-medium text-[var(--color-foreground)]">
          {{ pick(row.questionFa, row.questionEn) }}
        </p>
      </template>

      <template #cell-category="{ row }">
        <UBadge color="neutral" variant="subtle" size="sm">
          {{ t(`admin.faqs.categories.${row.category}`) }}
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
          @edit="() => { openEdit(row as FaqRow) }"
          @remove="() => { deleteTarget = row as FaqRow }"
          @up="() => { move(row as FaqRow, -1) }"
          @down="() => { move(row as FaqRow, 1) }"
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

    <AdminFormModal
      v-model:open="modalOpen"
      wide
      :title="editingId ? t('admin.faqs.editTitle') : t('admin.faqs.createTitle')"
      :submit-label="resource.saving.value ? t('admin.actions.saving') : t('admin.actions.save')"
      :cancel-label="t('admin.actions.cancel')"
      :saving="resource.saving.value"
      :error-message="formError"
      @submit="onSubmit"
    >
      <AdminFormSection :title="t('admin.faqs.title')">
        <AdminField
          :label="t('admin.fields.questionFa')"
          :errors="issues.questionFa"
          required
          full
          dir="rtl"
        >
          <UInput v-model="form.questionFa" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.questionEn')"
          :errors="issues.questionEn"
          required
          full
          dir="ltr"
        >
          <UInput v-model="form.questionEn" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.answerFa')"
          :errors="issues.answerFa"
          required
          full
          dir="rtl"
        >
          <UTextarea v-model="form.answerFa" :rows="6" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.answerEn')"
          :errors="issues.answerEn"
          required
          full
          dir="ltr"
        >
          <UTextarea v-model="form.answerEn" :rows="6" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.category')" :errors="issues.category" required>
          <USelect v-model="form.category" :items="categoryOptions" value-key="value" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.sortOrder')" :hint="t('admin.fields.sortOrderHint')">
          <UInputNumber v-model="form.sortOrder" :min="0" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.status')">
          <USwitch v-model="form.isActive" :label="t('admin.fields.active')" />
        </AdminField>
      </AdminFormSection>
    </AdminFormModal>

    <AdminConfirmDialog
      :open="Boolean(deleteTarget)"
      :title="t('admin.delete.title')"
      :message="t('admin.delete.faq')"
      :consequences="[t('admin.delete.irreversible')]"
      :confirm-label="t('admin.actions.confirmDelete')"
      :cancel-label="t('admin.actions.cancel')"
      :loading="resource.saving.value"
      @update:open="(value: boolean) => { if (!value) deleteTarget = null }"
      @confirm="confirmDelete"
    />
  </div>
</template>
