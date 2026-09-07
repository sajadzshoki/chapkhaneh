import type { NitroErrorHandler } from 'nitropack'

/**
 * Custom Nitro error handler for `/api/**`.
 *
 * Nitro's production handler already hides stacks, but its development handler
 * returns them. Registering this makes the API contract identical in both
 * modes, so what is tested in dev is what ships:
 *
 *   - 5xx  -> generic message, nothing about the cause, full server-side log
 *   - 4xx  -> the explicit statusMessage plus any validation `data.issues`
 *
 * Non-API routes fall through to Nitro's default handler, which renders the
 * normal HTML error page for the public site.
 */
const handler: NitroErrorHandler = async function apiErrorHandler(error, event) {
  const path = event.path ?? ''

  if (!path.startsWith('/api/')) {
    // Let Nuxt render its own error page for page routes.
    return
  }

  const statusCode = error.statusCode || 500
  const isServerError = statusCode >= 500

  if (isServerError) {
    console.error(`[api] ${event.method} ${path} -> ${statusCode}:`, error)
  }

  setResponseStatus(event, statusCode)
  setResponseHeaders(event, {
    'content-type': 'application/json',
    'x-content-type-options': 'nosniff',
    'cache-control': 'no-store',
  })

  const body: Record<string, unknown> = {
    error: true,
    statusCode,
    statusMessage: isServerError
      ? 'Internal server error'
      : (error.statusMessage || 'Request failed'),
    message: isServerError
      ? 'An unexpected error occurred. Please try again later.'
      : (error.statusMessage || error.message || 'Request failed'),
  }

  // Field-level validation issues are safe and useful to the client.
  const data = error.data as { issues?: unknown } | undefined
  if (!isServerError && data?.issues) {
    body.data = { issues: data.issues }
  }

  return send(event, JSON.stringify(body))
}

export default handler
