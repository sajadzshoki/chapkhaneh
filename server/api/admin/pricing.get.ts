import { listPricingGroups } from '../../repositories/content.repository'

export default defineEventHandler(async () => ({ groups: await listPricingGroups() }))
