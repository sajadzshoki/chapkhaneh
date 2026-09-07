import { z } from 'zod'
import { adminSetPortfolioFlags } from '../../../../repositories/admin.repository'
import { readValidatedBodyOrThrow, uuidSchema, validateParam } from '../../../../utils/validation'

const flagsSchema = z.object({
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
}).refine(v => v.isActive !== undefined || v.isFeatured !== undefined, 'Nothing to update')

export default defineEventHandler(async (event) => {
  const id = validateParam(getRouterParam(event, 'id'), uuidSchema, 'id')
  const flags = await readValidatedBodyOrThrow(event, flagsSchema)
  return await adminSetPortfolioFlags(id, flags)
})
