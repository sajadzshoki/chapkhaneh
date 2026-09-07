import { adminDeletePortfolioCategory } from '../../../repositories/admin.repository'
import { uuidSchema, validateParam } from '../../../utils/validation'

/**
 * Accepts an optional `?moveTo=<categoryId>` so the admin can reassign the
 * category's projects instead of being blocked by the RESTRICT constraint.
 */
export default defineEventHandler(async (event) => {
  const id = validateParam(getRouterParam(event, 'id'), uuidSchema, 'id')
  const moveToRaw = getQuery(event).moveTo
  const moveTo = typeof moveToRaw === 'string' && moveToRaw
    ? validateParam(moveToRaw, uuidSchema, 'moveTo')
    : undefined

  return await adminDeletePortfolioCategory(id, moveTo)
})
