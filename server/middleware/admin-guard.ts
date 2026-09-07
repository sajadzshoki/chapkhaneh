import { getAdminSession } from '../utils/session'

/**
 * Server-side guard for the admin API surface.
 *
 * Applying this centrally means a new `/api/admin/*` route is protected by
 * default — a route author cannot forget to add a check. `login` and `logout`
 * are the only public entry points.
 */
const PUBLIC_ADMIN_ROUTES = new Set([
  '/api/admin/login',
  '/api/admin/logout',
])

export default defineEventHandler((event) => {
  const path = event.path?.split('?')[0] ?? ''

  if (!path.startsWith('/api/admin/')) return
  if (PUBLIC_ADMIN_ROUTES.has(path)) return

  if (!getAdminSession(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
})
