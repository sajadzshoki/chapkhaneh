import { listServices } from '../../repositories/content.repository'

export default defineEventHandler(async () => ({ items: await listServices() }))
