/**
 * ---------------------------------------------------------------------------
 * Notification hook
 * ---------------------------------------------------------------------------
 * The extension point for telling the sales team a request arrived.
 *
 * This phase deliberately ships **no** delivery mechanism: wiring an email
 * provider would mean credentials, a sending domain and bounce handling, none
 * of which belong in this phase. Rather than fake a send, the hook records the
 * event to the server log and returns.
 *
 * The call site in `quote.service.ts` already awaits this function and shields
 * the request from its failures, so adding real delivery later is a change to
 * this file alone — no route, service or schema needs to move.
 *
 * To implement delivery later:
 *   1. Add the provider credentials to `runtimeConfig` and `.env.example`.
 *   2. Replace the body of `deliver()` with the provider call.
 *   3. Keep the try/catch: a failed notification must never fail the request.
 */

export interface QuoteRequestNotification {
  id: string
  fullName: string
  phone: string
  serviceSlug: string
  hasAttachment: boolean
}

/** Current no-op implementation: structured log line, nothing sent. */
async function deliver(payload: QuoteRequestNotification): Promise<void> {
  console.info(
    '[quote-request] created',
    JSON.stringify({
      id: payload.id,
      service: payload.serviceSlug,
      hasAttachment: payload.hasAttachment,
    }),
  )
}

/**
 * Announces a new quote request.
 *
 * Never throws: the customer's submission has already been persisted by the
 * time this runs, so a notification failure must not turn a successful request
 * into an error response.
 */
export async function notifyQuoteRequestCreated(
  payload: QuoteRequestNotification,
): Promise<void> {
  try {
    await deliver(payload)
  }
  catch (error) {
    console.error('[quote-request] notification failed:', error)
  }
}
