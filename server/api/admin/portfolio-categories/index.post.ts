import { adminCreatePortfolioCategory } from '../../../repositories/admin.repository'
import { portfolioCategoryInputSchema } from '../../../utils/admin-schemas'
import { readValidatedBodyOrThrow } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const input = await readValidatedBodyOrThrow(event, portfolioCategoryInputSchema)
  const result = await adminCreatePortfolioCategory(input)
  setResponseStatus(event, 201)
  return result
})
