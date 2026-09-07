import { listQuoteRequests } from '../../repositories/content.repository'

export default defineEventHandler(async () => ({ items: await listQuoteRequests({ limit: 100 }) }))
