import { defineStore } from 'pinia'
import type { FetchError } from 'ofetch'

export type QuoteSubmitState = 'idle' | 'submitting' | 'success' | 'error'

export interface QuoteSubmitPayload {
  fullName: string
  company?: string
  phone: string
  email?: string
  serviceSlug: string
  quantity?: number | null
  description: string
  neededBy?: string
  locale: string
}

/**
 * Quote request store.
 *
 * Shared state because the "Request a quote" CTA appears in the header, hero
 * and several page footers, and each can pre-select a service before the
 * customer reaches the form.
 *
 * It also owns submission, so the in-flight guard lives in exactly one place:
 * a second `submit()` while one is running is refused outright, which stops a
 * double click or an impatient retry creating two requests.
 */
export const useQuoteStore = defineStore('quote', () => {
  const preselectedService = ref<string | null>(null)
  const state = ref<QuoteSubmitState>('idle')
  /** Per-field messages returned by the server, keyed by field name. */
  const fieldIssues = ref<Record<string, string[]>>({})
  /** Stable error code the page maps to a translated message. */
  const errorCode = ref<string | null>(null)

  function preselectService(slug: string | null) {
    preselectedService.value = slug
  }

  async function submit(payload: QuoteSubmitPayload, file: File | null): Promise<boolean> {
    // Hard guard against concurrent submissions.
    if (state.value === 'submitting') return false

    state.value = 'submitting'
    fieldIssues.value = {}
    errorCode.value = null

    // Always multipart: one request shape whether or not a file is attached.
    const form = new FormData()
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined && value !== null && value !== '') {
        form.append(key, String(value))
      }
    }
    if (file) form.append('file', file, file.name)

    try {
      await $fetch('/api/quote-requests', { method: 'POST', body: form })
      state.value = 'success'
      return true
    }
    catch (caught) {
      const error = caught as FetchError
      const data = error.data as { data?: { issues?: Record<string, string[]> } } | undefined

      fieldIssues.value = data?.data?.issues ?? {}
      errorCode.value = error.statusCode === 429
        ? 'rateLimited'
        : error.statusCode === 422 ? 'validation' : 'generic'

      state.value = 'error'
      return false
    }
  }

  function reset() {
    state.value = 'idle'
    fieldIssues.value = {}
    errorCode.value = null
  }

  return {
    preselectedService,
    state,
    fieldIssues,
    errorCode,
    preselectService,
    submit,
    reset,
  }
})
