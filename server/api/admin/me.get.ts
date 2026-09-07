import { requireAdmin } from '../../utils/session'

/** Session check used by the admin middleware and header. */
export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  return { user }
})
