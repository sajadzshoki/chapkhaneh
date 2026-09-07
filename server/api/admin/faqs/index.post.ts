import { adminCreateFaq } from '../../../repositories/admin.repository'
import { faqInputSchema } from '../../../utils/admin-schemas'
import { readValidatedBodyOrThrow } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const input = await readValidatedBodyOrThrow(event, faqInputSchema)
  const result = await adminCreateFaq(input)
  setResponseStatus(event, 201)
  return result
})
