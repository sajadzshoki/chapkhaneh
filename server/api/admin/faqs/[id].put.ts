import { adminUpdateFaq } from '../../../repositories/admin.repository'
import { faqInputSchema } from '../../../utils/admin-schemas'
import { readValidatedBodyOrThrow, uuidSchema, validateParam } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const id = validateParam(getRouterParam(event, 'id'), uuidSchema, 'id')
  const input = await readValidatedBodyOrThrow(event, faqInputSchema)
  return await adminUpdateFaq(id, input)
})
