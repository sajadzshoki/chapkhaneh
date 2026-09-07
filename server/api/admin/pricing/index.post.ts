import { adminCreatePricingRow } from '../../../repositories/admin.repository'
import { pricingRowInputSchema } from '../../../utils/admin-schemas'
import { readValidatedBodyOrThrow } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const input = await readValidatedBodyOrThrow(event, pricingRowInputSchema)
  const result = await adminCreatePricingRow(input)
  setResponseStatus(event, 201)
  return result
})
