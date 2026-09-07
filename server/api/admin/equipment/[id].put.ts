import { adminUpdateEquipment } from '../../../repositories/admin.repository'
import { equipmentInputSchema } from '../../../utils/admin-schemas'
import { readValidatedBodyOrThrow, uuidSchema, validateParam } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const id = validateParam(getRouterParam(event, 'id'), uuidSchema, 'id')
  const input = await readValidatedBodyOrThrow(event, equipmentInputSchema)
  return await adminUpdateEquipment(id, input)
})
