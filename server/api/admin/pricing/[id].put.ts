import { adminUpdatePricingRow } from '../../../repositories/admin.repository'
import { pricingRowInputSchema } from '../../../utils/admin-schemas'
import { readValidatedBodyOrThrow, uuidSchema, validateParam } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const id = validateParam(getRouterParam(event, 'id'), uuidSchema, 'id')
  const input = await readValidatedBodyOrThrow(event, pricingRowInputSchema)
  return await adminUpdatePricingRow(id, input)
})
