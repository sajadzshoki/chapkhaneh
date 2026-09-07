import { adminServiceDeleteImpact } from '../../../../repositories/admin.repository'
import { uuidSchema, validateParam } from '../../../../utils/validation'

/** Powers the delete dialog: how many rows the cascade would remove. */
export default defineEventHandler(async (event) => {
  const id = validateParam(getRouterParam(event, 'id'), uuidSchema, 'id')
  return await adminServiceDeleteImpact(id)
})
