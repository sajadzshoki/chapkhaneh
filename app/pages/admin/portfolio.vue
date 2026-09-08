<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
defineI18nRoute(false)

/**
 * Projects and their categories are managed on one screen behind two tabs.
 * They are two tables but a single mental model ("the portfolio"), and the
 * category picker in the project form depends on the category list anyway.
 */
const { t } = useI18n()
const pick = useAdminLocalized()
const { formatNumber } = useAdminFormat()
useHead({ title: () => `${t('admin.portfolio.title')} — ${t('admin.brand')}` })

const tab = ref<'projects' | 'categories'>('projects')

/* ------------------------------- Categories ------------------------------ */

interface CategoryRow {
  id: string
  slug: string
  nameFa: string
  nameEn: string
  descriptionFa: string | null
  descriptionEn: string | null
  sortOrder: number
  itemCount: number
}

const categories = useAdminResource<{ items: CategoryRow[] }>({
  endpoint: 'portfolio-categories',
  key: 'admin-portfolio-categories',
})

const categoryRows = computed(() => categories.data.value?.items ?? [])

const categoryOptions = computed(() =>
  categoryRows.value.map(row => ({ value: row.id, label: pick(row.nameFa, row.nameEn) })))

/* -------------------------------- Projects ------------------------------- */

interface ProjectRow {
  id: string
  slug: string
  titleFa: string
  titleEn: string
  coverImage: string
  year: number | null
  isFeatured: boolean
  isActive: boolean
  sortOrder: number
  categoryId: string
  categoryNameFa: string
  categoryNameEn: string
  imageCount: number
}

interface GalleryImage { image: string, altFa: string, altEn: string }

const { filters, query, reset } = useAdminFilters({
  search: '', active: 'all', category: 'all', featured: 'all', perPage: 20,
})

const projects = useAdminResource<{ items: ProjectRow[], total: number }>({
  endpoint: 'portfolio',
  key: 'admin-portfolio',
  query,
})

const projectRows = computed(() => projects.data.value?.items ?? [])
const projectTotal = computed(() => projects.data.value?.total ?? 0)
const isFiltered = computed(() =>
  Boolean(filters.search) || filters.active !== 'all'
  || filters.category !== 'all' || filters.featured !== 'all')

function blankProject() {
  return {
    slug: '',
    titleFa: '', titleEn: '',
    descriptionFa: '', descriptionEn: '',
    coverImage: '',
    year: null as number | null,
    clientFa: '', clientEn: '',
    categoryId: categoryOptions.value[0]?.value ?? '',
    isFeatured: false,
    isActive: true,
    sortOrder: 0,
    images: [] as GalleryImage[],
  }
}

const projectModal = ref(false)
const editingProject = ref<string | null>(null)
const projectForm = reactive(blankProject())
const projectIssues = ref<FieldIssues>({})
const projectError = ref('')
const loadingProject = ref(false)

function openCreateProject() {
  editingProject.value = null
  Object.assign(projectForm, blankProject(), { sortOrder: projectRows.value.length + 1 })
  projectIssues.value = {}
  projectError.value = ''
  projectModal.value = true
}

async function openEditProject(id: string) {
  editingProject.value = id
  projectIssues.value = {}
  projectError.value = ''
  loadingProject.value = true
  projectModal.value = true

  try {
    const detail = await $fetch<ProjectRow & {
      descriptionFa: string
      descriptionEn: string
      clientFa: string | null
      clientEn: string | null
      images: GalleryImage[]
    }>(`/api/admin/portfolio/${id}`)

    Object.assign(projectForm, {
      slug: detail.slug,
      titleFa: detail.titleFa, titleEn: detail.titleEn,
      descriptionFa: detail.descriptionFa, descriptionEn: detail.descriptionEn,
      coverImage: detail.coverImage,
      year: detail.year,
      clientFa: detail.clientFa ?? '', clientEn: detail.clientEn ?? '',
      categoryId: detail.categoryId,
      isFeatured: detail.isFeatured,
      isActive: detail.isActive,
      sortOrder: detail.sortOrder,
      images: detail.images.map(img => ({
        image: img.image, altFa: img.altFa, altEn: img.altEn,
      })),
    })
  }
  catch {
    projectError.value = t('admin.states.notFound')
  }
  finally {
    loadingProject.value = false
  }
}

function validateProject(): boolean {
  const next: FieldIssues = {}
  for (const field of ['titleFa', 'titleEn', 'descriptionFa', 'descriptionEn'] as const) {
    if (!projectForm[field].trim()) next[field] = [t('admin.validation.required')]
  }
  if (!projectForm.coverImage.trim()) next.coverImage = [t('admin.validation.required')]
  if (!projectForm.categoryId) next.categoryId = [t('admin.validation.selectOption')]
  if (!projectForm.slug.trim()) next.slug = [t('admin.validation.required')]
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(projectForm.slug.trim())) {
    next.slug = [t('admin.validation.slug')]
  }

  projectIssues.value = next
  return Object.keys(next).length === 0
}

async function submitProject() {
  projectError.value = ''
  if (!validateProject()) {
    projectError.value = t('admin.states.validationFailed')
    return
  }

  const body = {
    ...projectForm,
    slug: projectForm.slug.trim(),
    clientFa: projectForm.clientFa.trim() || null,
    clientEn: projectForm.clientEn.trim() || null,
    year: projectForm.year ? Number(projectForm.year) : null,
    sortOrder: Number(projectForm.sortOrder) || 0,
    // Blank gallery rows are dropped rather than rejected — an operator who
    // added a row and changed their mind should not be blocked by it.
    images: projectForm.images.filter(img => img.image.trim()),
    details: [],
    serviceIds: [],
  }

  const result = editingProject.value
    ? await projects.update(editingProject.value, body)
    : await projects.create(body)

  if (result.ok) {
    projectModal.value = false
    await categories.refresh()
    return
  }
  projectIssues.value = result.error.issues
  projectError.value = result.error.message
}

const deleteProject = ref<ProjectRow | null>(null)

async function confirmDeleteProject() {
  if (!deleteProject.value) return
  const result = await projects.remove(deleteProject.value.id)
  if (result.ok) {
    deleteProject.value = null
    await categories.refresh()
  }
}

async function moveProject(row: ProjectRow, direction: -1 | 1) {
  const ids = reorderIds(projectRows.value, row.id, direction)
  if (ids) await projects.reorder(ids)
}

async function toggleFlag(row: ProjectRow, flag: 'isActive' | 'isFeatured') {
  await projects.patch(`${row.id}/flags`, { [flag]: !row[flag] })
}

/* --------------------------- Category form/delete ------------------------ */

function blankCategory() {
  return { slug: '', nameFa: '', nameEn: '', descriptionFa: '', descriptionEn: '', sortOrder: 0 }
}

const categoryModal = ref(false)
const editingCategory = ref<string | null>(null)
const categoryForm = reactive(blankCategory())
const categoryIssues = ref<FieldIssues>({})
const categoryError = ref('')

function openCreateCategory() {
  editingCategory.value = null
  Object.assign(categoryForm, blankCategory(), { sortOrder: categoryRows.value.length + 1 })
  categoryIssues.value = {}
  categoryError.value = ''
  categoryModal.value = true
}

function openEditCategory(row: CategoryRow) {
  editingCategory.value = row.id
  Object.assign(categoryForm, {
    slug: row.slug,
    nameFa: row.nameFa, nameEn: row.nameEn,
    descriptionFa: row.descriptionFa ?? '', descriptionEn: row.descriptionEn ?? '',
    sortOrder: row.sortOrder,
  })
  categoryIssues.value = {}
  categoryError.value = ''
  categoryModal.value = true
}

async function submitCategory() {
  categoryError.value = ''
  const next: FieldIssues = {}
  if (!categoryForm.nameFa.trim()) next.nameFa = [t('admin.validation.required')]
  if (!categoryForm.nameEn.trim()) next.nameEn = [t('admin.validation.required')]
  if (!categoryForm.slug.trim()) next.slug = [t('admin.validation.required')]
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(categoryForm.slug.trim())) {
    next.slug = [t('admin.validation.slug')]
  }
  categoryIssues.value = next

  if (Object.keys(next).length) {
    categoryError.value = t('admin.states.validationFailed')
    return
  }

  const body = {
    ...categoryForm,
    slug: categoryForm.slug.trim(),
    descriptionFa: categoryForm.descriptionFa.trim() || null,
    descriptionEn: categoryForm.descriptionEn.trim() || null,
    sortOrder: Number(categoryForm.sortOrder) || 0,
  }

  const result = editingCategory.value
    ? await categories.update(editingCategory.value, body)
    : await categories.create(body)

  if (result.ok) {
    categoryModal.value = false
    return
  }
  categoryIssues.value = result.error.issues
  categoryError.value = result.error.message
}

/**
 * Categories are protected by ON DELETE RESTRICT. Rather than surfacing a
 * database error, an in-use category offers to move its projects elsewhere.
 */
const deleteCategory = ref<CategoryRow | null>(null)
const moveToCategory = ref('')

const moveTargets = computed(() =>
  categoryOptions.value.filter(option => option.value !== deleteCategory.value?.id))

function askDeleteCategory(row: CategoryRow) {
  deleteCategory.value = row
  moveToCategory.value = moveTargets.value[0]?.value ?? ''
}

const categoryBlocked = computed(() => (deleteCategory.value?.itemCount ?? 0) > 0)

async function confirmDeleteCategory() {
  if (!deleteCategory.value) return
  if (categoryBlocked.value && !moveToCategory.value) return

  const result = await categories.remove(
    deleteCategory.value.id,
    categoryBlocked.value ? { moveTo: moveToCategory.value } : undefined,
  )

  if (result.ok) {
    deleteCategory.value = null
    await projects.refresh()
  }
}

async function moveCategory(row: CategoryRow, direction: -1 | 1) {
  const ids = reorderIds(categoryRows.value, row.id, direction)
  if (ids) await categories.reorder(ids)
}

/* --------------------------------- Tables -------------------------------- */

const projectColumns = computed(() => [
  { key: 'title', label: t('admin.fields.titleFa') },
  { key: 'category', label: t('admin.fields.category'), hideOnMobile: true },
  { key: 'year', label: t('admin.fields.year'), numeric: true, hideOnMobile: true },
  { key: 'status', label: t('admin.fields.status') },
  { key: 'actions', label: '', numeric: true },
])

const categoryColumns = computed(() => [
  { key: 'name', label: t('admin.fields.nameFa') },
  { key: 'slug', label: t('admin.fields.slug'), hideOnMobile: true },
  { key: 'projects', label: t('admin.categories.projects'), numeric: true },
  { key: 'order', label: t('admin.fields.sortOrder'), numeric: true, hideOnMobile: true },
  { key: 'actions', label: '', numeric: true },
])

const activeOptions = computed(() => [
  { value: 'all', label: t('admin.filters.all') },
  { value: 'active', label: t('admin.filters.activeOnly') },
  { value: 'inactive', label: t('admin.filters.inactiveOnly') },
])

const featuredOptions = computed(() => [
  { value: 'all', label: t('admin.filters.all') },
  { value: 'yes', label: t('admin.filters.featuredOnly') },
  { value: 'no', label: t('admin.filters.notFeatured') },
])

const categoryFilterOptions = computed(() => [
  { value: 'all', label: t('admin.filters.allCategories') },
  ...categoryOptions.value,
])

const tabItems = computed(() => [
  { value: 'projects', label: t('admin.portfolio.tabProjects') },
  { value: 'categories', label: t('admin.portfolio.tabCategories') },
])
</script>

<template>
  <div>
    <AdminPageHeader
      :title="tab === 'projects' ? t('admin.portfolio.title') : t('admin.categories.title')"
      :description="tab === 'projects' ? t('admin.portfolio.description') : t('admin.categories.description')"
      :action-label="tab === 'projects' ? t('admin.portfolio.create') : t('admin.categories.create')"
      :action-disabled="tab === 'projects' && !categoryOptions.length"
      @action="tab === 'projects' ? openCreateProject() : openCreateCategory()"
    />

    <UTabs
      v-model="tab"
      :items="tabItems"
      :content="false"
      class="mb-5"
    />

    <!-- Projects -->
    <template v-if="tab === 'projects'">
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
          v-model="filters.featured"
          :items="featuredOptions"
          value-key="value"
          class="w-40"
          :aria-label="t('admin.fields.featured')"
        />
        <USelect
          v-model="filters.active"
          :items="activeOptions"
          value-key="value"
          class="w-40"
          :aria-label="t('admin.fields.status')"
        />
      </AdminFilterBar>

      <AdminResourceList
        :columns="projectColumns"
        :rows="projectRows"
        :pending="projects.pending.value"
        :error="projects.error.value"
        :filtered="isFiltered"
        :count-label="projectTotal ? t('admin.portfolio.count', { count: projectTotal }) : undefined"
        :empty-title="t('admin.portfolio.emptyTitle')"
        :empty-description="t('admin.portfolio.emptyDescription')"
        @retry="() => { projects.refresh() }"
      >
        <template #empty-action>
          <UButton
            color="primary"
            icon="i-lucide-plus"
            :disabled="!categoryOptions.length"
            @click="openCreateProject"
          >
            {{ t('admin.portfolio.create') }}
          </UButton>
        </template>

        <template #cell-title="{ row }">
          <div class="flex items-center gap-3">
            <AdminThumb :src="row.coverImage" :alt="pick(row.titleFa, row.titleEn)" />
            <div class="min-w-0">
              <p class="truncate font-medium text-[var(--color-foreground)]">
                {{ pick(row.titleFa, row.titleEn) }}
              </p>
              <p class="truncate text-xs text-[var(--color-muted)]">
                {{ t('admin.portfolio.images') }}: {{ formatNumber(row.imageCount) }}
              </p>
            </div>
          </div>
        </template>

        <template #cell-category="{ row }">
          {{ pick(row.categoryNameFa, row.categoryNameEn) }}
        </template>

        <template #cell-year="{ row }">
          {{ formatNumber(row.year) }}
        </template>

        <template #cell-status="{ row }">
          <div class="flex flex-wrap items-center gap-1">
            <AdminStatusBadge
              :active="row.isActive"
              :active-label="t('admin.fields.active')"
              :inactive-label="t('admin.fields.inactive')"
            />
            <UBadge v-if="row.isFeatured" color="warning" variant="subtle" size="sm">
              {{ t('admin.fields.featured') }}
            </UBadge>
          </div>
        </template>

        <template #cell-actions="{ row, index }">
          <AdminRowActions
            :edit-label="t('admin.actions.edit')"
            :delete-label="t('admin.actions.delete')"
            :up-label="t('admin.actions.moveUp')"
            :down-label="t('admin.actions.moveDown')"
            :disable-up="index === 0"
            :disable-down="index === projectRows.length - 1"
            :busy="projects.saving.value"
            @edit="() => { openEditProject(row.id) }"
            @remove="() => { deleteProject = row as ProjectRow }"
            @up="() => { moveProject(row as ProjectRow, -1) }"
            @down="() => { moveProject(row as ProjectRow, 1) }"
          >
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              square
              :icon="row.isFeatured ? 'i-lucide-star' : 'i-lucide-star-off'"
              :aria-label="row.isFeatured ? t('admin.actions.unfeature') : t('admin.actions.feature')"
              :title="row.isFeatured ? t('admin.actions.unfeature') : t('admin.actions.feature')"
              :disabled="projects.saving.value"
              @click="() => { toggleFlag(row as ProjectRow, 'isFeatured') }"
            />
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              square
              :icon="row.isActive ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="row.isActive ? t('admin.actions.deactivate') : t('admin.actions.activate')"
              :title="row.isActive ? t('admin.actions.deactivate') : t('admin.actions.activate')"
              :disabled="projects.saving.value"
              @click="() => { toggleFlag(row as ProjectRow, 'isActive') }"
            />
          </AdminRowActions>
        </template>
      </AdminResourceList>

      <AdminPagination
        v-model:page="filters.page"
        :per-page="filters.perPage"
        :total="projectTotal"
        :showing-label="t('admin.pagination.showing', {
          from: (filters.page - 1) * filters.perPage + 1,
          to: Math.min(filters.page * filters.perPage, projectTotal),
          total: projectTotal,
        })"
        :previous-label="t('admin.pagination.previous')"
        :next-label="t('admin.pagination.next')"
      />
    </template>

    <!-- Categories -->
    <template v-else>
      <AdminResourceList
        :columns="categoryColumns"
        :rows="categoryRows"
        :pending="categories.pending.value"
        :error="categories.error.value"
        :count-label="categoryRows.length ? t('admin.categories.projects') : undefined"
        :empty-title="t('admin.categories.emptyTitle')"
        :empty-description="t('admin.categories.emptyDescription')"
        @retry="() => { categories.refresh() }"
      >
        <template #empty-action>
          <UButton color="primary" icon="i-lucide-plus" @click="openCreateCategory">
            {{ t('admin.categories.create') }}
          </UButton>
        </template>

        <template #cell-name="{ row }">
          <span class="font-medium text-[var(--color-foreground)]">
            {{ pick(row.nameFa, row.nameEn) }}
          </span>
        </template>

        <template #cell-slug="{ row }">
          <code class="text-xs text-[var(--color-muted)]" dir="ltr">{{ row.slug }}</code>
        </template>

        <template #cell-projects="{ row }">
          {{ formatNumber(row.itemCount) }}
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
            :disable-down="index === categoryRows.length - 1"
            :busy="categories.saving.value"
            @edit="() => { openEditCategory(row as CategoryRow) }"
            @remove="() => { askDeleteCategory(row as CategoryRow) }"
            @up="() => { moveCategory(row as CategoryRow, -1) }"
            @down="() => { moveCategory(row as CategoryRow, 1) }"
          />
        </template>
      </AdminResourceList>
    </template>

    <!-- Project form -->
    <AdminFormModal
      v-model:open="projectModal"
      wide
      :title="editingProject ? t('admin.portfolio.editTitle') : t('admin.portfolio.createTitle')"
      :submit-label="projects.saving.value ? t('admin.actions.saving') : t('admin.actions.save')"
      :cancel-label="t('admin.actions.cancel')"
      :saving="projects.saving.value || loadingProject"
      :error-message="projectError"
      @submit="submitProject"
    >
      <AdminFormSection :title="t('admin.portfolio.sectionMain')">
        <AdminField :label="t('admin.fields.titleFa')" :errors="projectIssues.titleFa" required dir="rtl">
          <UInput v-model="projectForm.titleFa" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.titleEn')" :errors="projectIssues.titleEn" required dir="ltr">
          <UInput v-model="projectForm.titleEn" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.slug')"
          :hint="t('admin.fields.slugHint')"
          :errors="projectIssues.slug"
          required
          dir="ltr"
        >
          <UInput v-model="projectForm.slug" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.category')" :errors="projectIssues.categoryId" required>
          <USelect
            v-model="projectForm.categoryId"
            :items="categoryOptions"
            value-key="value"
            class="w-full"
          />
        </AdminField>
        <AdminField
          :label="t('admin.fields.descriptionFa')"
          :errors="projectIssues.descriptionFa"
          required
          dir="rtl"
        >
          <UTextarea v-model="projectForm.descriptionFa" :rows="4" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.descriptionEn')"
          :errors="projectIssues.descriptionEn"
          required
          dir="ltr"
        >
          <UTextarea v-model="projectForm.descriptionEn" :rows="4" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.coverImage')"
          :hint="t('admin.fields.imageHint')"
          :errors="projectIssues.coverImage"
          required
          dir="ltr"
        >
          <div class="flex items-center gap-2">
            <UInput v-model="projectForm.coverImage" class="flex-1" />
            <AdminThumb :src="projectForm.coverImage" />
          </div>
        </AdminField>
        <AdminField :label="t('admin.fields.year')" :errors="projectIssues.year">
          <UInputNumber v-model="projectForm.year" :min="1900" :max="2200" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.clientFa')" dir="rtl">
          <UInput v-model="projectForm.clientFa" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.clientEn')" dir="ltr">
          <UInput v-model="projectForm.clientEn" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.sortOrder')" :hint="t('admin.fields.sortOrderHint')">
          <UInputNumber v-model="projectForm.sortOrder" :min="0" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.status')">
          <div class="flex flex-wrap items-center gap-4">
            <USwitch v-model="projectForm.isActive" :label="t('admin.fields.active')" />
            <USwitch v-model="projectForm.isFeatured" :label="t('admin.fields.featured')" />
          </div>
        </AdminField>
      </AdminFormSection>

      <AdminFormSection
        :title="t('admin.portfolio.sectionGallery')"
        :description="t('admin.portfolio.galleryHint')"
      >
        <div class="sm:col-span-2">
          <AdminRepeatableList
            :items="projectForm.images"
            :add-label="t('admin.portfolio.addImage')"
            :remove-label="t('admin.actions.remove')"
            :up-label="t('admin.actions.moveUp')"
            :down-label="t('admin.actions.moveDown')"
            :max="30"
            @add="() => { projectForm.images.push({ image: '', altFa: '', altEn: '' }) }"
            @remove="(index: number) => { projectForm.images.splice(index, 1) }"
            @move="(from: number, to: number) => { projectForm.images.splice(to, 0, ...projectForm.images.splice(from, 1)) }"
          >
            <template #default="{ index }">
              <AdminField :label="t('admin.fields.image')" full dir="ltr">
                <div class="flex items-center gap-2">
                  <UInput v-model="projectForm.images[index]!.image" class="flex-1" />
                  <AdminThumb :src="projectForm.images[index]!.image" />
                </div>
              </AdminField>
              <AdminField :label="t('admin.fields.altFa')" dir="rtl">
                <UInput v-model="projectForm.images[index]!.altFa" class="w-full" />
              </AdminField>
              <AdminField :label="t('admin.fields.altEn')" dir="ltr">
                <UInput v-model="projectForm.images[index]!.altEn" class="w-full" />
              </AdminField>
            </template>
          </AdminRepeatableList>
        </div>
      </AdminFormSection>
    </AdminFormModal>

    <!-- Category form -->
    <AdminFormModal
      v-model:open="categoryModal"
      :title="editingCategory ? t('admin.categories.editTitle') : t('admin.categories.createTitle')"
      :submit-label="categories.saving.value ? t('admin.actions.saving') : t('admin.actions.save')"
      :cancel-label="t('admin.actions.cancel')"
      :saving="categories.saving.value"
      :error-message="categoryError"
      @submit="submitCategory"
    >
      <AdminFormSection :title="t('admin.categories.title')">
        <AdminField :label="t('admin.fields.nameFa')" :errors="categoryIssues.nameFa" required dir="rtl">
          <UInput v-model="categoryForm.nameFa" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.nameEn')" :errors="categoryIssues.nameEn" required dir="ltr">
          <UInput v-model="categoryForm.nameEn" class="w-full" />
        </AdminField>
        <AdminField
          :label="t('admin.fields.slug')"
          :hint="t('admin.fields.slugHint')"
          :errors="categoryIssues.slug"
          required
          dir="ltr"
        >
          <UInput v-model="categoryForm.slug" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.sortOrder')" :hint="t('admin.fields.sortOrderHint')">
          <UInputNumber v-model="categoryForm.sortOrder" :min="0" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.descriptionFa')" dir="rtl">
          <UTextarea v-model="categoryForm.descriptionFa" :rows="2" class="w-full" />
        </AdminField>
        <AdminField :label="t('admin.fields.descriptionEn')" dir="ltr">
          <UTextarea v-model="categoryForm.descriptionEn" :rows="2" class="w-full" />
        </AdminField>
      </AdminFormSection>
    </AdminFormModal>

    <!-- Delete project -->
    <AdminConfirmDialog
      :open="Boolean(deleteProject)"
      :title="t('admin.delete.title')"
      :message="t('admin.delete.portfolio', { name: deleteProject ? pick(deleteProject.titleFa, deleteProject.titleEn) : '' })"
      :consequences="[t('admin.delete.irreversible')]"
      :confirm-label="t('admin.actions.confirmDelete')"
      :cancel-label="t('admin.actions.cancel')"
      :loading="projects.saving.value"
      @update:open="(value: boolean) => { if (!value) deleteProject = null }"
      @confirm="confirmDeleteProject"
    />

    <!-- Delete category: blocked while projects reference it -->
    <AdminConfirmDialog
      :open="Boolean(deleteCategory)"
      :title="categoryBlocked ? t('admin.categories.inUseTitle') : t('admin.delete.title')"
      :message="categoryBlocked
        ? t('admin.categories.inUseDescription', {
          count: deleteCategory?.itemCount ?? 0,
          name: deleteCategory ? pick(deleteCategory.nameFa, deleteCategory.nameEn) : '',
        })
        : t('admin.delete.category', { name: deleteCategory ? pick(deleteCategory.nameFa, deleteCategory.nameEn) : '' })"
      :consequences="categoryBlocked ? [] : [t('admin.delete.irreversible')]"
      :confirm-label="categoryBlocked ? t('admin.categories.moveAndDelete') : t('admin.actions.confirmDelete')"
      :cancel-label="t('admin.actions.cancel')"
      :loading="categories.saving.value"
      @update:open="(value: boolean) => { if (!value) deleteCategory = null }"
      @confirm="confirmDeleteCategory"
    >
      <div v-if="categoryBlocked" class="pt-2">
        <UFormField :label="t('admin.categories.moveTo')">
          <USelect
            v-model="moveToCategory"
            :items="moveTargets"
            value-key="value"
            class="w-full"
          />
        </UFormField>
      </div>
    </AdminConfirmDialog>
  </div>
</template>
