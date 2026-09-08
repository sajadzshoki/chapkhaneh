import { z } from 'zod'
import { adminSetEquipmentActive } from '../../../../repositories/admin.repository'
import { readValidatedBodyOrThrow, uuidSchema, validateParam } from '../../../../utils/validation'

export default defineEventHandler(async (event) => {
  const id = validateParam(getRouterParam(event, 'id'), uuidSchema, 'id')
  const { isActive } = await readValidatedBodyOrThrow(event, z.object({ isActive: z.boolean() }))
  return await adminSetEquipmentActive(id, isActive)
})
