import type { FetchError } from 'ofetch'

/**
 * ---------------------------------------------------------------------------
 * Admin CRUD plumbing
 * ---------------------------------------------------------------------------
 * Every management screen needs the same six things: fetch a list, create,
 * update, delete, toggle a flag, and reorder — each with a toast, a refresh and
 * a friendly error. Doing that once here keeps the pages declarative and means
 * a fix (say, to session-expiry handling) applies everywhere at once.
 */

export interface FieldIssues { [field: string]: string[] | undefined }

export interface AdminError {
  /** Message safe to show the operator, already localized. */
  message: string
  /** Per-field messages from a 422, for inline display. */
  issues: FieldIssues
  status: number
}

/**
 * Turns any thrown value into a localized message plus field issues.
 *
 * The server deliberately hides internals on 5xx, so anything unrecognised
 * becomes a generic message rather than leaking a stack or a query.
 */
export function useAdminError() {
  const { t } = useI18n()

  return function normalize(error: unknown): AdminError {
    const fetchError = error as FetchError | undefined
    const status = fetchError?.statusCode ?? 0
    const data = fetchError?.data as
      | { message?: string, statusMessage?: string, data?: { issues?: FieldIssues } }
      | undefined

    const issues = data?.data?.issues ?? {}

    if (status === 0) return { message: t('admin.states.networkError'), issues, status }
    if (status === 401) return { message: t('admin.states.unauthorized'), issues, status }
    if (status === 404) return { message: t('admin.states.notFound'), issues, status }
    if (status === 422) return { message: t('admin.states.validationFailed'), issues, status }
    if (status >= 500) return { message: t('admin.states.genericError'), issues, status }

    // 400/409 and friends carry a meaningful statusMessage from our own routes.
    return {
      message: data?.message || data?.statusMessage || t('admin.states.genericError'),
      issues,
      status,
    }
  }
}

interface ResourceOptions<TList> {
  /** API path without `/api/admin/`, e.g. `services`. */
  endpoint: string
  /** Reactive query object merged into every list request. */
  query?: Ref<Record<string, unknown>>
  /** useAsyncData key — must be stable and unique per screen. */
  key: string
  transform?: (raw: TList) => TList
}

export function useAdminResource<TList>(options: ResourceOptions<TList>) {
  const { t } = useI18n()
  const toast = useToast()
  const normalize = useAdminError()
  const base = `/api/admin/${options.endpoint}`

  // useAsyncData rather than useFetch: it keeps the previous rows visible while
  // a new page or filter loads, so the table does not collapse and the layout
  // does not jump between requests.
  const { data, pending, error, refresh } = useAsyncData(
    options.key,
    () => $fetch<TList>(base, {
      query: options.query?.value,
      headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
    }),
    { watch: options.query ? [options.query] : [] },
  )

  /** Guards against double submission and surfaces one toast per outcome. */
  const saving = ref(false)

  async function run<T>(
    fn: () => Promise<T>,
    successMessage: string,
  ): Promise<{ ok: true, data: T } | { ok: false, error: AdminError }> {
    if (saving.value) return { ok: false, error: { message: '', issues: {}, status: 0 } }
    saving.value = true

    try {
      const result = await fn()
      await refresh()
      toast.add({ title: successMessage, color: 'success', icon: 'i-lucide-check' })
      return { ok: true, data: result }
    }
    catch (caught) {
      const normalized = normalize(caught)
      toast.add({
        title: normalized.message,
        color: 'danger',
        icon: 'i-lucide-triangle-alert',
      })
      return { ok: false, error: normalized }
    }
    finally {
      saving.value = false
    }
  }

  return {
    data,
    pending,
    error,
    refresh,
    saving: readonly(saving),

    create: (body: Record<string, unknown>) =>
      run(() => $fetch(base, { method: 'POST', body }), t('admin.toast.created')),

    update: (id: string, body: Record<string, unknown>) =>
      run(() => $fetch(`${base}/${id}`, { method: 'PUT', body }), t('admin.toast.updated')),

    remove: (id: string, query?: Record<string, string>) =>
      run(() => $fetch(`${base}/${id}`, { method: 'DELETE', query }), t('admin.toast.deleted')),

    setActive: (id: string, isActive: boolean) =>
      run(
        () => $fetch(`${base}/${id}/active`, { method: 'PATCH', body: { isActive } }),
        isActive ? t('admin.toast.activated') : t('admin.toast.deactivated'),
      ),

    patch: (path: string, body: Record<string, unknown>, message?: string) =>
      run(
        () => $fetch(`${base}/${path}`, { method: 'PATCH', body }),
        message ?? t('admin.toast.updated'),
      ),

    reorder: (ids: string[]) =>
      run(
        () => $fetch(`${base}/reorder`, { method: 'POST', body: { ids } }),
        t('admin.toast.reordered'),
      ),
  }
}

/**
 * Filter state that plays well with pagination.
 *
 * Any change to a filter resets the page to 1 — otherwise a narrower search
 * can leave the operator stranded on an empty page 4.
 */
export function useAdminFilters<T extends Record<string, unknown>>(initial: T) {
  const filters = reactive({ ...initial, page: 1 }) as T & { page: number }

  watch(
    () => Object.entries(filters)
      .filter(([key]) => key !== 'page')
      .map(([, value]) => value),
    () => { filters.page = 1 },
  )

  function reset() {
    Object.assign(filters, initial, { page: 1 })
  }

  const query = computed(() => ({ ...filters }))

  return { filters, query, reset }
}

/** Moves an item within a list and returns the new id order, or null at the edge. */
export function reorderIds<T extends { id: string }>(
  rows: readonly T[],
  id: string,
  direction: -1 | 1,
): string[] | null {
  const index = rows.findIndex(row => row.id === id)
  const target = index + direction

  if (index === -1 || target < 0 || target >= rows.length) return null

  const ids = rows.map(row => row.id)
  const [moved] = ids.splice(index, 1)
  ids.splice(target, 0, moved!)
  return ids
}
