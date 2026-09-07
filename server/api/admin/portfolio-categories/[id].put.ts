import { adminUpdatePortfolioCategory } from '../../../repositories/admin.repository'
import { portfolioCategoryInputSchema } from '../../../utils/admin-schemas'
import { readValidatedBodyOrThrow, uuidSchema, validateParam } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const id = validateParam(getRouterParam(event, 'id'), uuidSchema, 'id')
  const input = await readValidatedBodyOrThrow(event, portfolioCategoryInputSchema)
  return await adminUpdatePortfolioCategory(id, input)
})
