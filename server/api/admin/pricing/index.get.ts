import { adminListPricingRows } from '../../../repositories/admin.repository'
import { listQuerySchema } from '../../../utils/admin-schemas'

export default defineEventHandler(async (event) => {
  const query = listQuerySchema.parse(getQuery(event))
  return { items: await adminListPricingRows(query) }
})
