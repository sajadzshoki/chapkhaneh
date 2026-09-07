import { adminUpdateQuoteStatus } from '../../../repositories/admin.repository'
import { quoteStatusUpdateSchema } from '../../../utils/admin-schemas'
import { readValidatedBodyOrThrow, uuidSchema, validateParam } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const id = validateParam(getRouterParam(event, 'id'), uuidSchema, 'id')
  const { status, internalNote } = await readValidatedBodyOrThrow(event, quoteStatusUpdateSchema)
  return await adminUpdateQuoteStatus(id, status, internalNote)
})
