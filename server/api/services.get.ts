import { listServices } from '../repositories/content.repository'

/** Public service list — active services only, public fields only. */
export default defineEventHandler(async () => await listServices({ activeOnly: true }))
