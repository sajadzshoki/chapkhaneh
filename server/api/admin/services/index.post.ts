import { adminCreateService } from '../../../repositories/admin.repository'
import { serviceInputSchema } from '../../../utils/admin-schemas'
import { readValidatedBodyOrThrow } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const input = await readValidatedBodyOrThrow(event, serviceInputSchema)
  const result = await adminCreateService(input)
  setResponseStatus(event, 201)
  return result
})
