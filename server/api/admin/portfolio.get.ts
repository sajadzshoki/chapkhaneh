import { listPortfolioItems } from '../../repositories/content.repository'

export default defineEventHandler(async () => ({ items: await listPortfolioItems() }))
