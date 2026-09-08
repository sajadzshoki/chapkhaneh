import { adminUpdatePortfolioItem } from '../../../repositories/admin.repository'
import { portfolioItemInputSchema } from '../../../utils/admin-schemas'
import { readValidatedBodyOrThrow, uuidSchema, validateParam } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const id = validateParam(getRouterParam(event, 'id'), uuidSchema, 'id')
  const input = await readValidatedBodyOrThrow(event, portfolioItemInputSchema)
  return await adminUpdatePortfolioItem(id, input)
})
