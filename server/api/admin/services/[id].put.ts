import { adminUpdateService } from '../../../repositories/admin.repository'
import { serviceInputSchema } from '../../../utils/admin-schemas'
import { readValidatedBodyOrThrow, uuidSchema, validateParam } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const id = validateParam(getRouterParam(event, 'id'), uuidSchema, 'id')
  const input = await readValidatedBodyOrThrow(event, serviceInputSchema)
  return await adminUpdateService(id, input)
})
