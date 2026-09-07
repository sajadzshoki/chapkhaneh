<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
defineI18nRoute(false)

/**
 * Quote requests are customer submissions, not site content — they are read,
 * triaged and eventually deleted, so this screen offers status management
 * rather than full CRUD. Nothing here can create or rewrite a request.
 */
const { t } = useI18n()
const pick = useAdminLocalized()
const { formatNumber, formatDate } = useAdminFormat()
useHead({ title: () => `${t('admin.quotes.title')} — ${t('admin.brand')}` })

const STATUSES = ['NEW', 'REVIEWING', 'CONTACTED', 'COMPLETED'] as const
type Status = typeof STATUSES[number]

/** Kept in sync with the public-facing badge colours from phase 3. */
const STATUS_COLORS: Record<Status, 'primary' | 'warning' | 'accent' | 'success'> = {
  NEW: 'primary',
  REVIEWING: 'warning',
  CONTACTED: 'accent',
  COMPLETED: 'success',
}

interface QuoteRow {
  id: string
  fullName: string
  company: string | null
  phone: string
  email: string | null
  quantity: number | null
  status: Status
  createdAt: string
  serviceTitleFa: string | null
  serviceTitleEn: string | null
}

interface QuoteDetail {
  id: string
  fullName: string
  company: string | null
  phone: string
  email: string | null
  quantity: number | null
  description: string | null
  neededBy: string | null
  fileName: string | null
  hasFile: boolean
  status: Status
  internalNote: string | null
  serviceTitle: { fa: string, en: string } | null
  createdAt: string
}

const { filters, query, reset } = useAdminFilters({ search: '', status: 'all', perPage: 20 })

const resource = useAdminResource<{ items: QuoteRow[], total: number }>({
  endpoint: 'quote-requests',
  key: 'admin-quote-requests',
  query,
})

const rows = computed(() => resource.data.value?.items ?? [])
const total = computed(() => resource.data.value?.total ?? 0)
const isFiltered = computed(() => Boolean(filters.search) || filters.status !== 'all')

/* --------------------------------- Detail -------------------------------- */

const detailOpen = ref(false)
const detail = ref<QuoteDetail | null>(null)
const detailLoading = ref(false)
const detailError = ref('')
const draftStatus = ref<Status>('NEW')
const draftNote = ref('')

async function openDetail(id: string) {
  detailOpen.value = true
  detailLoading.value = true
  detailError.value = ''
  detail.value = null

  try {
    const data = await $fetch<QuoteDetail>(`/api/admin/quote-requests/${id}`)
    detail.value = data
    draftStatus.value = data.status
    draftNote.value = data.internalNote ?? ''
  }
  catch {
    detailError.value = t('admin.states.notFound')
  }
  finally {
    detailLoading.value = false
  }
}

async function saveStatus() {
  if (!detail.value) return
  const result = await resource.patch(
    detail.value.id,
    { status: draftStatus.value, internalNote: draftNote.value || null },
    t('admin.toast.statusUpdated'),
  )
  if (result.ok) detailOpen.value = false
}

/** Inline status change straight from the table, for quick triage. */
async function setRowStatus(row: QuoteRow, status: Status) {
  if (status === row.status) return
  await resource.patch(row.id, { status }, t('admin.toast.statusUpdated'))
}

/* --------------------------------- Delete -------------------------------- */

const deleteTarget = ref<QuoteRow | null>(null)

async function confirmDelete() {
  if (!deleteTarget.value) return
  const result = await resource.remove(deleteTarget.value.id)
  if (result.ok) {
    deleteTarget.value = null
    detailOpen.value = false
  }
}

const columns = computed(() => [
  { key: 'customer', label: t('admin.quotes.customer') },
  { key: 'phone', label: t('admin.quotes.phone'), hideOnMobile: true },
  { key: 'service', label: t('admin.quotes.service'), hideOnMobile: true },
  { key: 'status', label: t('admin.fields.status') },
  { key: 'created', label: t('admin.quotes.submitted'), hideOnMobile: true },
  { key: 'actions', label: '', numeric: true },
])

const statusOptions = computed(() =>
  STATUSES.map(status => ({ value: status, label: t(`admin.quotes.statuses.${status}`) })))

const statusFilterOptions = computed(() => [
  { value: 'all', label: t('admin.filters.allStatuses') },
  ...statusOptions.value,
])
</script>

<template>
  <div>
    <AdminPageHeader
      :title="t('admin.quotes.title')"
      :description="t('admin.quotes.description')"
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
        v-model="filters.status"
        :items="statusFilterOptions"
        value-key="value"
        class="w-48"
        :aria-label="t('admin.fields.status')"
      />
    </AdminFilterBar>

    <AdminResourceList
      :columns="columns"
      :rows="rows"
      :pending="resource.pending.value"
      :error="resource.error.value"
      :filtered="isFiltered"
      :count-label="total ? t('admin.quotes.count', { count: total }) : undefined"
      :empty-title="t('admin.quotes.emptyTitle')"
      :empty-description="t('admin.quotes.emptyDescription')"
      @retry="() => { resource.refresh() }"
    >
      <template #cell-customer="{ row }">
        <div class="min-w-0">
          <p class="truncate font-medium text-[var(--color-foreground)]">
            {{ row.fullName }}
          </p>
          <p v-if="row.company" class="truncate text-xs text-[var(--color-muted)]">
            {{ row.company }}
          </p>
        </div>
      </template>

      <template #cell-phone="{ row }">
        <a :href="`tel:${row.phone}`" class="hover:underline" dir="ltr">{{ row.phone }}</a>
      </template>

      <template #cell-service="{ row }">
        {{ row.serviceTitleFa
          ? pick(row.serviceTitleFa, row.serviceTitleEn)
          : t('admin.quotes.noService') }}
      </template>

      <template #cell-status="{ row }">
        <UBadge :color="STATUS_COLORS[row.status as Status]" variant="subtle" size="sm">
          {{ t(`admin.quotes.statuses.${row.status}`) }}
        </UBadge>
      </template>

      <template #cell-created="{ row }">
        {{ formatDate(row.createdAt) }}
      </template>

      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end gap-1">
          <USelect
            :model-value="row.status"
            :items="statusOptions"
            value-key="value"
            size="xs"
            class="w-36"
            :aria-label="t('admin.quotes.changeStatus')"
            :disabled="resource.saving.value"
            @update:model-value="(value: string) => { setRowStatus(row as QuoteRow, value as Status) }"
          />
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            square
            icon="i-lucide-eye"
            :aria-label="t('admin.actions.view')"
            :title="t('admin.actions.view')"
            @click="() => { openDetail(row.id) }"
          />
          <UButton
            color="danger"
            variant="ghost"
            size="xs"
            square
            icon="i-lucide-trash-2"
            :aria-label="t('admin.actions.delete')"
            :title="t('admin.actions.delete')"
            :disabled="resource.saving.value"
            @click="() => { deleteTarget = row as QuoteRow }"
          />
        </div>
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

    <!-- Detail -->
    <UModal
      v-model:open="detailOpen"
      :title="t('admin.quotes.detailTitle')"
      :ui="{ content: 'sm:max-w-2xl' }"
    >
      <template #body>
        <div v-if="detailLoading" class="space-y-3" aria-busy="true">
          <div v-for="i in 6" :key="i" class="h-6 animate-pulse rounded bg-[var(--color-surface-muted)]" />
        </div>

        <UAlert
          v-else-if="detailError"
          color="danger"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          :description="detailError"
        />

        <div v-else-if="detail" class="space-y-5">
          <dl class="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt class="text-xs text-[var(--color-muted)]">
                {{ t('admin.quotes.customer') }}
              </dt>
              <dd class="font-medium">
                {{ detail.fullName }}
              </dd>
            </div>
            <div v-if="detail.company">
              <dt class="text-xs text-[var(--color-muted)]">
                {{ t('admin.quotes.company') }}
              </dt>
              <dd>{{ detail.company }}</dd>
            </div>
            <div>
              <dt class="text-xs text-[var(--color-muted)]">
                {{ t('admin.quotes.phone') }}
              </dt>
              <dd dir="ltr">
                <a :href="`tel:${detail.phone}`" class="hover:underline">{{ detail.phone }}</a>
              </dd>
            </div>
            <div v-if="detail.email">
              <dt class="text-xs text-[var(--color-muted)]">
                {{ t('admin.quotes.email') }}
              </dt>
              <dd dir="ltr">
                <a :href="`mailto:${detail.email}`" class="hover:underline">{{ detail.email }}</a>
              </dd>
            </div>
            <div>
              <dt class="text-xs text-[var(--color-muted)]">
                {{ t('admin.quotes.service') }}
              </dt>
              <dd>
                {{ detail.serviceTitle
                  ? pick(detail.serviceTitle.fa, detail.serviceTitle.en)
                  : t('admin.quotes.noService') }}
              </dd>
            </div>
            <div v-if="detail.quantity">
              <dt class="text-xs text-[var(--color-muted)]">
                {{ t('admin.quotes.quantity') }}
              </dt>
              <dd class="tabular">
                {{ formatNumber(detail.quantity) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-[var(--color-muted)]">
                {{ t('admin.quotes.submitted') }}
              </dt>
              <dd>{{ formatDate(detail.createdAt) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-[var(--color-muted)]">
                {{ t('admin.quotes.attachment') }}
              </dt>
              <dd>
                <!-- Only the original file name is shown; the download goes
                     through an API route so the storage path is never exposed. -->
                <UButton
                  v-if="detail.hasFile"
                  :to="`/api/admin/quote-requests/${detail.id}/file`"
                  external
                  target="_blank"
                  color="neutral"
                  variant="outline"
                  size="xs"
                  icon="i-lucide-download"
                >
                  {{ detail.fileName || t('admin.actions.download') }}
                </UButton>
                <span v-else class="text-[var(--color-muted)]">
                  {{ t('admin.quotes.noAttachment') }}
                </span>
              </dd>
            </div>
          </dl>

          <div v-if="detail.description">
            <p class="mb-1 text-xs text-[var(--color-muted)]">
              {{ t('admin.quotes.message') }}
            </p>
            <p class="whitespace-pre-line rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] p-3 text-sm">
              {{ detail.description }}
            </p>
          </div>

          <div class="grid gap-4 border-t border-[var(--color-border)] pt-4 sm:grid-cols-2">
            <UFormField :label="t('admin.quotes.changeStatus')">
              <USelect
                v-model="draftStatus"
                :items="statusOptions"
                value-key="value"
                class="w-full"
              />
            </UFormField>
            <UFormField
              :label="t('admin.quotes.internalNote')"
              :help="t('admin.quotes.internalNoteHint')"
            >
              <UTextarea v-model="draftNote" :rows="3" class="w-full" />
            </UFormField>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="outline" @click="() => { detailOpen = false }">
            {{ t('admin.actions.close') }}
          </UButton>
          <UButton
            color="primary"
            :loading="resource.saving.value"
            :disabled="!detail || resource.saving.value"
            @click="saveStatus"
          >
            {{ t('admin.actions.save') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <AdminConfirmDialog
      :open="Boolean(deleteTarget)"
      :title="t('admin.delete.title')"
      :message="t('admin.delete.quote', { name: deleteTarget?.fullName ?? '' })"
      :consequences="[t('admin.delete.irreversible')]"
      :confirm-label="t('admin.actions.confirmDelete')"
      :cancel-label="t('admin.actions.cancel')"
      :loading="resource.saving.value"
      @update:open="(value: boolean) => { if (!value) deleteTarget = null }"
      @confirm="confirmDelete"
    />
  </div>
</template>
