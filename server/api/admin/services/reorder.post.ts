import { adminReorderServices } from '../../../repositories/admin.repository'
import { reorderSchema } from '../../../utils/admin-schemas'
import { readValidatedBodyOrThrow } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const { ids } = await readValidatedBodyOrThrow(event, reorderSchema)
  await adminReorderServices(ids)
  return { ok: true }
})
