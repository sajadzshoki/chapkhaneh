import { defineStore } from 'pinia'
import type { QuoteRequestInput } from '~~/shared/types'

export type QuoteSubmitState = 'idle' | 'submitting' | 'success' | 'error'

/**
 * Quote request store.
 *
 * Useful as shared state because the "Request a quote" CTA appears in the
 * header, hero and several CTA sections, and each of them can pre-select a
 * service before the user reaches the form.
 */
export const useQuoteStore = defineStore('quote', () => {
  const preselectedService = ref<string | null>(null)
  const state = ref<QuoteSubmitState>('idle')
  const errorMessage = ref<string | null>(null)

  function preselectService(slug: string | null) {
    preselectedService.value = slug
  }

  async function submit(payload: QuoteRequestInput) {
    state.value = 'submitting'
    errorMessage.value = null
    try {
      await $fetch('/api/quote-requests', { method: 'POST', body: payload })
      state.value = 'success'
      return true
    }
    catch (error) {
      state.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : 'unknown_error'
      return false
    }
  }

  function reset() {
    state.value = 'idle'
    errorMessage.value = null
  }

  return { preselectedService, state, errorMessage, preselectService, submit, reset }
})
