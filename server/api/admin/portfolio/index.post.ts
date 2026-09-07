import { adminCreatePortfolioItem } from '../../../repositories/admin.repository'
import { portfolioItemInputSchema } from '../../../utils/admin-schemas'
import { readValidatedBodyOrThrow } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const input = await readValidatedBodyOrThrow(event, portfolioItemInputSchema)
  const result = await adminCreatePortfolioItem(input)
  setResponseStatus(event, 201)
  return result
})
