import { adminDeleteQuoteRequest } from '../../../repositories/admin.repository'
import { uuidSchema, validateParam } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const id = validateParam(getRouterParam(event, 'id'), uuidSchema, 'id')
  return await adminDeleteQuoteRequest(id)
})
