import { adminCreateEquipment } from '../../../repositories/admin.repository'
import { equipmentInputSchema } from '../../../utils/admin-schemas'
import { readValidatedBodyOrThrow } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const input = await readValidatedBodyOrThrow(event, equipmentInputSchema)
  const result = await adminCreateEquipment(input)
  setResponseStatus(event, 201)
  return result
})
